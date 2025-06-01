import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSettings, FiLogOut } from "react-icons/fi";
import "../styles/Profile.css";
import axiosInstance from "../utils/api";
import { useUser } from "../context/UserContext";
import { FiHome, FiAward } from "react-icons/fi";
import FollowersModal from "../components/FollowersModal";
import FollowingModal from "../components/FollowingModal";
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
  const [bio, setBio] = useState("");
  const [hometown, setHometown] = useState("");
  const [school, setSchool] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [relationship, setRelationship] = useState("");
  const [address, setAddress] = useState("");
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get(`${API_BASE_URL}/user/me`);
        const userData = response.data.data;
        setDisplayName(userData.user.displayName || paramUsername);
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
      } catch (error) {
        console.error("Error fetching profile:", error);
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
            <img src={avatarUrl} alt="Avatar" className="avatar-profile" />
            <img
              src="/frames/Khung lửa.webp"
              alt="Avatar Frame"
              className="avatar-frame"
            />
          </div>
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
      </div>
      <div className="profile-header">
        {/* Phần tên người dùng */}
        <div className="profile-username">
          <h1>{displayName}</h1>
          <p className="username">{`@${displayName}`}</p>
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
              userId={user?.id}
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
              userId={user?.id}
              onClose={() => setShowFollowingModal(false)}
            />
          )}
          <button
            className={`follow-button ${isFollowing ? "following" : ""}`}
            // onClick={handleFollowToggle}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        </div>
      </div>
      <div className="profile-main-content">
        <div className="user-info">
          <h2>
            <FaInfoCircle style={{ marginRight: 8 }} /> Giới thiệu
          </h2>
          <p>
            <FaUser style={{ marginRight: 6 }} />
            <strong>Tên:</strong> {displayName}
          </p>
          <p>
            <FaEnvelope style={{ marginRight: 6 }} />
            <strong>Email:</strong> {email}
          </p>
          <p>
            <FaMapMarkerAlt style={{ marginRight: 6 }} />
            <strong>Địa chỉ:</strong> {address}
          </p>
          <p>
            <FaInfoCircle style={{ marginRight: 6 }} />
            <strong>Tiểu sử:</strong> {bio}
          </p>
          <p>
            <FaHome style={{ marginRight: 6 }} />
            <strong>Quê quán:</strong> {hometown}
          </p>
          <p>
            <FaSchool style={{ marginRight: 6 }} />
            <strong>Trường học:</strong> {school}
          </p>
          <p>
            <FaBirthdayCake style={{ marginRight: 6 }} />
            <strong>Ngày sinh:</strong> {formatDate(birthday)}
          </p>
          <p>
            {gender === "Nam" ? (
              <FaMars style={{ marginRight: 6, color: "blue" }} />
            ) : (
              <FaVenus style={{ marginRight: 6, color: "pink" }} />
            )}
            <strong>Giới tính:</strong> {gender}
          </p>
          <p>
            <FaHeart style={{ marginRight: 6, color: "red" }} />
            <strong>Mối quan hệ:</strong> {relationship}
          </p>
        </div>

        <div className="user-posts">
          <h2>Bài đăng của {displayName}</h2>
          {posts.map((post) => <PostNoComment key={post.id} post={post}/>)}
        </div>
      </div>
    </div>
  );
}