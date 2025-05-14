import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiSettings, FiLogOut } from "react-icons/fi";
import "../styles/Profile.css";

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
    const [showSettings, setShowSettings] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        // api
        setIsEditing(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        navigate('/login');
    };


    return (
        <div className="profile-page">
            <div className="profile-header">
                {isEditing ? (
                    <>
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
                        />
                        <input
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="profile-username-input"
                        />
                    </>
                ) : (
                    <>
                        <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="profile-avatar"
                        />
                        <h2>{displayName}</h2>
                    </>
                )}

                <div className="profile-actions">
                    <button className="edit-profile-button" onClick={() => {
                        if (isEditing) {
                            handleSave();
                        } else {
                            setIsEditing(true);
                        }
                    }}>
                        {isEditing ? "Save" : "Edit Profile"}
                    </button>

                    <div className="settings-container">
                        <button 
                            className="settings-button"
                            onClick={() => setShowSettings(!showSettings)}
                        >
                            <FiSettings />
                        </button>
                        
                        {showSettings && (
                            <div className="settings-dropdown">
                                <button onClick={handleLogout} className="dropdown-item">
                                    <FiLogOut /> Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
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
