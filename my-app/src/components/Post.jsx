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
                    {/* Trend Topic Title */}
                    {post.trendTopic?.title && (
                        <div className="post-trend-topic">
                            <span className="trend-title">{post.trendTopic.title}</span>
                        </div>
                    )}
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
                    {liked ? <FaHeart className="liked"/> : <FaRegHeart/>}
                </button>
                <button className="icon-button" onClick={() => navigate(`/post/${post.id}`)}>
                    <svg aria-label="Comment" className="x1lliihq x1n2onr6 x5n08af" fill="currentColor" height="24"
                         role="img" viewBox="0 0 24 24" width="24"><title>Comment</title>
                        <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor"
                              stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                </button>
                <button className="icon-button">
                    <img
                        src="https://www.svgrepo.com/show/522661/share.svg"
                        alt="Share Icon"
                        className="icon-img"
                    />
                </button>

            </div>


            {/* Content */}
            <div className="post-content">
                <p>{post.content}</p>
            </div>
        </div>
    );
}
