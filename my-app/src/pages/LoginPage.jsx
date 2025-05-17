import React, { useState } from "react";
import "../styles/LoginPage.css"; 
import axiosInstance from "../utils/api";
import { useUser } from "../context/UserContext";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { setUser } = useUser();


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axiosInstance.post('http://localhost:3000/auth/login', {
        ...formData
      })

      const userData = await res.data;
      localStorage.setItem("accessToken", userData.accessToken);
      localStorage.setItem("refreshToken", userData.refreshToken);
      localStorage.setItem("user", JSON.stringify(userData.user));
      setUser(userData.user);

      alert(`Xin chào, ${userData.user.username}!`);
      window.location.href = '/';
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Đăng nhập thất bại";
      setError(errorMessage);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        {/* Hình ảnh */}
        <div className="login-images">
          <img src="https://i.pinimg.com/736x/33/cf/84/33cf842a8a22eb379cfde730df7bef8a.jpg" alt="post1" className="login-img" />
          <img src="https://i.pinimg.com/736x/58/ee/95/58ee95b701690e743c8d624aef4f2dab.jpg" alt="post2" className="login-img" />
        </div>

        {/* Form đăng nhập */}
        <div className="login-box">
          <h1 className="login-title">web gi dodo</h1>
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="text"
              name="identifier"
              placeholder="Số điện thoại, tên người dùng hoặc email"
              value={formData.identifier}
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
            <button type="submit">Đăng nhập</button>
          </form>

          <div className="login-divider">HOẶC</div>

          <div className="login-register">
            Bạn chưa có tài khoản? <a href="/register">Đăng ký</a>
          </div>
        </div>
      </div>
    </div>
  );
}