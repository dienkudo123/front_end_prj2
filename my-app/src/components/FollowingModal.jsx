import { useEffect, useState } from "react";
import axiosInstance from "../utils/api";
import "../styles/FollowersModal.css";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:3000";

export default function FollowingModal({ userId, onClose }) {
  const [following, setFollowing] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await axiosInstance.get(
          `${API_BASE_URL}/user/following/${userId}`
        );
        setFollowing(res.data.data || []);
      } catch (err) {
        console.error("Error fetching following:", err);
      }
    };
    if (userId) fetchFollowing();
  }, [userId]);

  const goToUserProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="modal-backdrop-follow" onClick={onClose}>
      <div
        className="modal-content-follow"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Following</h3>
        {following.length === 0 ? (
          <p>No following yet.</p>
        ) : (
          <ul className="followers-list">
            {following.map((f) => (
              <li key={f.id} className="follower-item">
                <img src={`${API_BASE_URL}${f.avatar}`} alt="avatar" />
                <span
                  onClick={() => {
                    onClose();
                    goToUserProfile(f.id);
                  }}
                  style={{ cursor: "pointer", fontWeight: "bold" }}
                >
                  {f.displayName || "Unnamed User"}
                </span>
              </li>
            ))}
          </ul>
        )}
        <button onClick={onClose} className="close-button">
          &times;
        </button>
      </div>
    </div>
  );
}
