import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "../styles/Post.css";
import axios from "axios";
import CommentModal from "./CommentModal";

const API_BASE_URL = "http://localhost:3000";

export default function Post({ post, hideUser = false }) {
    const [liked, setLiked] = useState(false);
    const [reactionId, setReactionId] = useState(null); // dùng nếu backend trả ID
    const navigate = useNavigate();
    const [reactions, setReactions] = useState([]);
    const [likeCount, setLikeCount] = useState(0);
    const [isShowingComments, setIsShowingComments] = useState(false);

    const goToUserProfile = () => {
        if (post.user?.id) {
            navigate(`/user/${post.user.id}`);
        }
    };

    useEffect(() => {
        const fetchReaction = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/reaction/post?postId=${post.id}`);
                const data = await res.json();

                const token = localStorage.getItem("accessToken");
                if (!token) return;

                const payload = JSON.parse(atob(token.split('.')[1]));
                const userId = payload.userId;

                const existingReaction = data.data.find(reaction => reaction.userId === userId);
                if (existingReaction) {
                    setLiked(true);
                    setReactionId(existingReaction.id); // optional nếu bạn cần
                }
            } catch (err) {
                console.error("Lỗi khi lấy reaction:", err);
            }
        };

        fetchReaction();
    }, [post.id]);

    useEffect(() => {
        // Lấy danh sách reactions của bài post
        axios.get(`${API_BASE_URL}/reaction/post`, {
            params: { postId: post.id }
        }).then(res => {
            setReactions(res.data.data);
            setLikeCount(res.data.data.length);
        }).catch(err => {
            console.error("Error fetching reactions", err);
        });
    }, [liked,post.id]);

    const handleLikeToggle = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("Vui lòng đăng nhập để thả cảm xúc");
            return;
        }

        try {
            if (!liked) {
                const res = await fetch(`${API_BASE_URL}/reaction/create`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        postId: post.id,
                        type: "LIKE",
                    }),
                });

                const data = await res.json();
                if (res.ok) {
                    setLiked(true);
                    setReactionId(data.data.id); // optional
                }
            } else {
                const res = await fetch(`${API_BASE_URL}/reaction/delete?postId=${post.id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    setLiked(false);
                    setReactionId(null);
                }
            }
        } catch (err) {
            console.error("Lỗi khi xử lý reaction:", err);
        }
    };

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
                    <p
                        className="username"
                        onClick={goToUserProfile}
                        style={{ cursor: "pointer", fontWeight: "bold" }}
                    >
                        {post.user.displayName}
                    </p>
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
                <button onClick={handleLikeToggle} className="icon-button">
                    {liked ? <FaHeart className="liked"/> : <FaRegHeart/>}
                    {likeCount !== 0 &&
                        <span style={{ marginLeft: "5px", fontWeight: "500", fontSize: "15px" }}>
                        {likeCount}
                        </span>
                    }

                </button>

                <button className="icon-button" onClick={() => setIsShowingComments(true)}>
                    <svg aria-label="Comment" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                        <title>Comment</title>
                        <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"
                              fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"/>
                    </svg>
                </button>
                { isShowingComments && (<CommentModal postId={post.id} postImg={post.imageUrl} onClose={() => setIsShowingComments(false)}/>)}
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
