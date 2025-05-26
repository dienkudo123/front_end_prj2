import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import PostForm from "../components/PostForm";
import "../styles/TrendingPage.css";

export default function TrendingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const currentTag = searchParams.get("tag");

    const [trends, setTrends] = useState([]);
    const [showPostForm, setShowPostForm] = useState(false);
    const [showTrends, setShowTrends] = useState(true);
    const [postsByTrend, setPostsByTrend] = useState([]);

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

    // Lấy danh sách bài viết theo trendTopic
    useEffect(() => {
        if (!currentTag || trends.length === 0) return;

        const trend = trends.find(t => `#${t.title}` === currentTag);
        if (!trend) return;

        axios
            .get(`http://localhost:3000/post/trend-topic/${trend.id}`)
            .then((res) => {
                setPostsByTrend(res.data);
            })
            .catch((err) => console.error("Lỗi khi lấy bài viết theo trend:", err));
    }, [currentTag, trends]);

    return (
        <div className="trending-page">
            <h2>Khám phá</h2>

            <div className="button-group">
                <button onClick={() => {
                    setShowPostForm(true);
                    setShowTrends(false);
                }}>
                    Đăng bài
                </button>
                <button onClick={() => {
                    setShowTrends(true);
                    setShowPostForm(false);
                }}>
                    Chủ đề phổ biến
                </button>
            </div>

            {showTrends && (
                <div className="trending-tags">
                    {trends.map((trend) => {
                        const tag = `#${trend.title}`;
                        return (
                            <button
                                key={trend.id}
                                className={`trending-tag ${tag === currentTag ? "active" : ""}`}
                                onClick={() => navigate(`/trending?tag=${encodeURIComponent(tag)}`)}
                            >
                                {tag}
                            </button>
                        );
                    })}
                </div>
            )}

            {showPostForm && (
                <PostForm initialTrendName={currentTag} />
            )}

            {currentTag && postsByTrend.length > 0 && (
                <div className="posts-by-trend">
                    <h3>Bài viết trong chủ đề {currentTag}</h3>
                    <ul>
                        {postsByTrend.map((post) => (
                            <li key={post.id} className="post-item">
                                <h4>{post.title}</h4>
                                <p>{post.content}</p>
                                <small>Người đăng: {post.user?.displayName}</small>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {currentTag && postsByTrend.length === 0 && (
                <p>Không có bài viết nào thuộc chủ đề này.</p>
            )}
        </div>
    );
}
