import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaComment, FaShare } from "react-icons/fa"; // Import icon
import "../styles/Post.css"; // Import CSS riêng cho Post

export default function Post({ post, hideUser = false }) {
    const [liked, setLiked] = useState(false); // Trạng thái like
    const navigate = useNavigate(); // Hook điều hướng

    return (
        <div className="post">
            {!hideUser && ( // Chỉ hiển thị avatar + username nếu không ẩn
                <div className="post-header">
                    <img src={post.avatar} alt="Avatar" className="avatar" />
                    <p className="username">{post.username}</p>
                </div>
            )}

            <img src={post.image} alt="Post" className="post-image" />

            <div className="post-actions">
                <button onClick={() => setLiked(!liked)} className="icon-button">
                    {liked ? <FaHeart className="liked"/> : <FaRegHeart/>} {/* Like */}
                </button>
                <button className="icon-button" onClick={() => navigate(`/post/${post.id}`)}>
                    <FaComment/>
                </button>
                <button className="icon-button">
                    <FaShare/> {/* Share */}
                </button>
            </div>

            <div className="post-content">
                <p>{post.caption}</p>
            </div>
        </div>
    );
}
