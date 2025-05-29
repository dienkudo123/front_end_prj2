import { useEffect, useState } from "react";
import axios from "axios";
import PostForm from "../components/PostForm";
import TrendingForm from "../components/TrendingForm";
import Post from "../components/Post";
import "../styles/TrendingPage.css";
import { useUser } from "../context/UserContext.jsx";

const API_BASE_URL = "http://localhost:3000";

export default function TrendingPage() {
    const { user } = useUser();
    const [currentTag, setCurrentTag] = useState(null);
    const [trends, setTrends] = useState([]);
    const [showPostForm, setShowPostForm] = useState(false);
    const [showTrends, setShowTrends] = useState(true);
    const [previewPostsByTrend, setPreviewPostsByTrend] = useState({});
    const [postsOfCurrentTag, setPostsOfCurrentTag] = useState([]);

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

    // Lấy bài viết theo trend hiện tại khi click vào ảnh
    useEffect(() => {
        if (!currentTag || trends.length === 0) return;

        const trend = trends.find((t) => t.title === currentTag);
        if (!trend) return;

        axios
            .get('http://localhost:3000/post/trend-topic/${trend.id}')
    .then((res) => {
            if (res.data?.data) {
                setPostsOfCurrentTag(res.data.data);
                setShowTrends(false);
                setShowPostForm(false);
            }
        })
            .catch((err) => console.error("Lỗi khi lấy bài viết theo trend:", err));
    }, [currentTag, trends]);

    // Lấy post đầu tiên của từng trend để hiển thị thumbnail
    useEffect(() => {
        if (trends.length === 0) return;

        const fetchPreviewPosts = async () => {
            const postMap = {};

            await Promise.all(
                trends.map(async (trend) => {
                    try {
                        const res = await axios.get('http://localhost:3000/post/trend-topic/${trend.id}');
                        if (res.data?.data?.length > 0) {
                            postMap[trend.id] = {
                                trend,
                                post: res.data.data[0],
                            };
                        }
                    } catch (error) {
                        console.error('Lỗi khi lấy post cho trend ${trend.title}:', error);
                    }
                })
            );

            setPreviewPostsByTrend(postMap);
        };

        fetchPreviewPosts();
    }, [trends]);

    const fullUrl = (url) => {
        if (!url) return "";
        return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    };
    return (
        <div className="trending-page">
            <div className="button-group">
                <button
                    className={showPostForm ? "active" : ""}
                    onClick={() => {
                        setShowPostForm(true);
                        setShowTrends(false);
                        setCurrentTag(null);
                    }}
                >
                    Đăng bài
                </button>
                <button
                    className={showTrends ? "active" : ""}
                    onClick={() => {
                        setShowTrends(true);
                        setShowPostForm(false);
                        setCurrentTag(null);
                    }}
                >
                    Chủ đề phổ biến
                </button>
            </div>

            {showTrends && (
                <div className="trend-grid">
                    {Object.values(previewPostsByTrend).map(({ trend, post }) => (
                        <div key={trend.id} className="trend-item">
                            <div className="trend-title">{trend.title}</div>
                            {post?.imageUrl ? (
                                <img
                                    src={fullUrl(post.imageUrl)}
                                    alt={trend.title}
                                    className="trend-image"
                                    onClick={() => setCurrentTag(trend.title)}
                                    style={{ cursor: "pointer" }}
                                />
                            ) : (
                                <div className="no-image">Không có ảnh</div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {currentTag && postsOfCurrentTag.length > 0 && (
                <div className="posts-by-trend">
                    <h3 style={{ color: "white", textAlign: "center" }}>
                        Bài viết trong chủ đề "{currentTag}"
                    </h3>
                    {postsOfCurrentTag.map((post) => (
                        <Post key={post.id} post={post} />
                    ))}
                </div>
            )}

            {showPostForm && (
                <div>
                    <PostForm initialTrendName={currentTag} />
                    {user.role !== "" && <TrendingForm />}
                </div>
            )}
        </div>
    );
}