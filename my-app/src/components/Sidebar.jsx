import { Link } from "react-router-dom";
import { FaHome, FaSearch, FaBell, FaUser, FaFire, FaComment, FaComments } from "react-icons/fa"; // Import icon
import "../styles/sidebar.css"; // Import file CSS riêng
import { useUser } from "../context/UserContext";
import { FiSettings, FiLogOut } from "react-icons/fi";
import axiosInstance from "../utils/api";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = "http://localhost:3000";

export default function Sidebar() {
    const { user } = useUser();
    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            await axiosInstance.post(
                `${API_BASE_URL}/auth/logout`,
                {},
                {
                    withCredentials: true,
                }
            );
        } catch (err) {
            console.warn("Logout API failed:", err);
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            navigate("/login");
        }
    };
    return (
        <div className="sidebar">
            <h3 className="sidebar-title">Instagram</h3>
            <nav className="sidebar-menu">
                <Link to={`/profile/me`} className="sidebar-link">
                    <img
                        src={user?.avatar ? `http://localhost:3000${user.avatar}` : "https://via.placeholder.com/150"}
                        alt="Avatar"
                        className="sidebar-avatar-icon"
                    />
                    Profile
                </Link>
                <Link to="/" className="sidebar-link">
                    <FaHome className="sidebar-icon" /> Home
                </Link>
                <Link to="/search" className="sidebar-link">
                    <FaSearch className="sidebar-icon" /> Search
                </Link>
                <Link to="/notifications" className="sidebar-link">
                    <FaBell className="sidebar-icon" /> Notifications
                </Link>
                <Link to="/trending" className="sidebar-link">
                    <FaFire className="sidebar-icon" /> Trending
                </Link>

                <button onClick={handleLogout} className="logout-button">
                    <FiLogOut /> Log out
                </button>
                
            </nav>
        </div>
    );
}
