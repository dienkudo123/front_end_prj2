import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "../styles/PostDetail.css";
import { AiOutlineMessage } from 'react-icons/ai';
import { useUser } from "../context/UserContext";
import axiosInstance from "../utils/api";

const API_BASE_URL = "http://localhost:3000";

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastCommentRef = useRef(null);
  const { user } = useUser();

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axiosInstance.get(`${API_BASE_URL}/post/${id}`);
        setPost(response.data.data);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  useEffect(() => {
    if (lastCommentRef.current) {
      lastCommentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);

  const getUser = async (userId) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/user/${userId}`);
      return response;
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axiosInstance.get(`${API_BASE_URL}/comment/post-comments?postId=${id}`);
        const data = response.data.data;

        const formattedComments = await Promise.all(
            data.map(async (comment) => {
              const userRes = await getUser(comment.userId);
              const userData = userRes.data.data;
              return {
                id: comment.id,
                userId: comment.userId,
                displayName: userData.displayName,
                avatar: userData.avatar,
                text: comment.content,
              };
            })
        );
        setComments(formattedComments);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    fetchComments();
  }, [id]);

  const uploadComment = async (comment) => {
    try {
      await axiosInstance.post(`${API_BASE_URL}/comment/create`, {
        postId: id,
        userId: user.id,
        content: comment,
        status: "Published",
      });
    } catch (error) {
      console.error("Error uploading comment:", error);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj = {
        id: comments.length + 1,
        displayName: user.displayName,
        userId: user.id,
        avatar: `${user.avatar}`,
        text: newComment,
      };
      setComments([...comments, newCommentObj]);
      setNewComment("");
      uploadComment(newComment);
    }
  };

  if (loading) {
    return <h2 style={{ color: "white", textAlign: "center" }}>Đang tải...</h2>;
  }

  if (!post) {
    return <h2 style={{ color: "white", textAlign: "center" }}>Bài viết không tồn tại</h2>;
  }

  return (
      <div className="post-detail">
        <div className="post-detail-image">
          <img src={`${API_BASE_URL}${post.imageUrl}`} alt="Post" className="image" />
        </div>

        <div className="post-detail-comments">
          <ul className="comment-list">
            {comments.map((comment, index) => (
                <li key={comment.id} className="comment" ref={index === comments.length - 1 ? lastCommentRef : null}>
                  <img src={`http://localhost:3000${comment.avatar}`} alt="Avatar" className="comment-avatar"/>
                  <div className="comment-content">
                    <p className="comment-username">{comment.displayName}</p>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                </li>
            ))}
          </ul>
          <div className="comment-input">
            <input
                type="text"
                placeholder="Nhập bình luận..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddComment();
                }}
            />
            <span className="send-icon" onClick={handleAddComment}>
            <AiOutlineMessage/>
          </span>
          </div>
        </div>
      </div>
  );
}
