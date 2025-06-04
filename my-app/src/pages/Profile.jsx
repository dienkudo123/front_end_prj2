import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/Profile.css";
import axiosInstance from "../utils/api";
import { useUser } from "../context/UserContext";
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
  FaUserCircle,
  FaCoins,
} from "react-icons/fa";
import PostNoComment from "../components/PostNoComment";
import { Gender, Relationship } from "../utils/enum";

const API_BASE_URL = "http://localhost:3000";

export default function Profile() {
  const [posts, setPosts] = useState([]);
  const [sharePosts, setSharePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [displayName, setDisplayName] = useState("User");
  const [email, setEmail] = useState("");
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const paramUsername = "User";
  const { user, setUser } = useUser();
  const [bio, setBio] = useState("");
  const [hometown, setHometown] = useState("");
  const [school, setSchool] = useState("");
  const [birthday, setBirthday] = useState(null);
  const [gender, setGender] = useState("");
  const [relationship, setRelationship] = useState("");
  const [address, setAddress] = useState("");
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [frameUrl, setFrameUrl] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [point, setPoint] = useState(0);
  const [activeTab, setActiveTab] = useState("own");
  const { id: profileId } = useParams();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get(`/user/${profileId}`);
        const userData = response.data.data;
        console.log(userData);
        setDisplayName(userData.user.displayName || paramUsername);
        setEmail(userData.user.email || "");
        setFollowers(userData.followers.length || 0);
        setFollowing(userData.followings.length || 0);
        setBio(userData.user.bio || "");
        setHometown(userData.user.hometown || "");
        setSchool(userData.user.school || "");
        setBirthday(userData.user.birthday || null);
        setGender(userData.user.gender || "");
        setRelationship(userData.user.relationship || "");
        setAddress(userData.user.address || "");
        setPoint(userData.user.point || 0);
        if (userData.user.frameUrl) {
          setFrameUrl(`${API_BASE_URL}${userData.user.frameUrl}`);
        } else {
          setFrameUrl(null);
        }
        const followerIds = userData.followers.map((followers) => followers.id);
        setIsFollowing(followerIds.includes(user.id));
        if (userData.user.avatar) {
          setAvatarUrl(`${API_BASE_URL}${userData.user.avatar}`);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchUserProfile();
  }, [paramUsername, profileId, user.id]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }

    const formData = new FormData();
    formData.append("avatar", file);
    const response = await axiosInstance.patch(
      `${API_BASE_URL}/user/update`,
      formData
    );
    const updatedUserData = response.data.data;

    const updatedUser = {
      ...user,
      avatar: updatedUserData.avatar,
    };

    setUser(updatedUser);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("displayName", displayName);
      formData.append("email", email);
      formData.append("bio", bio);
      formData.append("hometown", hometown);
      formData.append("school", school);
      formData.append("birthday", birthday || new Date());
      formData.append("gender", gender);
      formData.append("relationship", relationship);
      formData.append("address", address);

      const response = await axiosInstance.patch(
        `${API_BASE_URL}/user/update`,
        formData
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
      setIsEditing(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      if (profileId) {
        try {
          const res = await axiosInstance.get(
            `${API_BASE_URL}/post/user-posts/${profileId}`
          );
          const resShare = await axiosInstance.get(
            `${API_BASE_URL}/post/shared/${profileId}`
          );
          setPosts(res.data.data || []);
          setSharePosts(resShare.data.data || []);
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
  }, [profileId]);

  const handleFollowToggle = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Bạn cần đăng nhập để thực hiện hành động này.");
        return;
      }
      await axiosInstance.post(`/user/follow/${profileId}`);
      setFollowers((prev) => prev + (isFollowing ? -1 : 1));
      setIsFollowing((prev) => !prev);
    } catch (err) {
      console.error("Follow/unfollow failed", err);
      alert("Thao tác thất bại, vui lòng thử lại.");
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const displayPosts = activeTab === "own" ? posts : sharePosts;

  if (loading) return <div></div>;

  return (
    <div className="profile-container">
      {/* Ảnh bìa */}
      <div className="cover-photo">
        {/* <img
          src="https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1350&q=80"
          alt="Ảnh bìa"
        /> */}
        <div className="avatar-wrapper">
          <div className="avatar-container">
            <img src={avatarUrl} alt="Avatar" className="avatar-profile" />
            {frameUrl && (
              <img src={frameUrl} alt="Avatar Frame" className="avatar-frame" />
            )}
          </div>
          {user.id === profileId && (
            <>
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
            </>
          )}
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
              userId={profileId}
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
              userId={profileId}
              onClose={() => setShowFollowingModal(false)}
            />
          )}
          <div className="follow-point">
            <div className="point-inline">
              <strong className="point-number">{point}</strong>
              <FaCoins className="point-icon" />
            </div>
            <span className="point-label">Points</span>
          </div>

          {user.id !== profileId && (
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
            <FaUserCircle style={{ marginRight: 8 }} /> Giới thiệu
          </h2>

          <p>
            <FaUser style={{ marginRight: 6 }} />
            <strong>Tên:</strong>{" "}
            {isEditing ? (
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            ) : (
              displayName
            )}
          </p>

          <p>
            <FaEnvelope style={{ marginRight: 6 }} />
            <strong>Email:</strong>{" "}
            {isEditing ? (
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            ) : (
              email
            )}
          </p>

          <p>
            <FaMapMarkerAlt style={{ marginRight: 6 }} />
            <strong>Địa chỉ:</strong>{" "}
            {isEditing ? (
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            ) : (
              address
            )}
          </p>

          <p>
            <FaInfoCircle style={{ marginRight: 6 }} />
            <strong>Tiểu sử:</strong>{" "}
            {isEditing ? (
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
            ) : (
              bio
            )}
          </p>

          <p>
            <FaHome style={{ marginRight: 6 }} />
            <strong>Quê quán:</strong>{" "}
            {isEditing ? (
              <input
                value={hometown}
                onChange={(e) => setHometown(e.target.value)}
              />
            ) : (
              hometown
            )}
          </p>

          <p>
            <FaSchool style={{ marginRight: 6 }} />
            <strong>Trường học:</strong>{" "}
            {isEditing ? (
              <input
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              />
            ) : (
              school
            )}
          </p>

          <p>
            <FaBirthdayCake style={{ marginRight: 6 }} />
            <strong>Ngày sinh:</strong>{" "}
            {isEditing ? (
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
            ) : (
              formatDate(birthday)
            )}
          </p>

          <p>
            {gender === Gender.Male ? (
              <FaMars style={{ marginRight: 6, color: "blue" }} />
            ) : (
              <FaVenus style={{ marginRight: 6, color: "pink" }} />
            )}
            <strong>Giới tính:</strong>{" "}
            {isEditing ? (
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                {Object.entries(Gender).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            ) : (
              Gender[gender]
            )}
          </p>

          <p>
            <FaHeart style={{ marginRight: 6, color: "red" }} />
            <strong>Mối quan hệ:</strong>{" "}
            {isEditing ? (
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
              >
                <option value="">-- Chọn --</option>
                {Object.entries(Relationship).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            ) : (
              Relationship[relationship]
            )}
          </p>
          {user.id === profileId && (
            <>
              {isEditing ? (
                <div>
                  <button onClick={handleSave}>Lưu</button>
                  <button onClick={() => setIsEditing(false)}>Hủy</button>
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)}>
                  Chỉnh sửa thông tin
                </button>
              )}
            </>
          )}
        </div>

        <div className="user-posts">
          <div className="tab-header">
            <button
              className={activeTab === "own" ? "active" : ""}
              onClick={() => handleTabClick("own")}
            >
              Bài đăng của {displayName}
            </button>
            <button
              className={activeTab === "shared" ? "active" : ""}
              onClick={() => handleTabClick("shared")}
            >
              Bài đăng {displayName} chia sẻ
            </button>
          </div>
          {displayPosts.map((post) => (
            <PostNoComment key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
