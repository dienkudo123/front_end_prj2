import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utils/api";
import "../styles/Profile.css";

const API_BASE_URL = "http://localhost:3000";

export default function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("posts");

    // State quản lý nút follow/unfollow
    const [isFollowing, setIsFollowing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        // Giả lập lấy currentUserId từ localStorage (hoặc từ auth context)
        const currentUser = JSON.parse(localStorage.getItem("user"));
        if (currentUser && currentUser.id) {
            setCurrentUserId(currentUser.id);
        }
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axiosInstance.get(`${API_BASE_URL}/user/${id}`);
                setUserData(res.data.data);

                // Kiểm tra xem có đang follow người này không, giả lập
                if (currentUserId && res.data.data.followers) {
                    setIsFollowing(res.data.data.followers.includes(currentUserId));
                }
            } catch (err) {
                console.error("Failed to fetch user:", err);
            }
        };

        const fetchUserPosts = async () => {
            try {
                const token = localStorage.getItem("token"); // lấy token từ localStorage hoặc nơi bạn lưu token
                const res = await axiosInstance.get(`${API_BASE_URL}/post/user-posts/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setPosts(res.data.data || []);
            } catch (err) {
                console.error("Failed to fetch user posts:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
        fetchUserPosts();
    }, [id, currentUserId]);

    const fullUrl = (url) => {
        if (!url) return "";
        return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    };

    const handleFollowToggle = () => {
        // Chỉ toggle trạng thái local, chưa gọi API
        setIsFollowing(!isFollowing);
    };

    if (loading) return <div>Loading...</div>;
    if (!userData) return <div>User not found.</div>;

    return (
        <div className="profile-page">
            <div className="profile-header">
                <img
                    src={userData.avatar ? fullUrl(userData.avatar) : "/default-avatar.png"}
                    alt="Avatar"
                    className="profile-avatar"
                />
                <div className="profile-stats">
                    <h2>{userData.displayName || "Unknown User"}</h2>

                    {/* Nút follow/unfollow chỉ hiện nếu không phải trang cá nhân mình */}
                    {currentUserId !== id && (
                        <button
                            className={`follow-button ${isFollowing ? "unfollow" : "follow"}`}
                            onClick={handleFollowToggle}
                        >
                            {isFollowing ? "Unfollow" : "Follow"}
                        </button>
                    )}

                    <div className="stats-container">
                        <div className="stat-item">
                            <span className="stat-value">{posts.length}</span>
                            <span className="stat-label">posts</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{userData.followers?.length || 0}</span>
                            <span className="stat-label">followers</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{userData.followings?.length || 0}</span>
                            <span className="stat-label">following</span>
                        </div>
                    </div>
                    {userData.bio && <p className="profile-bio">{userData.bio}</p>}
                </div>
            </div>

            <div className="profile-extra-info">
                {userData.hometown && (
                    <p>
                        <img
                            src="https://static.xx.fbcdn.net/rsrc.php/v4/yc/r/-e1Al38ZrZL.png"
                            alt="Hometown Icon"
                            className="info-icon"
                        />
                        {userData.hometown}
                    </p>
                )}
                {userData.school && (
                    <p>
                        <img
                            src="https://static.xx.fbcdn.net/rsrc.php/v4/yS/r/jV4o8nAgIEh.png"
                            alt="School Icon"
                            className="info-icon"
                        />
                        {userData.school}
                    </p>
                )}
            </div>

            <div className="profile-tabs">
                <button
                    className={activeTab === "posts" ? "tab-button active" : "tab-button"}
                    onClick={() => setActiveTab("posts")}
                >
                    POSTS
                </button>
                <button
                    className={activeTab === "info" ? "tab-button active" : "tab-button"}
                    onClick={() => setActiveTab("info")}
                >
                    INFORMATION
                </button>
            </div>

            {activeTab === "info" && (
                <div className="profile-extra-info">
                    {userData.bio && <p><strong>Bio:</strong> {userData.bio}</p>}
                    {userData.hometown && (
                        <p>
                            <img
                                src="https://static.xx.fbcdn.net/rsrc.php/v4/yc/r/-e1Al38ZrZL.png"
                                alt="Hometown Icon"
                                className="info-icon"
                            />
                            {userData.hometown}
                        </p>
                    )}
                    {userData.school && (
                        <p>
                            <img
                                src="https://static.xx.fbcdn.net/rsrc.php/v4/yS/r/jV4o8nAgIEh.png"
                                alt="School Icon"
                                className="info-icon"
                            />
                            {userData.school}
                        </p>
                    )}
                </div>
            )}

            {activeTab === "posts" && (
                <div className="profile-posts">
                    {posts.length === 0 && <p>Không có bài đăng nào.</p>}
                    {posts.map((post) => (
                        <div key={post.id} className="profile-post">
                            {post.imageUrl && (
                                <img
                                    src={fullUrl(post.imageUrl)}
                                    alt="Post"
                                    className="profile-post-image"
                                />
                            )}
                            {post.videoUrl && (
                                <video controls className="profile-post-video">
                                    <source src={fullUrl(post.videoUrl)} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            )}
                            <h3>{post.title}</h3>
                            <p>{post.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
