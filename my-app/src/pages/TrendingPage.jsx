import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import PostForm from "../components/PostForm";
import "../styles/TrendingPage.css";

export default function TrendingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const currentTag = searchParams.get("tag"); // ví dụ: #Web3

    const [trends, setTrends] = useState([]);

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

    return (
        <div className="trending-page">
            <h2>Chủ đề phổ biến</h2>
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

            <PostForm initialTrendName={currentTag} />
        </div>
    );
}
