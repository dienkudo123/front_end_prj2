import { Link } from "react-router-dom";
import { FaHome, FaSearch, FaBell, FaUser, FaFire } from "react-icons/fa"; // Import icon
import "../styles/sidebar.css"; // Import file CSS riêng

export default function Sidebar() {
    const username = "john_doe"; // Thay bằng tên user thật

    return (
        <div className="sidebar">
            <h3 className="sidebar-title">Instagram</h3>
            <nav className="sidebar-menu">
                <Link to="/" className="sidebar-link">
                    <FaHome className="sidebar-icon" /> Home
                </Link>
                <Link to="/search" className="sidebar-link">
                    <FaSearch className="sidebar-icon" /> Search
                </Link>
                <Link to="/notifications" className="sidebar-link">
                    <FaBell className="sidebar-icon" /> Notifications
                </Link>
                <Link to={`/profile/${username}`} className="sidebar-link">
                    <FaUser className="sidebar-icon" /> Profile
                </Link>
                <Link to="/trending" className="sidebar-link">
                    <FaFire className="sidebar-icon" /> Trending
                </Link>
            </nav>
        </div>
    );
}
