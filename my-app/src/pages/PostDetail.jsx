import { useParams } from "react-router-dom";
import { use, useEffect, useRef, useState } from "react";
import dummyPosts from "../data/posts"; // Import danh sách post từ file riêng
import "../styles/PostDetail.css"; // Import CSS riêng
import { AiOutlineMessage } from 'react-icons/ai';
import { useUser } from "../context/UserContext"; 
import axiosInstance from "../utils/api";

const API_BASE_URL = "http://localhost:3000";


export default function PostDetail() {
  const { id } = useParams();
  const post = dummyPosts.find((p) => p.id === parseInt(id));
  const lastCommentRef = useRef(null); 
  const {user, setUser} = useUser();


  const [comments, setComments] = useState([]); 
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    // Cuộn đến bình luận cuối cùng sau khi thay đổi danh sách bình luận
    if (lastCommentRef.current) {
      lastCommentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);
  const getUser = (userId) => {
    try{
      const response = axiosInstance.get(`http://localhost:3000/user/${userId}`);
      const userData = response;
      return userData;
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axiosInstance.get(`http://localhost:3000/comment/post-comments?postId=${id}`);
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
        console.log(comments);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    }

    fetchComments();
  },[id])

  const uploadComment = async (comment) => {
    try {
      const response = await axiosInstance.post("http://localhost:3000/comment/create", {
        postId: id,
        userId: user.id,
        content: comment,
        status: "Published",
      });
      console.log(response.data);
    } catch (error) {
      console.error("Error uploading comment:", error);
    }
  }

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

  

  // useEffect(() => {
  //   console.log(comments); // In ra comments mỗi khi thay đổi
  // }, [comments]);

  if (!post) {
    return (
      <h2 style={{ color: "white", textAlign: "center" }}>
        Bài viết không tồn tại
      </h2>
    );
  }

  return (
    <div className="post-detail">
      {/* Ảnh bài viết */}
      <div className="post-detail-image">
        <img src={post.image} alt="Post" />
      </div>

      {/* Bình luận */}
      <div className="post-detail-comments">
        <ul className="comment-list">
          {comments.map((comment, index) => (
            <li
              key={comment.id}
              className="comment"
              ref={index === comments.length - 1 ? lastCommentRef : null} 
            >
              <img
                src={`http://localhost:3000${comment.avatar}`}
                alt="Avatar"
                className="comment-avatar"
              />
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
            <AiOutlineMessage />
          </span>
        </div>
      </div>
    </div>
  );
}
