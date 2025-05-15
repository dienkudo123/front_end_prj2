import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

export default function Profile() {
    const [username, setUsername] = useState("User");
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const getUserFromLocalStorage = () => {
        const userData = localStorage.getItem("user");
        if (!userData) return null;
        try {
            return JSON.parse(userData);
        } catch (error) {
            console.error("Error parsing user data:", error);
            return null;
        }
    };

    const getTokenFromLocalStorage = () => {
        return localStorage.getItem("accessToken");
    };

    useEffect(() => {
        const user = getUserFromLocalStorage();
        const token = getTokenFromLocalStorage();

        if (user && user.username) {
            setUsername(user.username);
        }

        if (user?.id && token) {
            axios
                .get(`${API_BASE_URL}/post/user-posts/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    setPosts(res.data.data || []);
                })
                .catch((err) => {
                    console.error("Error fetching posts:", err);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
            console.warn("User or token not found in localStorage");
        }
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    // Hàm helper để lấy URL đầy đủ cho ảnh hoặc video
    const fullUrl = (url) => {
        if (!url) return "";
        if (url.startsWith("http")) return url;
        return `${API_BASE_URL}${url}`;
    };

    return (
        <div className="profile-page">
            <div className="profile-header">
                <img
                    src={`https://i.pravatar.cc/150?u=${username}`}
                    alt="Avatar"
                    className="profile-avatar"
                />
                <h2>{username}</h2>
            </div>

            <div className="profile-posts">
                {posts.length === 0 && <p>Không có bài đăng nào.</p>}
                {posts.map((post) => (
                    <div key={post.id} className="profile-post">
                        {post.imageUrl && (
                            <img
                                src={fullUrl(post.imageUrl)}
                                alt="Post"
                                className="profile-post-image"
                            />
                        )}
                        {post.videoUrl && (
                            <video controls className="profile-post-video">
                                <source src={fullUrl(post.videoUrl)} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        )}
                        <h3>{post.title}</h3>
                        <p>{post.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
