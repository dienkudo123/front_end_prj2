import { useEffect, useState } from "react";
import axiosInstance from "../utils/api";
import "../styles/CommentModal.css";
import { useUser } from "../context/UserContext";
import { formatTimeAgo } from "../utils/auth";

const API_BASE_URL = "http://localhost:3000";

export default function CommentModal({ postId, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance(
          `/comment/post-comments?postId=${postId}`
        );
        const data = response.data.data || [];
        const commentsWithOwner = data.map((comment) => {
          return {
            ...comment,
            isOwner: comment.userId === user.id,
          };
        });
        setComments(commentsWithOwner);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId, user.id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await axiosInstance.post("/comment/create", {
        postId,
        content: newComment,
        status: "Published",
      });
      setComments((prevComments) => [
        ...prevComments,
        {
          ...response.data.data,
          user: {
            id: user.id,
            displayName: user.displayName,
            avatar: user.avatar,
          },
          isOwner: true,
        },
      ]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axiosInstance.delete(`/comment/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setOpenMenuId(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div className="modal-backdrop-comment" onClick={onClose}>
      <div className="modal-content-comment" onClick={(e) => e.stopPropagation()}>
        <div className="comments-header">
          <h3>Bình luận của bài viết</h3>
        </div>
        {loading ? (
          <div className="comment-loading-spinner"></div>
        ) : (
          <>
            {comments.length === 0 ? (
              <p className="no-comments-text">Không có bình luận nào.</p>
            ) : (
              <ul className="comments-list">
                {comments.map((comment) => (
                  <li key={comment.id} className="comment-item">
                    <img
                      src={`${API_BASE_URL}${comment.user.avatar}`}
                      alt="avatar"
                    />
                    <div
                      className={`comment-body ${
                        comment.isOwner ? "owner" : ""
                      }`}
                    >
                      <div className="comment-detail-header">
                        <span className="comment-username">
                          {comment.user.displayName || "Unnamed User"}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <p className="comment-date">
                            {formatTimeAgo(comment.createdAt)}
                          </p>
                          {comment.isOwner && (
                            <>
                              <span
                                className="comment-menu-btn"
                                title="Tùy chọn"
                                onClick={() =>
                                  setOpenMenuId(
                                    openMenuId === comment.id
                                      ? null
                                      : comment.id
                                  )
                                }
                              >
                                ⋮
                              </span>
                              {openMenuId === comment.id && (
                                <div className="comment-menu-dropdown">
                                  <button
                                    className="comment-delete-btn"
                                    onClick={() =>
                                      handleDeleteComment(comment.id)
                                    }
                                  >
                                    Xóa bình luận
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <p className="comment-content">{comment.content}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        <input
          className="comment-input"
          type="text"
          placeholder="Nhập bình luận"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddComment();
            }
          }}
        />
        <button onClick={onClose} className="close-button">
          &times;
        </button>
      </div>
    </div>
  );
}