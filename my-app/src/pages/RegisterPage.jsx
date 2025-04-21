import { useState } from "react";
import "../styles/Auth.css";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = (e) => {
        e.preventDefault();
        alert(`Đăng ký: ${username} (${email})`);
        // TODO: Gửi request đăng ký
    };

    return (
        <div className="auth-container">
            <h2> Đăng ký</h2>
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Tên người dùng"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Đăng ký</button>
            </form>
        </div>
    );
}
