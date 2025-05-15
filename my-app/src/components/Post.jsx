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

            <img
                src={`${API_BASE_URL}${post.imageUrl}`}
                alt="Post"
                className="post-image"
            />

            <div className="post-actions">
                <button onClick={() => setLiked(!liked)} className="icon-button">
                    {liked ? <FaHeart className="liked"/> : <FaRegHeart/>}
                </button>
                <button className="icon-button" onClick={() => navigate(`/post/${post.id}`)}>
                    <FaComment/>
                </button>
                <button className="icon-button">
                    <FaShare/>
                </button>
            </div>

            <div className="post-content">
                <p>{post.content}</p>
            </div>
        </div>
    );
}
