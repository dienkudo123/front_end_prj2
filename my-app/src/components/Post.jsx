import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaComment, FaShare } from "react-icons/fa";
import "../styles/Post.css";

const API_BASE_URL = "http://localhost:3000"; // Cần đồng bộ với backend

export default function Post({ post, hideUser = false }) {
    const [liked, setLiked] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="post">
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
                    <p className="username">{post.user.displayName}</p>
                </div>
            )}


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
                <button onClick={() => setLiked(!liked)} className="icon-button">
                    {liked ? <FaHeart className="liked" /> : <FaRegHeart />}
                </button>
                <button className="icon-button" onClick={() => navigate(`/post/${post.id}`)}>
                    <FaComment />
                </button>
                <button className="icon-button">
                    <FaShare />
                </button>
            </div>

            {/* Trend Topic Title */}
            {post.trendTopic?.title && (
                <div className="post-trend-topic">
                    <span className="trend-label">#</span>
                    <span className="trend-title">{post.trendTopic.title}</span>
                </div>
            )}

            {/* Content */}
            <div className="post-content">
                <p>{post.content}</p>
            </div>
        </div>
    );
}
