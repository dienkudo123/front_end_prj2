import { useEffect, useState, useRef, useCallback } from "react";
import axiosInstance from "../utils/api";
import Post from "./Post";
import "../styles/feed.css";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const observer = useRef();

  const lastPostRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosInstance.get(
          `http://localhost:3000/post/for-user?page=${page}&limit=5`
        );
        console.log(res.data.data);
        const newPosts = res.data.data || [];
        setPosts((prev) => [...prev, ...newPosts]);
        setHasMore(newPosts.length > 0);
      } catch (err) {
        setError("Không thể tải bài đăng");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [page]);

  if (error)
    return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div className="feed">
      {posts.map((post, index) => {
        if (index === posts.length - 1) {
          return (
            <div key={post.id} ref={lastPostRef}>
              <Post post={post} />
            </div>
          );
        }
        return <Post key={post.id} post={post} />;
      })}
      {loading && (
        <p style={{ color: "white", textAlign: "center" }}>Đang tải thêm...</p>
      )}
    </div>
  );
}
