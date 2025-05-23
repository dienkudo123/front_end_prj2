import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSettings, FiLogOut } from "react-icons/fi";
import "../styles/Profile.css";
import axiosInstance from "../utils/api";
import { useUser } from "../context/UserContext";

// const API_BASE_URL = "http://localhost:3000";
// const axiosInstance = axios.create({
//     baseURL: API_BASE_URL,
//     withCredentials: true,
// });

const API_BASE_URL = "http://localhost:3000";

export default function Profile() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState("");
    const [displayName, setDisplayName] = useState("User");
    const [email, setEmail] = useState("");
    const [followers, setFollowers] = useState(0);
    const [following, setFollowing] = useState(0);
    const [avatarFile, setAvatarFile] = useState(null);
    const paramUsername = "User";
    const { user, setUser } = useUser();

    useEffect(() => {
        const fetchUserProfile = async () => {
            const response = await axiosInstance.get(`${API_BASE_URL}/user/me`);
            // console.log('User profile data:', response.data.data);
            const userData = response.data.data;
            setDisplayName(userData.user.displayName || paramUsername);
            setEmail(userData.user.email || "");
            setFollowers(userData.followers.length || 0);
            setFollowing(userData.followings.length || 0);
            if (userData.user.avatar) {
                setAvatarUrl(`${API_BASE_URL}${userData.user.avatar}`);
            }
        };

        fetchUserProfile();
    }, [paramUsername]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append("displayName", displayName);
            formData.append("email", email);
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            const response = await axiosInstance.patch(
                `${API_BASE_URL}/user/update`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        withCredentials: true,
                    },
                }
            );
            console.log("User updated:", response.data.data.avatar);
            const updatedUserData = response.data.data;
            // setDisplayName(updatedUserData.displayName);
            // setEmail(updatedUserData.email);
            // setAvatarUrl(`${API_BASE_URL}${updatedUserData.avatar}`);

            const updatedUser = {
            ...user,
            displayName: updatedUserData.displayName,
            avatar: updatedUserData.avatar,
            };
            
            setUser(updatedUser);

            console.log("User updated:", response.data);
            alert("Profile updated successfully!");
            setIsEditing(false);
            
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    // const handleLogout = async () => {
    //     try {
    //         await axiosInstance.post(
    //             `${API_BASE_URL}/auth/logout`,
    //             {},
    //             {
    //                 withCredentials: true,
    //             }
    //         );
    //     } catch (err) {
    //         console.warn("Logout API failed:", err);
    //     } finally {
    //         localStorage.removeItem("accessToken");
    //         localStorage.removeItem("refreshToken");
    //         localStorage.removeItem("user");
    //         navigate("/login");
    //     }
    // };

    useEffect(() => {
        const fetchPosts = async () => {
            const user = getUserFromLocalStorage();
            const token = getTokenFromLocalStorage();

            if (user?.id && token) {
                try {
                    const res = await axiosInstance.get(
                        `${API_BASE_URL}/post/user-posts/${user.id}`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );
                    setPosts(res.data.data || []);
                } catch (err) {
                    console.error("Error fetching posts:", err);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
                console.warn("User or token not found in localStorage");
            }
        };

        fetchPosts();
    }, []);

    const getUserFromLocalStorage = () => {
        try {
            const data = localStorage.getItem("user");
            return data ? JSON.parse(data) : null;
        } catch (err) {
            console.error("Invalid user data in localStorage:", err);
            return null;
        }
    };

    const getTokenFromLocalStorage = () => {
        return localStorage.getItem("accessToken");
    };

    const fullUrl = (url) => {
        if (!url) return "";
        return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-info">
                    {isEditing ? (
                        <div className="edit-profile-form">
                            <div className="avatar-edit">
                                <img src={avatarUrl} alt="Avatar" className="profile-avatar" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    id="avatar-upload"
                                    className="avatar-upload-input"
                                />
                                <label htmlFor="avatar-upload" className="avatar-upload-label">
                                    Change Avatar
                                </label>
                            </div>
                            <div className="profile-fields">
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Display Name"
                                    className="profile-input"
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                    className="profile-input"
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <img src={avatarUrl} alt="Avatar" className="profile-avatar" />
                            <div className="profile-stats">
                                <h2>{displayName}</h2>
                                <div className="stats-container">
                                    <div className="stat-item">
                                        <span className="stat-value">{posts.length}</span>
                                        <span className="stat-label">posts</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-value">{followers}</span>
                                        <span className="stat-label">followers</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-value">{following}</span>
                                        <span className="stat-label">following</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="profile-actions">
                    <button
                        className="edit-profile-button"
                        onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                    >
                        {isEditing ? "Save" : "Edit Profile"}
                    </button>
                    {/* <button onClick={handleLogout} className="logout-button">
                        <FiLogOut /> Log out
                    </button> */}
                </div>
            </div>

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
        </div>
    );
}
