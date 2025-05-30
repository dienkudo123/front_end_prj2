import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "../styles/Post.css";
import axios from "axios";
import CommentModal from "./CommentModal";
import axiosInstance from "../utils/api";

const API_BASE_URL = "http://localhost:3000";

// Component cho reaction selector
const ReactionSelector = ({ onReactionSelect, currentReaction, isVisible }) => {
    const reactions = [
        { type: 'LIKE', emoji: '👍', label: 'Thích' },
        { type: 'LOVE', emoji: '❤️', label: 'Yêu thích' },
        { type: 'HAHA', emoji: '😂', label: 'Haha' },
        { type: 'WOW', emoji: '😮', label: 'Wow' },
        { type: 'SAD', emoji: '😢', label: 'Buồn' },
        { type: 'ANGRY', emoji: '😡', label: 'Phẫn nộ' }
    ];

    if (!isVisible) return null;

    return (
        <div className="reaction-selector">
            {reactions.map((reaction) => (
                <button
                    key={reaction.type}
                    className={`reaction-option ${currentReaction === reaction.type ? 'active' : ''}`}
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
            case 'LIKE': return '👍';
            case 'LOVE': return '❤️';
            case 'HAHA': return '😂';
            case 'WOW': return '😮';
            case 'SAD': return '😢';
            case 'ANGRY': return '😡';
            default: return '👍';
        }
    };

    const getReactionLabel = (type) => {
        switch (type) {
            case 'LIKE': return 'Thích';
            case 'LOVE': return 'Yêu thích';
            case 'HAHA': return 'Haha';
            case 'WOW': return 'Wow';
            case 'SAD': return 'Buồn';
            case 'ANGRY': return 'Phẫn nộ';
            default: return 'Thích';
        }
    };

    useEffect(() => {
        if (isVisible && postId) {
            const fetchReactionDetails = async () => {
                try {
                    setLoading(true);
                    const response = await axiosInstance.get(`${API_BASE_URL}/reaction/post`, {
                        params: { postId }
                    });
                    
                    const groupedReactions = {};
                    response.data.data.forEach(reaction => {
                        if (!groupedReactions[reaction.type]) {
                            groupedReactions[reaction.type] = {
                                type: reaction.type,
                                count: 0,
                                users: []
                            };
                        }
                        groupedReactions[reaction.type].count++;
                        groupedReactions[reaction.type].users.push({
                            id: reaction.userId,
                            name: reaction.user?.displayName || 'Unknown User',
                            avatar: reaction.user?.avatar
                        });
                    });

                    // Convert to array và sort theo count
                    const sortedReactions = Object.values(groupedReactions)
                        .sort((a, b) => b.count - a.count);
                    
                    setReactionDetails(sortedReactions);
                } catch (error) {
                    console.error('Error fetching reaction details:', error);
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
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="reaction-modal-content">
                    {loading ? (
                        <div className="loading">Đang tải...</div>
                    ) : (
                        <div className="reaction-groups">
                            {reactionDetails.map((group) => (
                                <div key={group.type} className="reaction-group">
                                    <div className="reaction-group-header">
                                        <span className="reaction-emoji">{getReactionEmoji(group.type)}</span>
                                        <span className="reaction-label">{getReactionLabel(group.type)}</span>
                                        <span className="reaction-count">({group.count})</span>
                                    </div>
                                    <div className="reaction-users">
                                        {group.users.map((user, index) => (
                                            <div key={`${user.id}-${index}`} className="reaction-user">
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

const ReactionDisplay = ({ userReaction, reactions, onClick, onLongPress, onCountClick }) => {
    const getMostPopularReaction = () => {
        if (!reactions || reactions.length === 0) return null;

        const reactionCounts = {};
        reactions.forEach(reaction => {
            reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
        });

        const mostPopular = Object.entries(reactionCounts)
            .sort(([,a], [,b]) => b - a)[0];

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
            case 'LIKE': return { emoji: '👍', color: '#1877f2' };
            case 'LOVE': return { emoji: '❤️', color: '#e91e63' };
            case 'HAHA': return { emoji: '😂', color: '#f7b928' };
            case 'WOW': return { emoji: '😮', color: '#f7b928' };
            case 'SAD': return { emoji: '😢', color: '#f7b928' };
            case 'ANGRY': return { emoji: '😡', color: '#e91e63' };
            default: return { emoji: '👍', color: '#65676b' };
        }
    };

    const totalCount = reactions ? reactions.length : 0;
    const mostPopularReaction = getMostPopularReaction();
    const userDisplay = userReaction ? getReactionDisplay(userReaction) : null;
    const popularDisplay = mostPopularReaction ? getReactionDisplay(mostPopularReaction) : null;
    // const userReactionDisplay = getUserReaction();
    // console.log("User Reaction Display:", userReactionDisplay);

    return (
        <div className="reaction-display-container">
            <button 
                className="reaction-display" 
                onClick={onClick}
                onContextMenu={onLongPress}
                style={{ color: userReaction ? userDisplay.color : '#65676b' }}
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
                        <span className="popular-reaction-emoji">{popularDisplay.emoji}</span>
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
    const [isShowingComments, setIsShowingComments] = useState(false);
    // const userId = localStorage.getItem("userId");
    // const userReaction = await axiosInstance.get(`${API_BASE_URL}/reaction/${post.id}/me`);

    useEffect(() => {
        const fetchUserReaction = async () => {
            try {
                const response = await axiosInstance.get(`${API_BASE_URL}/reaction/${post.id}/me`);
                console.log("User Reaction:", response.data);
                setUserReaction(response.data?.data?.type || null);
            } catch (error) {
                console.error("Error fetching user reaction:", error.response?.status, error.response?.data);
                setUserReaction(null);
            }
        };
        fetchUserReaction();
    });
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
                // console.log("Reaction data:", data);

                const token = localStorage.getItem("accessToken");
                if (!token) return;

                const payload = JSON.parse(atob(token.split('.')[1]));
                const userId = payload.userId;

                const existingReaction = data.data.find(reaction => reaction.userId === userId);
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
        axios.get(`${API_BASE_URL}/reaction/post`, {
            params: { postId: post.id }
        }).then(res => {
            setReactions(res.data.data);
        }).catch(err => {
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
                const res = await fetch(`${API_BASE_URL}/reaction/delete?postId=${post.id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    setUserReaction(null);
                    setReactionId(null);
                }
            } else {
                // Nếu chưa có reaction, tạo reaction LIKE mặc định
                handleReactionSelect('LIKE');
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

                <button className="icon-button" onClick={() => setIsShowingComments(true)}>
                    <svg aria-label="Comment" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                        <title>Comment</title>
                        <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"
                              fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"/>
                    </svg>
                </button>
                {isShowingComments && (
                    <CommentModal 
                        postId={post.id} 
                        postImg={post.imageUrl} 
                        onClose={() => setIsShowingComments(false)}
                    />
                )}
                <button className="icon-button">
                    <img
                        src="https://www.svgrepo.com/show/522661/share.svg"
                        alt="Share Icon"
                        className="icon-img"
                    />
                </button>
            </div>

            {/* Reaction Details Modal */}
            <ReactionDetailsModal
                reactions={reactions}
                isVisible={showReactionDetails}
                onClose={() => setShowReactionDetails(false)}
                postId={post.id}
            />

            {/* Content */}
            <div className="post-content">
                <p>{post.content}</p>
            </div>
        </div>
    );
}