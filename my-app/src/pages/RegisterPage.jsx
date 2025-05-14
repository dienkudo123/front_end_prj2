import { useState } from "react";
import "../styles/LoginPage.css"; // Dùng chung CSS với trang login

import axiosInstance from "../utils/api";


export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    const { username, displayName, email, password } = formData;
    if (!username || !displayName || !email || !password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email không hợp lệ");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(displayName)) {
      setError("Tên hiển thị chỉ được chứa chữ cái, số và dấu gạch dưới");
      return;
    }
    if (username.length < 3 || username.length > 20) {
      setError("Tên người dùng phải có từ 3 đến 20 ký tự");
      return;
    }
    try {
// <<<<<<< HEAD
//       const res = await fetch("http://localhost:4000/auth/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });
//       if (!res.ok) {
//           const error = await res.json();
//           throw new Error(error.message);
//       }
        
//       alert("Đăng ký thành công!");
//     } catch (err) {
//       setError(err.message || "Đăng ký thất bại");
// =======
      const res = await axiosInstance.post(
        "http://localhost:3000/auth/register",
        {
          ...formData,
        }
      );

      const userData = res.data;
      localStorage.setItem("accessToken", userData.accessToken);
      localStorage.setItem("user", JSON.stringify(userData.user));

      alert("Đăng ký thành công!");
      window.location.href = '/login';
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Đăng ký thất bại";
      setError(errorMessage);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Tạo tài khoản</h1>
        <form onSubmit={handleRegister} className="login-form">
{/* <<<<<<< HEAD
            <input
              type="text"
              name="username"
              placeholder="Tên người dùng "
              value={formData.username}
              onChange={handleChange}
              required
            />
======= */}
          <input
            type="text"
            name="username"
            placeholder="Tên người dùng "
            value={formData.username}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="displayName"
            placeholder="Tên hiển thị"
            value={formData.displayName}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {error && <div className="error-msg">{error}</div>}
          <button type="submit">Đăng ký</button>
        </form>
        <div className="login-register">
          Đã có tài khoản? <a href="/login">Đăng nhập</a>
        </div>
      </div>
    </div>
  );
}
