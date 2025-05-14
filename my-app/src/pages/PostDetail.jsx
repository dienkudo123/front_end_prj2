import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import dummyPosts from "../data/posts"; // Import danh sách post từ file riêng
import "../styles/PostDetail.css"; // Import CSS riêng
import { AiOutlineMessage } from 'react-icons/ai';

export default function PostDetail() {
  const { id } = useParams();
  const post = dummyPosts.find((p) => p.id === parseInt(id));

  const lastCommentRef = useRef(null); // Ref cho bình luận cuối cùng

  const [comments, setComments] = useState([
    {
      id: 1,
      username: "user1",
      avatar: "https://i.pravatar.cc/50?u=user1",
      text: "Bài viết đẹp quá!",
    },
    {
      id: 2,
      username: "user2",
      avatar: "https://i.pravatar.cc/50?u=user2",
      text: "Tuyệt vời!",
    },
  ]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    // Cuộn đến bình luận cuối cùng sau khi thay đổi danh sách bình luận
    if (lastCommentRef.current) {
      lastCommentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj = {
        id: comments.length + 1,
        username: "Bạn", // Giả sử user chưa đăng nhập (có thể thay bằng user thực tế)
        avatar: "https://i.pravatar.cc/50?u=newUser",
        text: newComment,
      };
      setComments([...comments, newCommentObj]);
      setNewComment("");
    }
  };

  useEffect(() => {
    console.log(comments); // In ra comments mỗi khi thay đổi
  }, [comments]);

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
              ref={index === comments.length - 1 ? lastCommentRef : null} // Thêm ref cho bình luận cuối cùng
            >
              <img
                src={comment.avatar}
                alt="Avatar"
                className="comment-avatar"
              />
              <div className="comment-content">
                <p className="comment-username">{comment.username}</p>
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
