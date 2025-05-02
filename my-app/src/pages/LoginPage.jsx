import React, { useState } from "react";
import "../styles/LoginPage.css"; 

export default function LoginPage() {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      const userData = await res.json();
      console.log("userData", userData);
      localStorage.setItem("token", userData.access_token);
      localStorage.setItem("user", JSON.stringify(userData.user));

      alert(`Xin chào, ${userData.user.username}!`);
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại"); 
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