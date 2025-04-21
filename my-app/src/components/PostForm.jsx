import React, { useState, useEffect } from "react";
import "../styles/PostForm.css";

const PostForm = ({ initialTrendName = "" }) => {
    const [content, setContent] = useState("");
    const [images, setImages] = useState([]);
    const [trendID, setTrendID] = useState("");
    const [trends, setTrends] = useState([]);

    useEffect(() => {
        fetch("/api/trends")
            .then((res) => res.json())
            .then((data) => {
                setTrends(data);
                // Nếu có initialTrendName, tìm trend tương ứng
                if (initialTrendName) {
                    const matched = data.find((t) => `#${t.name}`.toLowerCase() === initialTrendName.toLowerCase());
                    if (matched) setTrendID(matched.id);
                }
            });
    }, [initialTrendName]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("content", content);
        formData.append("trendID", trendID);
        for (let i = 0; i < images.length; i++) {
            formData.append("images", images[i]);
        }

        fetch("/api/posts", {
            method: "POST",
            body: formData,
        })
            .then((res) => {
                if (res.ok) {
                    alert("Đăng bài thành công!");
                    setContent("");
                    setImages([]);
                    setTrendID("");
                } else {
                    alert("Đăng bài thất bại.");
                }
            })
            .catch((err) => console.error("Lỗi:", err));
    };

    return (
        <div className="post-container">
            <h2>Đăng bài mới</h2>
            <form onSubmit={handleSubmit} className="post-form">
                <label htmlFor="content">Nội dung:</label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Bạn đang nghĩ gì?"
                    required
                />

                <label htmlFor="images">Hình ảnh:</label>
                <input
                    type="file"
                    id="images"
                    accept="image/*"
                    multiple
                    onChange={(e) => setImages(e.target.files)}
                />

                <label htmlFor="trendID">Trend:</label>
                <select
                    id="trendID"
                    value={trendID}
                    onChange={(e) => setTrendID(e.target.value)}
                    required
                >
                    <option value="">-- Chọn trend --</option>
                    {trends.map((trend) => (
                        <option key={trend.id} value={trend.id}>
                            {trend.name}
                        </option>
                    ))}
                </select>

                <button type="submit">Đăng bài</button>
            </form>
        </div>
    );
};

export default PostForm;
