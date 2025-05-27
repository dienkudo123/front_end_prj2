import { useEffect, useState } from "react";
import axios from "axios";
import PostForm from "../components/PostForm";
import Post from "../components/Post"; // Bạn cần có component Post.jsx
import "../styles/TrendingPage.css";

export default function TrendingPage() {
    const [currentTag, setCurrentTag] = useState(null);
    const [trends, setTrends] = useState([]);
    const [showPostForm, setShowPostForm] = useState(false);
    const [showTrends, setShowTrends] = useState(true);
    const [postsByTrend, setPostsByTrend] = useState({});

    // Lấy danh sách trendTopic
    useEffect(() => {
        axios
            .get("http://localhost:3000/trendTopic")
            .then((res) => {
                if (res.data && res.data.data) {
                    setTrends(res.data.data);
                }
            })
            .catch((err) => console.error("Lỗi khi lấy trends:", err));
    }, []);

    // Lấy danh sách bài viết theo trendTopic khi currentTag thay đổi
    useEffect(() => {
        if (!currentTag || trends.length === 0) return;

        const trend = trends.find(t => t.title === currentTag);
        if (!trend) return;

        axios
            .get(`http://localhost:3000/post/trend-topic/${trend.id}`)
            .then((res) => {
                setPostsByTrend(res.data); // Dữ liệu dạng { statusCode, message, data: [...] }
            })
            .catch((err) => console.error("Lỗi khi lấy bài viết theo trend:", err));
    }, [currentTag, trends]);

    return (
        <div className="trending-page">
            <div className="button-group">
                <button
                    className={showPostForm ? "active" : ""}
                    onClick={() => {
                        setShowPostForm(true);
                        setShowTrends(false);
                        setCurrentTag(null); // Reset tag khi đăng bài
                    }}
                >
                    Đăng bài
                </button>
                <button
                    className={showTrends ? "active" : ""}
                    onClick={() => {
                        setShowTrends(true);
                        setShowPostForm(false);
                    }}
                >
                    Chủ đề phổ biến
                </button>
            </div>

            {showTrends && (
                <div className="trending-tags">
                    {trends.map((trend) => {
                        const tag = trend.title;
                        return (
                            <button
                                key={trend.id}
                                className={`trending-tag ${tag === currentTag ? "active" : ""}`}
                                onClick={() => {
                                    setCurrentTag(tag);
                                    setShowTrends(true);
                                    setShowPostForm(false);
                                }}
                            >
                                {tag}
                            </button>
                        );
                    })}
                </div>
            )}

            {showPostForm && <PostForm initialTrendName={currentTag} />}

            {currentTag && (
                <div className="posts-by-trend">
                    <h3 style={{ color: "white", textAlign: "center" }}>
                        Bài viết trong chủ đề "{currentTag}"
                    </h3>

                    {postsByTrend?.data?.length > 0 ? (
                        postsByTrend.data.map((post) => (
                            <Post key={post.id} post={post} />
                        ))
                    ) : (
                        <p style={{ color: "white", textAlign: "center" }}>
                            Không có bài đăng nào
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
