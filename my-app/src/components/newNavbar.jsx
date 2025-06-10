import React, { useEffect, useState } from "react";
import {
  IoNotifications,
  IoSearch,
  IoPerson,
  IoHome,
  IoTrendingUp,
  IoLogOut,
  IoFlame,
  IoStorefront,
  IoSettings,
} from "react-icons/io5";
import "../styles/newNavbar.css";
import axiosInstance from "../utils/api";
import { formatTimeAgo } from "../utils/auth";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";
import { useUser } from "../context/UserContext";
import { io } from "socket.io-client";

const API_BASE_URL = "http://localhost:3000";
const socket = io("http://localhost:3000");

export default function NewNavbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get("/notification/user", {
        withCredentials: true, // Nếu API dùng cookie để xác thực
      });
      if (res.data?.data) {
        setNotifications(res.data.data); // Lưu data nhận được vào state notifications
        const unreadNotifications = res.data.data.filter(
          (n) => n.status === "UNREAD"
        ).length;
        setUnreadCount(unreadNotifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = async (id) => {
    try {
      await axiosInstance.patch(
        "/notification/read",
        {
          ids: [id],
        },
        {}
      );
      await fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.patch(
        "/notification/read",
        {
          ids: notifications.filter((n) => !n.isRead).map((n) => n.id),
        },
        {}
      );
      await fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
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

  useEffect(() => {
    socket.emit("register", user.id);
    const handleNotification = ({ userId, actor, actorUser, content, status, createdAt }) => {
      const newNotification = { userId, actor, actorUser, content, status, createdAt };
      setNotifications((prevNotifications) => ([newNotification, ...prevNotifications]));
      setUnreadCount((unreadCount) => unreadCount + 1);
    }
    socket.on('notification', handleNotification);
    
    return () => {
      socket.off("notification", handleNotification);
    };
  }, [user.id])

  // Kiểm tra xem user có phải admin không
  const isAdmin = user?.role === "Admin" || user?.role === "admin";

  return (
    <div className="navbar-wrapper">
      <nav className="new-navbar">
        <div className="navbar-container">
          <div className="navbar-content">
            <div className="navbar-actions">
              <div className="navbar-icon-wrapper">
                <img src={logo} alt="Logo" className="navbar-logo"/>
              </div>
              <div className="navbar-icon-wrapper">
                <Link to={"/"}>
                  <button className="navbar-icon-button" title="Trang chủ">
                    <IoHome size={24} />
                    <span className="navbar-icon-label">Trang chủ</span>
                  </button>
                </Link>
              </div>

              <div className="navbar-icon-wrapper">
                <Link to={"/trending"}>
                  <button className="navbar-icon-button" title="Xu hướng">
                    <IoFlame size={24} color="orangered" />
                    <span className="navbar-icon-label">Xu hướng</span>
                  </button>
                </Link>
              </div>

              <div className="navbar-icon-wrapper">
                <Link to={`/profile/${user.id}`}>
                  <button className="navbar-icon-button" title="Hồ sơ">
                    <IoPerson size={24} />
                    <span className="navbar-icon-label">Hồ sơ</span>
                  </button>
                </Link>
              </div>

              <div className="navbar-icon-wrapper">
                <Link to={"/shop"}>
                  <button className="navbar-icon-button" title="Cửa hàng">
                    <IoStorefront size={24} />
                    <span className="navbar-icon-label">Cửa hàng</span>
                  </button>
                </Link>
              </div>

              <div className="navbar-icon-wrapper">
                <button
                  onClick={toggleNotifications}
                  className="navbar-icon-button"
                  title="Thông báo"
                >
                  <IoNotifications size={24} />
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                  <span className="navbar-icon-label">Thông báo</span>
                </button>
              </div>
              {/* Icon Quản lý User - chỉ hiển thị cho admin */}
              {isAdmin && (
                <div className="navbar-icon-wrapper">
                  <Link to={"/admin/users"}>
                    <button className="navbar-icon-button" title="Quản lý User">
                      <IoSettings size={24} />
                      <span className="navbar-icon-label">Quản lý</span>
                    </button>
                  </Link>
                </div>
              )}

              <div className="navbar-icon-wrapper">
                <button
                  className="navbar-icon-button"
                  title="Đăng xuất"
                  onClick={handleLogout}
                >
                  <IoLogOut size={24} />
                  <span className="navbar-icon-label">Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Notification Popup */}
      {showNotifications && (
        <div className="notification-popup">
          {/* Header */}
          <div className="notification-header">
            <h3 className="notification-title">Thông báo</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-read-btn">
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <IoNotifications
                  className="notification-empty-icon"
                  size={48}
                />
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`notification-item ${
                    notification.status === "UNREAD" ? "unread" : ""
                  }`}
                >
                  <div
                    className={`notification-dot ${
                      notification.status === "UNREAD" ? "unread" : "read"
                    }`}
                  ></div>
                  <div className="notification-content">
                    <img
                      src={
                        notification.actorUser.avatar
                          ? `http://localhost:3000${notification.actorUser.avatar}`
                          : "https://via.placeholder.com/150"
                      }
                      alt="Avatar"
                      className="notification-avatar"
                    />
                    <div className="notification-content-text">
                      <p className="notification-item-combined">
                        <span className="notification-item-title">
                          {notification.actorUser.displayName}{" "}
                        </span>
                        {notification.content}
                      </p>
                    </div>
                    <p className="notification-item-time">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="notification-footer">
            <button className="view-all-btn">Xem tất cả thông báo</button>
          </div>
        </div>
      )}

      {/* Overlay to close popup */}
      {showNotifications && (
        <div
          className="notification-overlay"
          onClick={() => setShowNotifications(false)}
        ></div>
      )}
      
    </div>
  );
}