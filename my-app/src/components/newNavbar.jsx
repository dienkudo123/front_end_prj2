import React, { useEffect, useState } from "react";
import { IoNotifications, IoSearch, IoPerson } from "react-icons/io5";
import "../styles/newNavbar.css";
import axiosInstance from "../utils/api";
import { formatTimeAgo } from "../utils/auth";

export default function NewNavbar({ onSearch }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications(); // Gọi API khi mở dropdown
    }
  }, [showNotifications]);

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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  console.log("Notifications:", notifications);

  return (
    <div className="navbar-wrapper">
      <nav className="new-navbar">
        <div className="navbar-container">
          <div className="navbar-content">
            {/* Logo */}
            <div className="navbar-logo">MyApp</div>

            {/* Search Bar */}
            <div className="navbar-search-container">
              <div className="search-wrapper">
                <IoSearch className="search-icon" size={20} />
                <input
                  type="text"
                  value={searchValue}
                  onChange={handleSearchChange}
                  placeholder="Tìm kiếm..."
                  className="new-navbar-search"
                />
              </div>
            </div>

            {/* Right side - Notifications & User */}
            <div className="navbar-actions">
              {/* Notification Bell */}
              <button
                onClick={toggleNotifications}
                className="notification-button"
              >
                <IoNotifications size={24} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>

              {/* User Avatar */}
              <button className="user-button">
                <IoPerson size={24} />
              </button>
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
                    !notification.isRead ? "unread" : ""
                  }`}
                >
                  <div
                    className={`notification-dot ${
                      !notification.isRead ? "unread" : "read"
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
                    <p
                      className={`notification-item-title ${
                        !notification.isRead ? "unread" : "read"
                      }`}
                    >
                      {notification.actorUser.displayName}
                    </p>
                    <p className="notification-item-message">
                      {notification.content}
                    </p>
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
