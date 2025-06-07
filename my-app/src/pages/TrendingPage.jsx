import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/TrendingPage.css";
import PostForm from "../components/PostForm";
import TrendingForm from "../components/TrendingForm";
import Post from "../components/Post";
import { useUser } from "../context/UserContext";
const API_BASE_URL = "http://localhost:3000";
export default function TrendingPage({ setCurrentTrend }) {
  const [currentTag, setCurrentTag] = useState(null);
  const [trends, setTrends] = useState([]);
  const [postsOfCurrentTag, setPostsOfCurrentTag] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showTrendingForm, setShowTrendingForm] = useState(false);
  const [description, setDescription] = useState("");
  const { user } = useUser();
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
    setCurrentTrend(trend);
    if (!trend) return;
    axios
      .get(`${API_BASE_URL}/post/trend-topic/${trend.id}`)
      .then((res) => {
        if (res.data?.data) {
          setPostsOfCurrentTag(res.data.data);
        }
      })
      .catch((err) => console.error("Lỗi khi lấy bài viết theo trend:", err));
  }, [currentTag, trends, setCurrentTrend]);
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
      {" "}
      {/* Thanh tìm kiếm và nút Đăng bài */}{" "}
      <div
        className="search-container"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {" "}
        {currentTag && (
          <button
            onClick={() => {
              setCurrentTag(null);
              setCurrentTrend(null);
            }}
            className="btn-post back"
          >
            {" "}
            ←{" "}
          </button>
        )}{" "}
        {currentTag === null && (
          <input
            type="text"
            placeholder="Tìm kiếm trend..."
            value={searchKeyword}
            onChange={handleSearch}
            className="search-input"
            style={{ flexGrow: 1 }}
          />
        )}{" "}
        <button
          style={{ gap: "10px" }}
          className="btn-post"
          onClick={() => setShowPostForm(true)}
        >
          {" "}
          Đăng bài{" "}
        </button>{" "}
        {currentTag === null && (
          <div>
            {" "}
            { user.role === "Admin" &&
            <button
              style={{}}
              className="btn-post"
              onClick={() => setShowTrendingForm(true)}
            >
              {" "}
              Tạo xu hướng{" "}
            </button>
            }
          </div>
        )}{" "}
      </div>{" "}
      {/* Modal PostForm */}{" "}
      {showPostForm && (
        <div className="modal-overlay" onClick={() => setShowPostForm(false)}>
          {" "}
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {" "}
            <button
              className="modal-close-btn"
              onClick={() => setShowPostForm(false)}
            >
              {" "}
              &times;{" "}
            </button>{" "}
            <PostForm onSuccess={() => setShowPostForm(false)} />{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* Modal TrendingForm */}{" "}
      {showTrendingForm && (
        <div
          className="modal-overlay"
          onClick={() => setShowTrendingForm(false)}
        >
          {" "}
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {" "}
            <button
              className="modal-close-btn"
              onClick={() => setShowTrendingForm(false)}
            >
              {" "}
              &times;{" "}
            </button>{" "}
            <TrendingForm onSuccess={() => setShowTrendingForm(false)} />{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* Hiển thị danh sách trend hoặc post theo tag */}{" "}
      {!currentTag && (
        <div className="trend-grid">
          {" "}
          {trends.length === 0 && (
            <p>{isSearching ? "Không tìm thấy trend phù hợp." : ""}</p>
          )}{" "}
          {trends.map((trend) => {
            const imgUrl = trend.imageUrl?.startsWith("http")
              ? trend.imageUrl
              : `${API_BASE_URL}${trend.imageUrl}`;
            return (
              <div
                key={trend.id}
                className="trend-item"
                onClick={() => {
                  setCurrentTag(trend.title);
                  setDescription(trend.description);
                }}
                style={{ cursor: "pointer" }}
              >
                {" "}
                <img src={imgUrl} alt={trend.title} />{" "}
                <p className="title">{trend.title}</p>{" "}
                {/* <p className="description">{trend.description}</p>{" "} */}
              </div>
            );
          })}{" "}
        </div>
      )}{" "}
      {currentTag && (
        <div className="posts-section">
          {" "}
          <div className="tag-description-box">
            <p className="tag-title">{currentTag}</p>
            <p className="tag-description">{description}</p>
          </div>
          {/*<button onClick={() => setCurrentTag(null)} className="back-button">*/}{" "}
          {/*    ←*/} {/*</button>*/}{" "}
          {postsOfCurrentTag.length === 0 && <p style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Chưa có bài viết nào.</p>}{" "}
          <ul className="posts-list">
            {" "}
            {postsOfCurrentTag.map((post) => (
              <Post key={post.id} post={post} />
            ))}{" "}
          </ul>{" "}
        </div>
      )}{" "}
    </div>
  );
}
