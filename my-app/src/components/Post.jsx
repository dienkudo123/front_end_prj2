import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShareSquare, FaRegHeart, FaHashtag } from "react-icons/fa";
import "../styles/Post.css";
import axios from "axios";
import axiosInstance from "../utils/api";
import { useUser } from "../context/UserContext";
import { formatTimeAgo } from "../utils/auth";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { IoPricetagOutline } from "react-icons/io5";

const API_BASE_URL = "http://localhost:3000";

// Component cho reaction selector
const ReactionSelector = ({ onReactionSelect, currentReaction, isVisible }) => {
  const reactions = [
    { type: "LIKE", emoji: "👍", label: "Thích" },
    { type: "LOVE", emoji: "❤️", label: "Yêu thích" },
    { type: "HAHA", emoji: "😂", label: "Haha" },
    { type: "WOW", emoji: "😮", label: "Wow" },
    { type: "SAD", emoji: "😢", label: "Buồn" },
    { type: "ANGRY", emoji: "😡", label: "Phẫn nộ" },
  ];

  if (!isVisible) return null;

  return (
    <div className="reaction-selector">
      {reactions.map((reaction) => (
        <button
          key={reaction.type}
          className={`reaction-option ${
            currentReaction === reaction.type ? "active" : ""
          }`}
          onClick={() => onReactionSelect(reaction.type)}
          title={reaction.label}
        >
          <span className="reaction-emoji">{reaction.emoji}</span>
        </button>
      ))}
    </div>
  );
};

// Component popup hiển thị chi tiết reactions
const ReactionDetailsModal = ({ reactions, isVisible, onClose, postId }) => {
  const [reactionDetails, setReactionDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  const getReactionEmoji = (type) => {
    switch (type) {
      case "LIKE":
        return "👍";
      case "LOVE":
        return "❤️";
      case "HAHA":
        return "😂";
      case "WOW":
        return "😮";
      case "SAD":
        return "😢";
      case "ANGRY":
        return "😡";
      default:
        return "👍";
    }
  };

  const getReactionLabel = (type) => {
    switch (type) {
      case "LIKE":
        return "Thích";
      case "LOVE":
        return "Yêu thích";
      case "HAHA":
        return "Haha";
      case "WOW":
        return "Wow";
      case "SAD":
        return "Buồn";
      case "ANGRY":
        return "Phẫn nộ";
      default:
        return "Thích";
    }
  };

  useEffect(() => {
    if (isVisible && postId) {
      const fetchReactionDetails = async () => {
        try {
          setLoading(true);
          const response = await axiosInstance.get(
            `${API_BASE_URL}/reaction/post`,
            {
              params: { postId },
            }
          );

          const groupedReactions = {};
          response.data.data.forEach((reaction) => {
            if (!groupedReactions[reaction.type]) {
              groupedReactions[reaction.type] = {
                type: reaction.type,
                count: 0,
                users: [],
              };
            }
            groupedReactions[reaction.type].count++;
            groupedReactions[reaction.type].users.push({
              id: reaction.userId,
              name: reaction.user?.displayName || "Unknown User",
              avatar: reaction.user?.avatar,
            });
          });

          // Convert to array và sort theo count
          const sortedReactions = Object.values(groupedReactions).sort(
            (a, b) => b.count - a.count
          );

          setReactionDetails(sortedReactions);
        } catch (error) {
          console.error("Error fetching reaction details:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchReactionDetails();
    }
  }, [isVisible, postId]);

  if (!isVisible) return null;

  return (
    <div className="reaction-modal-overlay" onClick={onClose}>
      <div className="reaction-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reaction-modal-header">
          <h3>Reactions</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="reaction-modal-content">
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <div className="reaction-groups">
              {reactionDetails.map((group) => (
                <div key={group.type} className="reaction-group">
                  <div className="reaction-group-header">
                    <span className="reaction-emoji">
                      {getReactionEmoji(group.type)}
                    </span>
                    <span className="reaction-label">
                      {getReactionLabel(group.type)}
                    </span>
                    <span className="reaction-count">({group.count})</span>
                  </div>
                  <div className="reaction-users">
                    {group.users.map((user, index) => (
                      <div
                        key={`${user.id}-${index}`}
                        className="reaction-user"
                      >
                        <img
                          src={
                            user.avatar
                              ? `${API_BASE_URL}${user.avatar}`
                              : "/default-avatar.png"
                          }
                          alt={user.name}
                          className="user-avatar-small"
                        />
                        <span className="user-name">{user.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReactionDisplay = ({
  userReaction,
  reactions,
  onClick,
  onLongPress,
  onCountClick,
}) => {
  const getMostPopularReaction = () => {
    if (!reactions || reactions.length === 0) return null;

    const reactionCounts = {};
    reactions.forEach((reaction) => {
      reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
    });

    const mostPopular = Object.entries(reactionCounts).sort(
      ([, a], [, b]) => b - a
    )[0];

    return mostPopular ? mostPopular[0] : null;
  };

  // const getUserReaction = () => {
  //     const response = axiosInstance.get(`${API_BASE_URL}/reaction/user`);
  //     const data = response.data;
  //     // console.log("User Reaction Data:", data);
  //     return data;
  // };

  const getReactionDisplay = (type) => {
    switch (type) {
      case "LIKE":
        return { emoji: "👍", color: "#1877f2" };
      case "LOVE":
        return { emoji: "❤️", color: "#e91e63" };
      case "HAHA":
        return { emoji: "😂", color: "#f7b928" };
      case "WOW":
        return { emoji: "😮", color: "#f7b928" };
      case "SAD":
        return { emoji: "😢", color: "#f7b928" };
      case "ANGRY":
        return { emoji: "😡", color: "#e91e63" };
      default:
        return { emoji: "👍", color: "#65676b" };
    }
  };

  const totalCount = reactions ? reactions.length : 0;
  const mostPopularReaction = getMostPopularReaction();
  const userDisplay = userReaction ? getReactionDisplay(userReaction) : null;
  const popularDisplay = mostPopularReaction
    ? getReactionDisplay(mostPopularReaction)
    : null;
  // const userReactionDisplay = getUserReaction();
  // console.log("User Reaction Display:", userReactionDisplay);

  return (
    <div className="reaction-display-container">
      <button
        className="reaction-display"
        onClick={onClick}
        onContextMenu={onLongPress}
        style={{ color: userReaction ? userDisplay.color : "#65676b" }}
      >
        {userReaction ? (
          <span className="reaction-emoji">{userDisplay.emoji}</span>
        ) : (
          <FaRegHeart />
        )}
      </button>

      {/* Ô hiển thị tổng số lượng với icon phổ biến nhất */}
      {totalCount > 0 && (
        <div
          className="reaction-summary clickable"
          onClick={onCountClick}
          title="Xem chi tiết reactions"
        >
          {popularDisplay && (
            <span className="popular-reaction-emoji">
              {popularDisplay.emoji}
            </span>
          )}
          <span className="reaction-total-count">{totalCount}</span>
        </div>
      )}
    </div>
  );
};

export default function Post({ post, hideUser = false }) {
  const [userReaction, setUserReaction] = useState(null); // reaction của user hiện tại
  const [reactionId, setReactionId] = useState(null);
  const [showReactionSelector, setShowReactionSelector] = useState(false);
  const [showReactionDetails, setShowReactionDetails] = useState(false);
  const navigate = useNavigate();
  const [reactions, setReactions] = useState([]);
  const { user } = useUser();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentMenuId, setCommentMenuId] = useState(null);
  const [postMenuId, setPostMenuId] = useState(null);
  const postRef = useRef(null);
  const [commentHeight, setCommentHeight] = useState(0);

  useEffect(() => {
    if (!postRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      setCommentHeight(entry.contentRect.height + 35);
    });

    observer.observe(postRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchUserReaction = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}/reaction/${post.id}/me`
        );
        setUserReaction(response.data?.data?.type || null);
      } catch (error) {
        console.error(
          "Error fetching user reaction:",
          error.response?.status,
          error.response?.data
        );
        setUserReaction(null);
      }
    };
    fetchUserReaction();
  });
  const goToUserProfile = () => {
    if (post.user?.id) {
      navigate(`/profile/${post.user.id}`);
    }
  };

  useEffect(() => {
    const fetchReaction = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/reaction/post?postId=${post.id}`
        );
        const data = await res.json();
        // console.log("Reaction data:", data);

        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.userId;

        const existingReaction = data.data.find(
          (reaction) => reaction.userId === userId
        );
        if (existingReaction) {
          setUserReaction(existingReaction.type);
          setReactionId(existingReaction.id);
        }
      } catch (err) {
        console.error("Lỗi khi lấy reaction:", err);
      }
    };

    fetchReaction();
  }, [post.id]);

  useEffect(() => {
    // Lấy danh sách reactions của bài post
    axios
      .get(`${API_BASE_URL}/reaction/post`, {
        params: { postId: post.id },
      })
      .then((res) => {
        setReactions(res.data.data);
      })
      .catch((err) => {
        console.error("Error fetching reactions", err);
      });
  }, [userReaction, post.id]);

  const handleReactionSelect = async (reactionType) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Vui lòng đăng nhập để thả cảm xúc");
      return;
    }

    try {
      if (userReaction) {
        // Nếu đã có reaction, xóa reaction cũ trước
        await fetch(`${API_BASE_URL}/reaction/delete?postId=${post.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // Tạo reaction mới
      const res = await fetch(`${API_BASE_URL}/reaction/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: post.id,
          type: reactionType,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setUserReaction(reactionType);
        setReactionId(data.data.id);
      }
    } catch (err) {
      console.error("Lỗi khi xử lý reaction:", err);
    }

    setShowReactionSelector(false);
  };

  const handleReactionClick = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Vui lòng đăng nhập để thả cảm xúc");
      return;
    }

    try {
      if (userReaction) {
        // Nếu đã có reaction, xóa nó
        const res = await fetch(
          `${API_BASE_URL}/reaction/delete?postId=${post.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok) {
          setUserReaction(null);
          setReactionId(null);
        }
      } else {
        // Nếu chưa có reaction, tạo reaction LIKE mặc định
        handleReactionSelect("LIKE");
      }
    } catch (err) {
      console.error("Lỗi khi xử lý reaction:", err);
    }
  };

  const handleLongPress = (e) => {
    e.preventDefault();
    setShowReactionSelector(!showReactionSelector);
  };

  const handleCountClick = () => {
    setShowReactionDetails(true);
  };

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance(
          `/comment/post-comments?postId=${post.id}`
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
  }, [post.id, user.id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await axiosInstance.post("/comment/create", {
        postId: post.id,
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
      setCommentMenuId(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await axiosInstance.delete(`/post/${postId}`);
      setPostMenuId(null);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleSharePost = async () => {
    try {
      if (post.userId === user.id) {
        alert("Không thể chia sẻ bài đăng của chính mình!");
        return;
      }
      await axiosInstance.post(`post/share/${post.id}`);
      alert("Chia sẻ thành công");
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <div className="post">
      <div className="post-info" ref={postRef}>
        {post.trendTopic?.title && (
          <div className="post-trend-topic">
            <span className="post-trend-icon">
              <DotLottieReact src="/icons/fire.lottie" loop autoplay />
            </span>
            <span className="post-trend-title">{post.trendTopic.title}</span>
            <span className="post-trend-icon">
              <DotLottieReact src="/icons/fire.lottie" loop autoplay />
            </span>
          </div>
        )}
        {/* User Info */}
        {!hideUser && post.user && (
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
            <div className="post-name-date">
              {" "}
              <p
                className="username"
                onClick={goToUserProfile}
                style={{ cursor: "pointer", fontWeight: "bold" }}
              >
                {post.user.displayName}
              </p>
              <span className="create-at">{formatTimeAgo(post.createdAt)}</span>
            </div>
            {(post.user.id === user.id || user.role === "Admin") && (
              <>
                <span
                  className="post-menu-btn"
                  title="Tùy chọn"
                  onClick={() =>
                    setPostMenuId(post.id === postMenuId ? null : post.id)
                  }
                >
                  ⋮
                </span>
                {postMenuId === post.id && (
                  <div className="post-menu-dropdown">
                    <button
                      className="post-delete-btn"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      Xóa bài đăng
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Content */}
        <div className="post-content">
          <p className="post-title">
            <IoPricetagOutline className="post-title-icon" />
            {post.title}
          </p>
          <p className="post-body">{post.content}</p>
        </div>

        {/* Post Image */}
        {post.imageUrl && (
          <img
            src={`${API_BASE_URL}${post.imageUrl}`}
            alt="Post"
            className="post-image"
          />
        )}

        {/* Actions */}
        <div className="post-actions">
          <div
            className="reaction-container"
            onMouseEnter={() => setShowReactionSelector(true)}
            onMouseLeave={() => setShowReactionSelector(false)}
          >
            <ReactionDisplay
              userReaction={userReaction}
              reactions={reactions}
              onClick={handleReactionClick}
              onLongPress={handleLongPress}
              onCountClick={handleCountClick}
            />
            <ReactionSelector
              onReactionSelect={handleReactionSelect}
              currentReaction={userReaction}
              isVisible={showReactionSelector}
            />
          </div>

          <button className="icon-button" onClick={() => handleSharePost()}>
            <FaShareSquare />
          </button>
        </div>

        {/* Reaction Details Modal */}
        <ReactionDetailsModal
          reactions={reactions}
          isVisible={showReactionDetails}
          onClose={() => setShowReactionDetails(false)}
          postId={post.id}
        />
      </div>
      <div
        className="modal-comment-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: `${commentHeight}px`, overflowY: "auto" }}
      >
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
                                  setCommentMenuId(
                                    commentMenuId === comment.id
                                      ? null
                                      : comment.id
                                  )
                                }
                              >
                                ⋮
                              </span>
                              {commentMenuId === comment.id && (
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
      </div>
    </div>
  );
}
