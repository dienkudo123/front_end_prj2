import { Link } from "react-router-dom";
import {
  FaHome,
  FaSearch,
  FaBell,
  FaUser,
  FaFire,
  FaComment,
  FaComments,
} from "react-icons/fa"; // Import icon
import "../styles/sidebar.css"; // Import file CSS riêng
import { FiSettings, FiLogOut } from "react-icons/fi";
import axiosInstance from "../utils/api";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = "http://localhost:3000";
import { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const [rankings, setRankings] = useState([]);
  const navigate = useNavigate();

  const isTrendingPage = true;

  useEffect(() => {
    if (isTrendingPage) {
      const fetchRankings = async () => {
        try {
          const response = await axiosInstance.get(`user/ranking`);
          setRankings(response.data.data);
          console.log("Rankings:", response.data.data);
        } catch (error) {
          console.error("Error fetching rankings:", error);
        }
      };

      fetchRankings();
    }
  }, [isTrendingPage]);

  useEffect(() => {
    if (isTrendingPage) {
      const fetchRankings = async () => {
        try {
          const response = await axiosInstance.get(`user/ranking`);
          setRankings(response.data.data);
          console.log("Rankings:", response.data.data);
        } catch (error) {
          console.error("Error fetching rankings:", error);
        }
      };

      fetchRankings();
    }
  }, [isTrendingPage]);

  const goToUserProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <>
      <div className="sidebar">
        {/* {!isTrendingPage && (
          <div className="sidebar-title">Tin hot nhất trong tháng</div>
        )} */}

        <div className="sidebar-section">
          {isTrendingPage ? (
            <>
              <div className="sidebar-title">Bảng Xếp Hạng</div>
              <div className="ranking-list">
                {rankings.map((rank, index) => (
                  <div
                    key={rank.id || index}
                    className="ranking-item"
                    onClick={() => goToUserProfile(rank.id)}
                  >
                    <div className="ranking-position">#{index + 1}</div>
                    <div
                      className={`ranking-avatar-container ${
                        index === 0
                          ? "rank-1-avatar"
                          : index === 1
                          ? "rank-2-avatar"
                          : index === 2
                          ? "rank-3-avatar"
                          : ""
                      }`}
                    >
                      <img
                        src={
                          rank.avatar
                            ? `http://localhost:3000${rank.avatar}`
                            : "https://via.placeholder.com/150"
                        }
                        alt="Avatar"
                        className="ranking-avatar-icon"
                      />

                      {/* Khung viền hiệu ứng cho top 3 */}
                      {(index === 0 || index === 1 || index === 2) && (
                        <div
                          className={
                            index === 0
                              ? "golden-frame"
                              : index === 1
                              ? "silver-frame"
                              : "bronze-frame"
                          }
                        ></div>
                      )}

                      {/* Biểu tượng vương miện / huy chương */}
                      {index === 0 && <div className="crown-icon">👑</div>}
                    </div>

                    <div className="ranking-info">
                      <span className="ranking-name">
                        {rank.displayName || rank.name}
                      </span>
                      <span className="ranking-score">{rank.point} điểm</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
           ) : (
            <></>
          )} 
        </div>
      </div>
    </>
  );
}
