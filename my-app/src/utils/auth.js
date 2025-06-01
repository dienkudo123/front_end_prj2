import { jwtDecode } from "jwt-decode";

export function getUserId() {
    const token = localStorage.getItem("accessToken");
    if (token) {
        const decoded = jwtDecode(token);
        const { userId } = decoded.sub;
        return userId;
    }
    return null;
}

export function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // giây

  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;

  // Nếu lâu hơn 30 ngày, trả về dạng dd/mm/yyyy
  return date.toLocaleDateString("vi-VN");
}

export function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date)) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
  const year = date.getFullYear();

  return `${day}/${month}/${year}`; // định dạng DD/MM/YYYY
}