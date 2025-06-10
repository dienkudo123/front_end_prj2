import { Link, useLocation } from "react-router-dom";
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

export default function Sidebar({ currentTrend, setCurrentTrend }) {
  const [rankings, setRankings] = useState([]);
  const [trendPoint, setTrendPoint] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const isTrendingPage = location.pathname === "/trending";
  if (!isTrendingPage) {
    setCurrentTrend(null);
  }
  const newsLinks = [
    { title: "Top 10 xu hướng Xuân Hè 2025 từ tứ đại tuần lễ thời trang", href: "https://bazaarvietnam.vn/top-xu-huong-thoi-trang-xuan-he-2025/" },
    { title: "Dòng chảy xu hướng âm nhạc 2025", href: "https://thanhnien.vn/dong-chay-xu-huong-am-nhac-2025-18525011922402179.htm" },
    { title: "6 xu hướng du lịch của du khách Việt và châu Á yêu thích năm 2025", href: "https://nhandan.vn/6-xu-huong-du-lich-cua-du-khach-viet-va-chau-a-yeu-thich-nam-2025-post853914.html" },
  ];

  useEffect(() => {
    if (isTrendingPage && currentTrend) {
      const fetchRankings = async () => {
        try {
          const response = await axiosInstance.get(
            `trendTopic/trend-ranking/${currentTrend.id}`
          );
          const responsePoint = await axiosInstance.get(
            `trendTopic/trendPoint/${currentTrend.id}`
          );
          setRankings(response.data.data);
          setTrendPoint(responsePoint?.data?.point || 0);
        } catch (error) {
          console.error("Error fetching rankings:", error);
        }
      };

      fetchRankings();
    }
  }, [isTrendingPage, currentTrend]);

  const goToUserProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  console.log(rankings);

  return (
    <>
      <div className="sidebar">
        {(!isTrendingPage || !currentTrend) && (
          <>
            <div className="sidebar-title">Tin tức mới nhất trong tháng</div>
            <div className="underline"></div>
            <ul className="news-list">
              {newsLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    <span className="news-icon">📰</span>
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="sidebar-section">
          {isTrendingPage && currentTrend ? (
            <>
              <div className="sidebar-title">BXH Xu Hướng</div>
              <div className="trend-name-wrapper">
                <div className="trend-name">{currentTrend.title}</div>
              </div>
              <div className="underline"></div>

              <div className="ranking-list">
                {rankings.map((rank, index) => (
                  <div
                    key={rank.id || index}
                    className="ranking-item"
                    onClick={() => goToUserProfile(rank?.user.id)}
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
                          rank.user.avatar
                            ? `http://localhost:3000${rank.user.avatar}`
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
                        {rank.user.displayName || rank.user.name}
                      </span>
                      <span className="ranking-score">{rank.point} điểm</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Thêm div điểm hiện tại của bạn */}
              <div className="my-score">Điểm của bạn: {trendPoint} điểm</div>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
}
