import { Link } from "react-router-dom";
import { FaHome, FaSearch, FaBell, FaUser, FaFire, FaComment, FaComments } from "react-icons/fa"; // Import icon
import "../styles/sidebar.css"; // Import file CSS riêng
import { FiSettings, FiLogOut } from "react-icons/fi";
import axiosInstance from "../utils/api";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = "http://localhost:3000";
import { useState, useRef, useEffect } from "react";
import logo from "../assets/Logo.jpg";
// import { useNavigate } from "react-router-dom";
import rankingAnimation from "../assets/beaee5e90d93bfafa5f5f55acb23abfd28ad180c.png";

export default function Sidebar() {
    const [rankings, setRankings] = useState([]);
    const navigate = useNavigate();
  

  const isTrendingPage = location.pathname === '/trending';

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
      const me = localStorage.getItem("user");
      console.log("Current user:", me);
      const currentUser = JSON.parse(me);
      const myId = currentUser.id;
      if (userId === myId) {
        navigate(`/profile/me`);
      }
      else {
        navigate(`/user/${userId}`);
      }
    };

    return (
        <>
        <div className="sidebar">
            <div className="sidebar-title">
                Tin hot nhất trong tháng
            </div>
            {isTrendingPage && <div className="partner-divider"></div>}

        <div className="partner-section">
        {isTrendingPage ? (
          <>
            <div className="partner-sidebar-tile">
              Bảng Xếp Hạng
            </div>
            <div className="ranking-list">
              {rankings.map((rank, index) => (
                <div 
                  key={rank.id || index} 
                  className="ranking-item" 
                  onClick={() => goToUserProfile(rank.id)}
                  style={index === 0 ? {
                    backgroundImage: `url(${rankingAnimation})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  } : {}}
                >
                  <div className="ranking-position">#{index + 1}</div>
                  <div className={`ranking-avatar-container ${index === 0 ? 'rank-1-avatar' : ''}`}>
                    <img
                      src={
                        rank.avatar
                          ? `http://localhost:3000${rank.avatar}`
                          : "https://via.placeholder.com/150"
                      }
                      alt="Avatar"
                      className="ranking-avatar-icon"
                    />
                    {index === 0 && (
                      <>
                        <div className="golden-frame"></div>
                        <div className="crown-icon">👑</div>
                      </>
                    )}
                  </div>
                  <div className="ranking-info">
                    <span className="ranking-name">{rank.displayName || rank.name}</span>
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
