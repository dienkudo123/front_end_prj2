import { useNavigate, useSearchParams } from "react-router-dom";
import PostForm from "../components/PostForm";
import "../styles/TrendingPage.css";

export default function TrendingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const currentTag = searchParams.get("tag"); // ví dụ: #Web3

    const trendingTags = [
        "#Crypto",
        "#Web3",
        "#Blockchain",
        "#NFT",
        "#DeFi",
        "#AI",
        "#Technology",
        "#ReactJS",
        "#NextJS",
        "#SvelteKit"
    ];

    return (
        <div className="trending-page">
            <h2>Chủ đề phổ biến</h2>
            <div className="trending-tags">
                {trendingTags.map((tag, index) => (
                    <button
                        key={index}
                        className={`trending-tag ${tag === currentTag ? "active" : ""}`}
                        onClick={() => navigate(`/trending?tag=${encodeURIComponent(tag)}`)}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            <PostForm initialTrendName={currentTag} />
        </div>
    );
}
