import { Link } from "react-router-dom";
import { FaHome, FaSearch, FaBell, FaUser, FaFire, FaComment, FaComments } from "react-icons/fa"; // Import icon
import "../styles/sidebar.css"; // Import file CSS riêng
import { useUser } from "../context/UserContext";
import { FiSettings, FiLogOut } from "react-icons/fi";
import axiosInstance from "../utils/api";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = "http://localhost:3000";
import { useState, useRef, useEffect } from "react";
import logo from "../assets/Logo.jpg";

export default function Sidebar() {
    const { user } = useUser();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (showNotifications) {
            fetchNotifications(); // Gọi API khi mở dropdown
        }
    }, [showNotifications]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axiosInstance.get("/notification/user", {
                withCredentials: true, // Nếu API dùng cookie để xác thực
            });
            if (res.data?.data) {
                setNotifications(res.data.data); // Lưu data nhận được vào state notifications
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

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

    console.log(notifications);
    return (
        <div className="sidebar">
            <div className="sidebar-title">
                Tin hot nhất trong tháng
            </div>
        </div>
    );
}
