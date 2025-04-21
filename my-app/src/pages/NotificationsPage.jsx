import { useState } from "react";
import "../styles/NotificationsPage.css"; // Import CSS riêng cho trang thông báo

// Danh sách ảnh avatar mẫu
const avatars = [
    "https://i.pravatar.cc/40?img=1",
    "https://i.pravatar.cc/40?img=2",
    "https://i.pravatar.cc/40?img=3",
    "https://i.pravatar.cc/40?img=4",
    "https://i.pravatar.cc/40?img=5",
];

// Danh sách người gửi mẫu
const senders = ["Nguyễn Văn A", "Trần Thị B", "Lê Văn C", "Phạm Thị D", "Hoàng Anh"];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([
        { id: 1, sender: "Nguyễn Văn A", message: "Bình luận mới trên bài viết của bạn", avatar: avatars[0], read: false },
        { id: 2, sender: "Trần Thị B", message: "Ai đó đã thích bài viết của bạn", avatar: avatars[1], read: false },
        { id: 3, sender: "Lê Văn C", message: "Bạn có một tin nhắn mới", avatar: avatars[2], read: true }
    ]);

    // Đánh dấu thông báo đã đọc
    const markAsRead = (id) => {
        setNotifications((prev) =>
            prev.map((notif) =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    // Thêm thông báo mới ngẫu nhiên
    const refreshNotifications = () => {
        const randomIndex = Math.floor(Math.random() * senders.length);
        const newNotification = {
            id: notifications.length + 1,
            sender: senders[randomIndex],
            message: `Thông báo mới từ ${senders[randomIndex]}`,
            avatar: avatars[randomIndex],
            read: false,
        };
        setNotifications([newNotification, ...notifications]);
    };

    return (
        <div className="notifications-page">
            <ul className="notifications-list">
                {notifications.map((notif) => (
                    <li
                        key={notif.id}
                        className={`notification-item ${notif.read ? "read" : "unread"}`}
                        onClick={() => markAsRead(notif.id)}
                    >
                        <img src={notif.avatar} alt="Avatar" className="avatar" />
                        <div className="notification-content">
                            <strong className="sender">{notif.sender}</strong>
                            <p className="message">{notif.message}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
