import { useEffect, useState } from "react";
import axiosInstance from "../utils/api";
import "../styles/FollowersModal.css";
import {useNavigate} from "react-router-dom";

const API_BASE_URL = "http://localhost:3000";

export default function FollowersModal({ userId, onClose }) {
    const [followers, setFollowers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFollowers = async () => {
            try {
                const res = await axiosInstance.get(`${API_BASE_URL}/user/followers/${userId}`);
                setFollowers(res.data.data || []);
            } catch (err) {
                console.error("Error fetching followers:", err);
            }
        };
        if (userId) fetchFollowers();
    }, [userId]);

    const goToUserProfile = (userId) => {
        navigate(`/user/${userId}`);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Followers</h3>
                {followers.length === 0 ? (
                    <p>No followers yet.</p>
                ) : (
                    <ul className="followers-list">
                        {followers.map((f) => (
                            <li key={f.id} className="follower-item">
                                <img src={`${API_BASE_URL}${f.avatar}`} alt="avatar"/>
                                <span
                                    onClick={() => goToUserProfile(f.id)}
                                    style={{cursor: "pointer", fontWeight: "bold"}}
                                >
                                    {f.displayName || "Unnamed User"}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
                <button onClick={onClose} className="close-button">&times;</button>
            </div>
        </div>
    );
}
