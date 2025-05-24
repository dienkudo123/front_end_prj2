import React, { useState } from 'react';
import { IoNotifications, IoSearch, IoPerson } from 'react-icons/io5';
import '../styles/newNavbar.css';

export default function NewNavbar({ onSearch }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  // Dữ liệu thông báo mẫu
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Bạn có một tin nhắn mới",
      message: "Nguyễn Văn A đã gửi tin nhắn cho bạn",
      time: "5 phút trước",
      isRead: false
    },
    {
      id: 2,
      title: "Cập nhật hệ thống",
      message: "Hệ thống sẽ bảo trì từ 2:00 - 4:00 sáng ngày mai",
      time: "1 giờ trước",
      isRead: false
    },
    {
      id: 3,
      title: "Hoạt động đăng nhập",
      message: "Tài khoản của bạn đã đăng nhập thành công",
      time: "2 giờ trước",
      isRead: true
    },
    {
      id: 4,
      title: "Nhắc nhở công việc",
      message: "Bạn có 3 công việc cần hoàn thành hôm nay",
      time: "3 giờ trước",
      isRead: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="navbar-wrapper">
      <nav className="new-navbar">
        <div className="navbar-container">
          <div className="navbar-content">
            
            {/* Logo */}
            <div className="navbar-logo">
              MyApp
            </div>

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
                  <span className="notification-badge">
                    {unreadCount}
                  </span>
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
              <button
                onClick={markAllAsRead}
                className="mark-all-read-btn"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <IoNotifications className="notification-empty-icon" size={48} />
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                >
                  <div className={`notification-dot ${!notification.isRead ? 'unread' : 'read'}`}></div>
                  <div className="notification-content">
                    <p className={`notification-item-title ${!notification.isRead ? 'unread' : 'read'}`}>
                      {notification.title}
                    </p>
                    <p className="notification-item-message">
                      {notification.message}
                    </p>
                    <p className="notification-item-time">
                      {notification.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="notification-footer">
            <button className="view-all-btn">
              Xem tất cả thông báo
            </button>
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