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
      return null;
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
              const userData = userRes?.data?.data || {};
              return {
                id: comment.id,
                userId: comment.userId,
                displayName: userData.displayName || "Người dùng",
                avatar: userData.avatar || "/default-avatar.png",
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

  // Gửi bình luận lên backend, backend lấy userId từ token
  const uploadComment = async (commentContent) => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/comment/create`, {
        content: commentContent,
        postId: id,
        status: "Published"
      });
      return response.data.data; // bình luận vừa tạo
    } catch (error) {
      console.error("Error uploading comment:", error);
      return null;
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      const createdComment = await uploadComment(newComment);
      if (createdComment) {
        const newCommentObj = {
          id: createdComment.id,
          displayName: user.displayName,
          userId: user.id,
          avatar: user.avatar,
          text: createdComment.content,
        };
        setComments([...comments, newCommentObj]);
        setNewComment("");
      } else {
        alert("Không thể thêm bình luận. Vui lòng thử lại.");
      }
    }
  };

  if (loading) {
    return <h2 style={{ color: "white", textAlign: "center" }}>Đang tải...</h2>;
  }

  if (!post) {
    return <h2 style={{ color: "white", textAlign: "center" }}>Bài viết không tồn tại</h2>;
  }

  console.log(post);
  return (
      <div className="post-detail">
        <div className="post-detail-image">
          <img src={`${API_BASE_URL}${post.imageUrl}`} alt="Post" className="image"/>
        </div>

        <div className="post-detail-comments">
          <div className="post-header">
            <img
                src={
                  post.user.avatar
                      ? `${API_BASE_URL}${post.user.avatar}`
                      : "/default-avatar.png"
                }
                alt="Avatar"
                className="avatar"
            />
            <p
                className="username"
                style={{cursor: "pointer", fontWeight: "bold"}}
            >
              {post.user.displayName}
            </p>
            {/* Trend Topic Title */}
            {post.trendTopic?.title && (
                <div className="post-trend-topic">
                  <span className="trend-title">{post.trendTopic.title}</span>
                </div>
            )}
          </div>
          <div className="content">{post.content}</div>
          <ul className="comment-list">
            {comments.map((comment, index) => (
                <li
                    key={comment.id}
                    className="comment"
                    ref={index === comments.length - 1 ? lastCommentRef : null}
                >
                  <img src={`${API_BASE_URL}${comment.avatar}`} alt="Avatar" className="comment-avatar"/>
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
