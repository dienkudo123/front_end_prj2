import React, { useState, useEffect } from "react";
import "../styles/PostForm.css";
import axios from "axios";

const PostForm = ({ initialTrendName = "" }) => {
    const [title, setTitle] = useState(""); // thêm title
    const [content, setContent] = useState("");
    const [images, setImages] = useState([]);
    const [trendID, setTrendID] = useState("");
    const [trends, setTrends] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleImageChange = (e) => {
        const files = e.target.files;
        setImages(files);

        if (files && files.length > 0) {
            const url = URL.createObjectURL(files[0]);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };


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

    const handleSubmit = (e) => {
        e.preventDefault();

        // Lấy userId từ localStorage
        const userJSON = localStorage.getItem("user");
        const user = JSON.parse(userJSON);
        const userId = user.id;
        console.log(userId);

        const formData = new FormData();
        formData.append("title", title); // thêm title
        formData.append("content", content);
        formData.append("trendTopicId", trendID);
        formData.append("status", "Published");
        formData.append("userId", userId); // gửi userId lên backend
        if (images.length > 0) {
            formData.append("file", images[0]);
        }


        const token = localStorage.getItem("accessToken");
        console.log(token);

        axios
            .post("http://localhost:3000/post/create", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            })
            .then(() => {
                alert("Đăng bài thành công!");
                setTitle("");
                setContent("");
                setImages([]);
                setTrendID("");
            })
            .catch(() => alert("Đăng bài thất bại."));
    };

    return (
        <div className="post-container">
            <h2>Đăng bài mới</h2>
            <form onSubmit={handleSubmit} className="post-form">
                {/*<label htmlFor="title">Tiêu đề:</label>*/}
                <textarea
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Tiêu đề bài viết"
                    required
                />

                {/*<label htmlFor="content">Nội dung:</label>*/}
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Bạn đang nghĩ gì?"
                    required
                />

                {/*<label htmlFor="images">Hình ảnh:</label>*/}
                <input
                    type="file"
                    id="images"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    style={{display: "none"}}
                />
                <label htmlFor="images" className="custom-file-button">Chọn ảnh</label>

                {/*<label htmlFor="trendID">Trend:</label>*/}
                <select
                    id="trendID"
                    value={trendID}
                    onChange={(e) => setTrendID(e.target.value)}
                    required
                >
                    <option value=""> Chọn trend </option>
                    {trends.map((trend) => (
                        <option key={trend.id} value={trend.id}>
                            {trend.title}
                        </option>
                    ))}
                </select>

                {previewUrl && (
                    <div style={{ margin: "10px 0" }}>
                        <p>Ảnh xem trước:</p>
                        <img src={previewUrl} alt="Xem trước" style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }} />
                    </div>
                )}


                <button type="submit">Đăng bài</button>
            </form>
        </div>
    );
};

export default PostForm;
