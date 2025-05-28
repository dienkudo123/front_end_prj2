import { useEffect, useState } from "react";
import axios from "axios";
import Post from "./Post";
import "../styles/feed.css";
import NewNavbar from "./newNavbar";

export default function Feed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            window.location.href = '/login';
        }
    }, [])

    useEffect(() => {
        setLoading(true);
        axios.get("http://localhost:3000/post")  // gọi API lấy tất cả bài đăng
            .then(res => {
                setPosts(res.data.data || []); // assuming API trả về { data: [...] }
                setLoading(false);
            })
            .catch(() => {
                setError("Không thể tải bài đăng");
                setLoading(false);
            });
    }, []);

    if (loading) return <p style={{color: "white", textAlign: "center"}}>Đang tải bài đăng...</p>;
    if (error) return <p style={{color: "red", textAlign: "center"}}>{error}</p>;

    return (
        <div className="feed">
            {posts.length === 0 ? (
                <p style={{color: "white", textAlign: "center"}}>Không có bài đăng nào</p>
            ) : (
                posts.map(post => (
                    <Post key={post.id} post={post} />
                ))
            )}
        </div>
    );
}
