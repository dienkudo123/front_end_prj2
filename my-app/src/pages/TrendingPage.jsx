import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/TrendingPage.css";
import PostForm from "../components/PostForm";
import TrendingForm from "../components/TrendingForm";

const API_BASE_URL = "http://localhost:3000";

export default function TrendingPage() {
    const [currentTag, setCurrentTag] = useState(null);
    const [trends, setTrends] = useState([]);
    const [postsOfCurrentTag, setPostsOfCurrentTag] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [showPostForm, setShowPostForm] = useState(false);
    const [showTrendingForm, setShowTrendingForm] = useState(false);

    const navigate = useNavigate();  // <-- dùng để điều hướng

    useEffect(() => {
        fetchTrends();
    }, []);

    const fetchTrends = () => {
        axios
            .get(`${API_BASE_URL}/trendTopic`)
            .then((res) => {
                if (res.data && res.data.data) {
                    setTrends(res.data.data);
                }
            })
            .catch((err) => console.error("Lỗi khi lấy trends:", err));
    };

    useEffect(() => {
        if (!currentTag || trends.length === 0) return;

        const trend = trends.find((t) => t.title === currentTag);
        if (!trend) return;

        axios
            .get(`${API_BASE_URL}/post/trend-topic/${trend.id}`)
            .then((res) => {
                if (res.data?.data) {
                    setPostsOfCurrentTag(res.data.data);
                }
            })
            .catch((err) => console.error("Lỗi khi lấy bài viết theo trend:", err));
    }, [currentTag, trends]);

    const handleSearch = (e) => {
        const keyword = e.target.value;
        setSearchKeyword(keyword);

        if (!keyword) {
            fetchTrends();
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        axios
            .get(`${API_BASE_URL}/trendTopic/search/${keyword}`)
            .then((res) => {
                if (res.data?.data) {
                    setTrends(res.data.data);
                }
            })
            .catch((err) => {
                console.error("Lỗi khi tìm kiếm trend:", err);
                setTrends([]);
            });
    };

    return (
        <div className="trending-page">

            {/* Thanh tìm kiếm và nút Đăng bài */}
            <div className="search-container"
                 style={{display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px"}}>
                <input
                    type="text"
                    placeholder="Tìm kiếm trend..."
                    value={searchKeyword}
                    onChange={handleSearch}
                    className="search-input"
                    style={{flexGrow: 1}}
                />
                <button className="btn-post" onClick={() => setShowPostForm(true)}>
                    Đăng bài
                </button>
                <button className="btn-post" onClick={() => setShowTrendingForm(true)}>
                    Tạo xu hướng
                </button>
            </div>
            {showPostForm && (
                <div className="modal-overlay" onClick={() => setShowPostForm(false)}>
                <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()} // tránh đóng modal khi click bên trong form
                    >
                        <button
                            className="modal-close-btn"
                            onClick={() => setShowPostForm(false)}
                        >
                            &times;
                        </button>
                        <PostForm />
                    </div>
                </div>
            )}

            {showTrendingForm && (
                <div className="modal-overlay" onClick={() => setShowPostForm(false)}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()} // tránh đóng modal khi click bên trong form
                    >
                        <button
                            className="modal-close-btn"
                            onClick={() => setShowTrendingForm(false)}
                        >
                            &times;
                        </button>
                        <TrendingForm />
                    </div>
                </div>
            )}

            {!currentTag && (
                <div className="trend-grid">
                    {trends.length === 0 && (
                        <p>{isSearching ? "Không tìm thấy trend phù hợp." : "Không có trend nào."}</p>
                    )}
                    {trends.map((trend) => {
                        const imgUrl = trend.imageUrl?.startsWith("http")
                            ? trend.imageUrl
                            : `${API_BASE_URL}${trend.imageUrl}`;
                        return (
                            <div
                                key={trend.id}
                                className="trend-item"
                                onClick={() => setCurrentTag(trend.title)}
                                style={{ cursor: "pointer" }}
                            >
                                <img src={imgUrl} alt={trend.title} />
                                <p className="title">{trend.title}</p>
                                <p className="description">{trend.description}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {currentTag && (
                <div className="posts-section">
                    <button onClick={() => setCurrentTag(null)} className="back-button">
                        ← Back to Trends
                    </button>
                    <h3>Bài viết theo trend: {currentTag}</h3>
                    {postsOfCurrentTag.length === 0 && <p>Chưa có bài viết nào.</p>}
                    <ul className="posts-list">
                        {postsOfCurrentTag.map((post) => (
                            <li key={post.id} className="post-item">
                                <h4>{post.title}</h4>
                                <p>{post.content}</p>
                                {post.imageUrl && (
                                    <img
                                        src={
                                            post.imageUrl.startsWith("http")
                                                ? post.imageUrl
                                                : `${API_BASE_URL}${post.imageUrl}`
                                        }
                                        alt={post.title}
                                        className="post-image"
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
