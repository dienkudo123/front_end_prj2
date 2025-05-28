import React, { useState } from "react";
import "../styles/LoginPage.css"; 
import axiosInstance from "../utils/api";
import { useUser } from "../context/UserContext";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    // Login fields
    identifier: "",
    password: "",
    // Register fields
    username: "",
    displayName: "",
    email: "",
    avatar: "/uploads/user-images/default.png",
  });
  const [error, setError] = useState("");
  const { setUser } = useUser();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      identifier: "",
      password: "",
      username: "",
      displayName: "",
      email: "",
      avatar: "/uploads/user-images/default.png",
    });
    setError("");
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axiosInstance.post('http://localhost:3000/auth/login', {
        identifier: formData.identifier,
        password: formData.password,
      });

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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    
    const { username, displayName, email, password } = formData;
    
    // Validation
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
    if (username.length < 3 || username.length > 20) {
      setError("Tên người dùng phải có từ 3 đến 20 ký tự");
      return;
    }

    try {
      await axiosInstance.post("http://localhost:3000/auth/register", {
        username,
        displayName,
        email,
        password,
        avatar: formData.avatar,
      });

      alert("Đăng ký thành công!");
      setIsLogin(true);
      resetForm();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Đăng ký thất bại";
      setError(errorMessage);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        {/* Hình ảnh - chỉ hiển thị khi đăng nhập */}
        {isLogin && (
          <div className="login-images">
            <img src="https://i.pinimg.com/736x/33/cf/84/33cf842a8a22eb379cfde730df7bef8a.jpg" alt="post1" className="login-img" />
            <img src="https://i.pinimg.com/736x/58/ee/95/58ee95b701690e743c8d624aef4f2dab.jpg" alt="post2" className="login-img" />
          </div>
        )}

        {/* Form */}
        <div className="login-box">
          <h1 className="login-title">
            {isLogin ? "web gi dodo" : "Tạo tài khoản"}
          </h1>
          
          <form onSubmit={isLogin ? handleLogin : handleRegister} className="login-form">
            {isLogin ? (
              // Login Form
              <>
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
              </>
            ) : (
              // Register Form
              <>
                <input
                  type="text"
                  name="username"
                  placeholder="Tên người dùng"
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
              </>
            )}
            
            {error && <div className="error-msg">{error}</div>}
            <button type="submit">
              {isLogin ? "Đăng nhập" : "Đăng ký"}
            </button>
          </form>

          {isLogin && <div className="login-divider">HOẶC</div>}

          <div className="login-register">
            {isLogin ? (
              <>
                Bạn chưa có tài khoản?{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); switchMode(); }}>
                  Đăng ký
                </a>
              </>
            ) : (
              <>
                Đã có tài khoản?{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); switchMode(); }}>
                  Đăng nhập
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}