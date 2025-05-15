import { useState, useEffect } from "react";
import axios from "axios";

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

        if (token) {
            axios
                .get(`http://localhost:3000/post/user-posts/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    setPosts(res.data.data);
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


    return (
        <div className="profile-page">
            <div className="profile-header">
                <img
                    src={`https://i.pravatar.cc/150?u=${username}`}
                    alt="Avatar"
                    className="profile-avatar"
                />
                <h2>{username}</h2>
                {/*<button className="edit-profile-button">Edit Profile</button>*/}
            </div>

            <div className="profile-posts">
                {posts.length === 0 && <p>Không có bài đăng nào.</p>}
                {posts.map((post) => (
                    <div key={post.id} className="profile-post">
                        {post.imageUrl && (
                            <img
                                src={post.imageUrl}
                                alt="Post"
                                className="profile-post-image"
                            />
                        )}
                        {post.videoUrl && (
                            <video controls className="profile-post-video">
                                <source src={post.videoUrl} type="video/mp4" />
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
