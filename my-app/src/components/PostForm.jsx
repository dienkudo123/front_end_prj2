import React, { useState, useEffect, useRef } from "react";
import "../styles/PostForm.css";
import axios from "axios";

const PostForm = ({ onSuccess, initialTrendName = "" }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [images, setImages] = useState([]);
    const [trendID, setTrendID] = useState("");
    const [trends, setTrends] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        axios
            .get("http://localhost:3000/trendTopic")
            .then((res) => {
                if (res.data && res.data.data) {
                    setTrends(res.data.data);
                    if (initialTrendName) {
                        const matched = res.data.data.find(
                            (t) => `#${t.title}`.toLowerCase() === initialTrendName.toLowerCase()
                        );
                        if (matched) setTrendID(matched.id);
                    }
                }
            })
            .catch((err) => console.error("Lỗi khi lấy trends:", err));
    }, [initialTrendName]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);

        if (files.length > 0) {
            const url = URL.createObjectURL(files[0]);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userJSON = localStorage.getItem("user");
        if (!userJSON) {
            alert("Bạn chưa đăng nhập");
            return;
        }
        const user = JSON.parse(userJSON);
        const userId = user.id;
        if (!userId) {
            alert("Không lấy được thông tin người dùng");
            return;
        }

        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("Bạn chưa đăng nhập hoặc token hết hạn");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            formData.append("trendTopicId", trendID);
            formData.append("status", "Published");
            formData.append("userId", userId);
            if (images.length > 0) {
                formData.append("file", images[0]);
            }

            await axios.post("http://localhost:3000/post/create", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            // Gọi callback onSuccess sau khi thành công
            onSuccess?.();

            // Reset form
            setTitle("");
            setContent("");
            setImages([]);
            setTrendID("");
            setPreviewUrl(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = null;
            }
            window.location.href = "/";
        } catch (error) {
            console.error(error);
            alert("Đăng bài thất bại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="post-container">
            <h2>Đăng bài mới</h2>
            <form onSubmit={handleSubmit} className="post-form">
        <textarea
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề bài viết"
            required
        />
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Bạn đang nghĩ gì?"
                    required
                />
                <input
                    type="file"
                    id="images"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                    ref={fileInputRef}
                />
                <label htmlFor="images" className="custom-file-button">
                    Chọn ảnh
                </label>

                <select
                    id="trendID"
                    value={trendID}
                    onChange={(e) => setTrendID(e.target.value)}
                    required
                >
                    <option value="">Chọn trend</option>
                    {trends.map((trend) => (
                        <option key={trend.id} value={trend.id}>
                            {trend.title}
                        </option>
                    ))}
                </select>

                {previewUrl && (
                    <div style={{ margin: "10px 0" }}>
                        <p>Ảnh xem trước:</p>
                        <img
                            src={previewUrl}
                            alt="Xem trước"
                            style={{ maxHeight: "200px", borderRadius: "8px" }}
                        />
                    </div>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? "Đang đăng bài..." : "Đăng bài"}
                </button>
            </form>
        </div>
    );
};

export default PostForm;
