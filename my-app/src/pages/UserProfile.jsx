import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utils/api";
import "../styles/Profile.css";
import FollowersModal from "../components/FollowersModal.jsx";
import FollowingModal from "../components/FollowingModal.jsx";
import { formatDate } from "../utils/auth";
import {
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaHome,
  FaSchool,
  FaBirthdayCake,
  FaMars,
  FaVenus,
  FaHeart,
} from "react-icons/fa";
import PostNoComment from "../components/PostNoComment";

const API_BASE_URL = "http://localhost:3000";

export default function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followers, setFollowers] = useState(0);
    const [following, setFollowing] = useState(0);
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [showFollowingModal, setShowFollowingModal] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem("user"));
        if (currentUser && currentUser.id) {
            setCurrentUserId(currentUser.id);
        }
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axiosInstance.get(`${API_BASE_URL}/user/${id}`);
                setUserData(res.data.data.user);
                console.log("User data:", res.data.data);

                // Kiểm tra xem có đang follow người này không
                if (currentUserId && res.data.data.followers) {
                    setIsFollowing(res.data.data.followers.includes(currentUserId));
                }
            } catch (err) {
                console.error("Failed to fetch user:", err);
            }
        };

        const fetchUserPosts = async () => {
            try {
                const token = localStorage.getItem("accessToken");
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

        const fetchIsFollowing = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (!token || !currentUserId || currentUserId === id) {
                    setIsFollowing(false);
                    return;
                }

                // Lấy danh sách followers
                const followersRes = await axiosInstance.get(`${API_BASE_URL}/user/followers/${id}`);
                setFollowers(followersRes.data.data.length || 0);
                
                // Lấy danh sách following
                const followingRes = await axiosInstance.get(`${API_BASE_URL}/user/following/${id}`);
                setFollowing(followingRes.data.data.length || 0);

                const res = await axiosInstance.get(`${API_BASE_URL}/user/is-following/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setIsFollowing(res.data.data.isFollowing);
            } catch (err) {
                console.error("Failed to check following status:", err);
            }
        };

        fetchUser();
        fetchUserPosts();
        fetchIsFollowing();
    }, [id, currentUserId]);

    const fullUrl = (url) => {
        if (!url) return "";
        return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    };

    const handleFollowToggle = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                alert("Bạn cần đăng nhập để thực hiện hành động này.");
                return;
            }
            await axiosInstance.post(
                `${API_BASE_URL}/user/follow/${id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setIsFollowing((prev) => !prev);
            // Update follower count
            setFollowers(prev => isFollowing ? prev - 1 : prev + 1);
        } catch (err) {
            console.error("Follow/unfollow failed", err);
            alert("Thao tác thất bại, vui lòng thử lại.");
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!userData) return <div>User not found.</div>;

    return (
        <div className="profile-container">
            {/* Ảnh bìa */}
            <div className="cover-photo">
                <img
                    src="https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1350&q=80"
                    alt="Ảnh bìa"
                />
                <div className="avatar-wrapper">
                    <div className="avatar-container">
                        <img 
                            src={userData.avatar ? fullUrl(userData.avatar) : "/default-avatar.png"} 
                            alt="Avatar" 
                            className="avatar-profile" 
                        />
                        <img
                            src="/frames/Khung lửa.webp"
                            alt="Avatar Frame"
                            className="avatar-frame"
                        />
                    </div>
                </div>
            </div>

            <div className="profile-header">
                {/* Phần tên người dùng */}
                <div className="profile-username">
                    <h1>{userData.displayName || "Unknown User"}</h1>
                    <p className="username">{`@${userData.displayName || "unknown"}`}</p>
                </div>

                {/* Phần follow */}
                <div className="follow-stats">
                    <div
                        className="followers"
                        onClick={() => setShowFollowersModal(true)}
                    >
                        <strong>{followers}</strong>
                        <span>Followers</span>
                    </div>
                    {showFollowersModal && (
                        <FollowersModal
                            userId={id}
                            onClose={() => setShowFollowersModal(false)}
                        />
                    )}
                    <div
                        className="following"
                        onClick={() => setShowFollowingModal(true)}
                    >
                        <strong>{following}</strong>
                        <span>Following</span>
                    </div>
                    {showFollowingModal && (
                        <FollowingModal
                            userId={id}
                            onClose={() => setShowFollowingModal(false)}
                        />
                    )}
                    
                    {/* Nút follow/unfollow chỉ hiện nếu không phải trang cá nhân mình */}
                    {currentUserId !== id && (
                        <button
                            className={`follow-button ${isFollowing ? "following" : ""}`}
                            onClick={handleFollowToggle}
                        >
                            {isFollowing ? "Unfollow" : "Follow"}
                        </button>
                    )}
                </div>
            </div>

            <div className="profile-main-content">
                <div className="user-info">
                    <h2>
                        <FaInfoCircle style={{ marginRight: 8 }} /> Giới thiệu
                    </h2>
                    <p>
                        <FaUser style={{ marginRight: 6 }} />
                        <strong>Tên:</strong> {userData.displayName || "Chưa cập nhật"}
                    </p>
                    <p>
                        <FaEnvelope style={{ marginRight: 6 }} />
                        <strong>Email:</strong> {userData.email || "Chưa cập nhật"}
                    </p>
                    <p>
                        <FaMapMarkerAlt style={{ marginRight: 6 }} />
                        <strong>Địa chỉ:</strong> {userData.address || "Chưa cập nhật"}
                    </p>
                    <p>
                        <FaInfoCircle style={{ marginRight: 6 }} />
                        <strong>Tiểu sử:</strong> {userData.bio || "Chưa cập nhật"}
                    </p>
                    <p>
                        <FaHome style={{ marginRight: 6 }} />
                        <strong>Quê quán:</strong> {userData.hometown || "Chưa cập nhật"}
                    </p>
                    <p>
                        <FaSchool style={{ marginRight: 6 }} />
                        <strong>Trường học:</strong> {userData.school || "Chưa cập nhật"}
                    </p>
                    <p>
                        <FaBirthdayCake style={{ marginRight: 6 }} />
                        <strong>Ngày sinh:</strong> {userData.birthday ? formatDate(userData.birthday) : "Chưa cập nhật"}
                    </p>
                    <p>
                        {userData.gender === "Nam" ? (
                            <FaMars style={{ marginRight: 6, color: "blue" }} />
                        ) : userData.gender === "Nữ" ? (
                            <FaVenus style={{ marginRight: 6, color: "pink" }} />
                        ) : (
                            <FaUser style={{ marginRight: 6 }} />
                        )}
                        <strong>Giới tính:</strong> {userData.gender || "Chưa cập nhật"}
                    </p>
                    <p>
                        <FaHeart style={{ marginRight: 6, color: "red" }} />
                        <strong>Mối quan hệ:</strong> {userData.relationship || "Chưa cập nhật"}
                    </p>
                </div>

                <div className="user-posts">
                    <h2>Bài đăng của {userData.displayName || "Unknown User"}</h2>
                    {posts.length === 0 ? (
                        <p>Không có bài đăng nào.</p>
                    ) : (
                        posts.map((post) => (
                            <PostNoComment key={post.id} post={post} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}