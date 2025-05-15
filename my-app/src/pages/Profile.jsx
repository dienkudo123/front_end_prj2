import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiSettings, FiLogOut } from "react-icons/fi";
import "../styles/Profile.css";
import axiosInstance from "../utils/api";

export default function Profile() {
    const { username: paramUsername } = useParams();
    const navigate = useNavigate();

    const [posts] = useState([
        { id: 1, image: "https://th.bing.com/th/id/OIP.o2PwdCIlnk04dNQreJ3V2gHaMd?rs=1&pid=ImgDetMain" },
        { id: 2, image: "https://th.bing.com/th/id/OIP.3A4HIGRlPCVjh9H_qTUdzAHaLH?rs=1&pid=ImgDetMain" },
        { id: 3, image: "https://toigingiuvedep.vn/wp-content/uploads/2022/04/hinh-anh-hai-huoc-ba-dao-nhat-the-gioi.jpg" },
        { id: 4, image: "https://th.bing.com/th/id/OIP.3A4HIGRlPCVjh9H_qTUdzAHaLH?rs=1&pid=ImgDetMain" },
        { id: 5, image: "https://th.bing.com/th/id/OIP.o2PwdCIlnk04dNQreJ3V2gHaMd?rs=1&pid=ImgDetMain" },
        { id: 6, image: "https://toigingiuvedep.vn/wp-content/uploads/2022/04/hinh-anh-hai-huoc-ba-dao-nhat-the-gioi.jpg" },
    ]);

    const [isEditing, setIsEditing] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(`https://i.pravatar.cc/150?u=${paramUsername}`);
    const [displayName, setDisplayName] = useState(paramUsername || "User");
    const [email, setEmail] = useState("");
    const [followers, setFollowers] = useState(0);
    const [following, setFollowing] = useState(0);
    // const [showSettings, setShowSettings] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const response = await axiosInstance.get(`http://localhost:3000/user/me`);
            // console.log('User profile data:', response.data.data);
            const userData = response.data.data;
            setDisplayName(userData.user.displayName || paramUsername);
            setEmail(userData.user.email || "");
            setFollowers(userData.followers.length || 0);
            setFollowing(userData.followings.length || 0);
            if (userData.user.avatar) {
            setAvatarUrl(`http://localhost:3000${userData.user.avatar}`);
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

            const response = await axiosInstance.patch('http://localhost:3000/user/update', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    withCredentials: true
                }
            });

            console.log('User updated:', response.data);
            alert('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await axiosInstance.post('http://localhost:3000/auth/logout', {}, {
                withCredentials: true, 
            });
        } catch (err) {
            console.warn('Logout API failed:', err);
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            navigate('/login');
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-info">
                    {isEditing ? (
                        <div className="edit-profile-form">
                            <div className="avatar-edit">
                                <img
                                    src={avatarUrl}
                                    alt="Avatar"
                                    className="profile-avatar"
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="avatar-upload-input"
                                    id="avatar-upload"
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
                            <img
                                src={avatarUrl}
                                alt="Avatar"
                                className="profile-avatar"
                            />
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
                        onClick={() => {
                            if (isEditing) {
                                handleSave();
                            } else {
                                setIsEditing(true);
                            }
                        }}
                    >
                        {isEditing ? "Save" : "Edit Profile"}
                    </button>

                    <button onClick={handleLogout} className="logout-button">
                        <FiLogOut /> Log out
                    </button>
                </div>
            </div>

            <div className="profile-posts">
                {posts.map(post => (
                    <div key={post.id} className="profile-post">
                        <img src={post.image} alt="Post" className="profile-post-image" />
                    </div>
                ))}
            </div>
        </div>
    );
}
