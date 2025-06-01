import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiSettings, FiLogOut } from "react-icons/fi";
import "../styles/Profile.css";
import axiosInstance from "../utils/api";
import { useUser } from "../context/UserContext";
import { FiHome, FiAward } from "react-icons/fi";
import FollowersModal from "../components/FollowersModal";
import FollowingModal from "../components/FollowingModal";

const API_BASE_URL = "http://localhost:3000";

export default function Profile() {
    const navigate = useNavigate();
    const { userId } = useParams(); // Lấy userId từ URL params
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState("");
    const [displayName, setDisplayName] = useState("User");
    const [email, setEmail] = useState("");
    const [followers, setFollowers] = useState(0);
    const [following, setFollowing] = useState(0);
    const [followersList, setFollowersList] = useState([]);
    const [followingList, setFollowingList] = useState([]);
    const [avatarFile, setAvatarFile] = useState(null);
    const { user, setUser } = useUser();
    const [bio, setBio] = useState("");
    const [hometown, setHometown] = useState("");
    const [school, setSchool] = useState("");
    const [activeTab, setActiveTab] = useState("posts");
    const [birthday, setBirthday] = useState("");
    const [gender, setGender] = useState("");
    const [relationship, setRelationship] = useState("");
    const [address, setAddress] = useState("");
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [showFollowingModal, setShowFollowingModal] = useState(false);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [profileUserId, setProfileUserId] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const me = localStorage.getItem("user");
            const meData = me ? JSON.parse(me) : null;
            const myId = meData?.id;
            
            try {
                let response;
                let targetUserId;
                
                // Kiểm tra xem có phải trang cá nhân của mình không
                if (!userId || userId === myId) {
                    // Trả về trang cá nhân của tôi
                    response = await axiosInstance.get(`${API_BASE_URL}/user/me`);
                    setIsOwnProfile(true);
                    targetUserId = myId;
                } else {
                    // Trả về thông tin người khác
                    response = await axiosInstance.get(`${API_BASE_URL}/user/${userId}`);
                    setIsOwnProfile(false);
                    targetUserId = userId;
                }
                
                console.log("User profile response:", response.data);
                const userData = response.data.data;
                setProfileUserId(userData.user.id);
                setDisplayName(userData.user.displayName || "User");
                setEmail(userData.user.email || "");
                setFollowers(userData.followers.length || 0);
                setFollowing(userData.followings.length || 0);
                setBio(userData.user.bio || "");
                setHometown(userData.user.hometown || "");
                setSchool(userData.user.school || "");
                setBirthday(userData.user.birthday || "");
                setGender(userData.user.gender || "");
                setRelationship(userData.user.relationship || "");
                setAddress(userData.user.address || "");

                if (userData.user.avatar) {
                    setAvatarUrl(`${API_BASE_URL}${userData.user.avatar}`);
                }

                // Lấy danh sách followers
                const followersRes = await axiosInstance.get(`${API_BASE_URL}/user/followers/${userData.user.id}`);
                setFollowersList(followersRes.data.data || []);

                // Lấy danh sách following
                const followingRes = await axiosInstance.get(`${API_BASE_URL}/user/following/${userData.user.id}`);
                setFollowingList(followingRes.data.data || []);

            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        fetchUserProfile();
    }, [userId]);

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
            formData.append("bio", bio);
            formData.append("hometown", hometown);
            formData.append("school", school);
            formData.append("birthday", birthday);
            formData.append("gender", gender);
            formData.append("relationship", relationship);
            formData.append("address", address);

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

            const updatedUserData = response.data.data;

            const updatedUser = {
                ...user,
                displayName: updatedUserData.displayName,
                avatar: updatedUserData.avatar,
                bio: updatedUserData.bio,
                hometown: updatedUserData.hometown,
                school: updatedUserData.school,
                birthday: updatedUserData.birthday,
                gender: updatedUserData.gender,
                relationship: updatedUserData.relationship,
                address: updatedUserData.address,
            };

            setUser(updatedUser);

            alert("Profile updated successfully!");
            setIsEditing(false);
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

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
    console.log(hometown);

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-info">
                    {isEditing ? (
                        <div className="edit-profile-form">
                            <div className="avatar-edit">
                                <img src={avatarUrl} alt="Avatar" className="profile-avatar"/>
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
                                <input
                                    type="text"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Bio"
                                    className="profile-input"
                                />
                                <input
                                    type="text"
                                    value={hometown}
                                    onChange={(e) => setHometown(e.target.value)}
                                    placeholder="Quê quán"
                                    className="profile-input"
                                />
                                <input
                                    type="text"
                                    value={school}
                                    onChange={(e) => setSchool(e.target.value)}
                                    placeholder="Trường học"
                                    className="profile-input"
                                />
                                <input
                                    type="date"
                                    value={birthday?.substring(0, 10)}
                                    onChange={(e) => setBirthday(e.target.value)}
                                    placeholder="Birthday"
                                    className="profile-input"
                                />
                                <input
                                    type="text"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    placeholder="Gender"
                                    className="profile-input"
                                />
                                <input
                                    type="text"
                                    value={relationship}
                                    onChange={(e) => setRelationship(e.target.value)}
                                    placeholder="Relationship Status"
                                    className="profile-input"
                                />
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Address"
                                    className="profile-input"
                                />

                            </div>
                        </div>
                    ) : (
                        <>
                            <img src={avatarUrl} alt="Avatar" className="profile-avatar"/>
                            <div className="profile-stats">
                                <h2>{displayName}</h2>
                                <div className="stats-container">
                                    <div className="stat-item">
                                        <span className="stat-value">{posts.length}</span>
                                        <span className="stat-label">posts</span>
                                    </div>
                                    <div className="stat-item" onClick={() => setShowFollowersModal(true)}>
                                        <span className="stat-value">{followers}</span>
                                        <span className="stat-label">followers</span>
                                    </div>
                                    {showFollowersModal && (
                                        <FollowersModal userId={user?.id} onClose={() => setShowFollowersModal(false)} />
                                    )}
                                    <div className="stat-item"  onClick={() => setShowFollowingModal(true)}>
                                        <span className="stat-value">{following}</span>
                                        <span className="stat-label">following</span>
                                    </div>
                                    {showFollowingModal && (
                                        <FollowingModal userId={user?.id} onClose={() => setShowFollowingModal(false)} />
                                    )}
                                </div>
                                {bio && <p className="profile-bio">{bio}</p>}
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
                </div>
            </div>
            <div className="profile-extra-info">
                {hometown && (
                    <p>
                        <img
                            src="https://static.xx.fbcdn.net/rsrc.php/v4/yc/r/-e1Al38ZrZL.png"
                            alt="Hometown Icon"
                            className="info-icon"
                        />
                        {hometown}
                    </p>
                )}
                {school && (
                    <p>
                        <img
                            src="https://static.xx.fbcdn.net/rsrc.php/v4/yS/r/jV4o8nAgIEh.png"
                            alt="School Icon"
                            className="info-icon"
                        />
                        {school}
                    </p>
                )}
            </div>


            <div className="profile-tabs">
                <button
                    className={activeTab === "posts" ? "tab-button active" : "tab-button"}
                    onClick={() => setActiveTab("posts")}
                >
                    <svg
                        aria-label=""
                        className="icon-svg"
                        fill="currentColor"
                        height="12"
                        role="img"
                        viewBox="0 0 24 24"
                        width="12"
                    >
                        <title></title>
                        <rect fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                              strokeWidth="2" width="18" x="3" y="3"></rect>
                        <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                              strokeWidth="2" x1="9.015" x2="9.015" y1="3" y2="21"></line>
                        <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                              strokeWidth="2" x1="14.985" x2="14.985" y1="3" y2="21"></line>
                        <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                              strokeWidth="2" x1="21" x2="3" y1="9.015" y2="9.015"></line>
                        <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                              strokeWidth="2" x1="21" x2="3" y1="14.985" y2="14.985"></line>
                    </svg>
                    POSTS
                </button>
                <button
                    className={activeTab === "info" ? "tab-button active" : "tab-button"}
                    onClick={() => setActiveTab("info")}
                >
                    <svg aria-label="" className="x1lliihq x1n2onr6 x1roi4f4" fill="currentColor" height="12" role="img"
                         viewBox="0 0 24 24" width="12"><title></title>
                        <path
                            d="M10.201 3.797 12 1.997l1.799 1.8a1.59 1.59 0 0 0 1.124.465h5.259A1.818 1.818 0 0 1 22 6.08v14.104a1.818 1.818 0 0 1-1.818 1.818H3.818A1.818 1.818 0 0 1 2 20.184V6.08a1.818 1.818 0 0 1 1.818-1.818h5.26a1.59 1.59 0 0 0 1.123-.465Z"
                            fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2"></path>
                        <path
                            d="M18.598 22.002V21.4a3.949 3.949 0 0 0-3.948-3.949H9.495A3.949 3.949 0 0 0 5.546 21.4v.603"
                            fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2"></path>
                        <circle cx="12.072" cy="11.075" fill="none" r="3.556" stroke="currentColor"
                                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></circle>
                    </svg>
                    IMFORMATION
                </button>
            </div>
            {activeTab === "info" && (
                <div className="info">
                    {birthday && <p><strong>Birthday:</strong> {birthday.substring(0, 10)}</p>}
                    {gender && <p><strong>Gender:</strong> {gender}</p>}
                    {relationship && <p><strong>Relationship:</strong> {relationship}</p>}
                    {address && <p><strong>Address:</strong> {address}</p>}
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
                                    onClick={() => navigate(`/post/${post.id}`)}
                                />
                            )}
                            {post.videoUrl && (
                                <video controls className="profile-post-video">
                                    <source src={fullUrl(post.videoUrl)} type="video/mp4"/>
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
