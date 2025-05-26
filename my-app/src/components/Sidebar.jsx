import { Link } from "react-router-dom";
import { FaHome, FaSearch, FaBell, FaUser, FaFire, FaComment, FaComments } from "react-icons/fa"; // Import icon
import "../styles/sidebar.css"; // Import file CSS riêng
import { useUser } from "../context/UserContext";
import { FiSettings, FiLogOut } from "react-icons/fi";
import axiosInstance from "../utils/api";
import { useNavigate } from "react-router-dom";

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
            <h3 className="sidebar-title">Webgidodo</h3>
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
                    <svg aria-label="Home" className="x1lliihq x1n2onr6 x5n08af" fill="currentColor" height="24"
                         role="img" viewBox="0 0 24 24" width="24"><title>Home</title>
                        <path
                            d="M9.005 16.545a2.997 2.997 0 0 1 2.997-2.997A2.997 2.997 0 0 1 15 16.545V22h7V11.543L12 2 2 11.543V22h7.005Z"
                            fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                    Home
                </Link>
                <Link to="/search" className="sidebar-link">
                    <img
                        src="https://www.svgrepo.com/show/532551/search-alt-1.svg"
                        alt="Search Icon"
                        className="sidebar-icon"
                    />
                    Search
                </Link>
                <Link to="/chat" className="sidebar-link">
                    <img
                        src="https://www.svgrepo.com/show/390893/chat-round.svg"
                        alt="Chat Icon"
                        className="sidebar-icon"
                    />{" "}
                    Chat
                </Link>
                <Link to="/notifications" className="sidebar-link">
                    <svg aria-label="Notifications" className="x1lliihq x1n2onr6 x5n08af" fill="currentColor"
                         height="24" role="img" viewBox="0 0 24 24" width="24"><title>Notifications</title>
                        <path
                            d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path>
                    </svg>
                    Notifications
                </Link>
                <Link to="/trending" className="sidebar-link">
                    <img src="https://www.svgrepo.com/show/461457/fire-left.svg" alt="Trending Icon" className="sidebar-icon" />
                    Trending
                </Link>


                <button onClick={handleLogout} className="logout-button">
                    <FiLogOut/> Log out
                </button>

            </nav>
        </div>
    );
}
