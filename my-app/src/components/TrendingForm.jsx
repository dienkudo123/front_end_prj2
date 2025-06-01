import React, { useState } from "react";
import axios from "axios";
import "../styles/PostForm.css";

const TrendForm = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [note, setNote] = useState("");
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null); // <== ảnh xem trước

    const token = localStorage.getItem("accessToken");

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);

        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('accessToken'); // hoặc từ cookie, tuỳ hệ thống

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("note", note);
            if (image) {
                formData.append("file", image);
            }

            await axios.post("http://localhost:3000/trendTopic/create", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            alert("Tạo trending thành công!");
            setTitle("");
            setDescription("");
            setNote("");
            setImage(null);
            setPreviewUrl(null);
        } catch (err) {
            console.error(err);
            alert("Tạo trending thất bại.");
        }
    };

    return (
        <div className="post-container">
            <h2>Tạo Trending Topic</h2>
            <form onSubmit={handleSubmit} className="post-form">
                <label htmlFor="title">Tiêu đề:</label>
                <textarea
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề trend"
                    required
                />

                <label htmlFor="description">Mô tả:</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả ngắn gọn"
                    required
                />

                <label htmlFor="note">Ghi chú:</label>
                <textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ghi chú nếu có"
                />

                <label htmlFor="image">Chọn ảnh:</label>
                <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                />

                {previewUrl && (
                    <div style={{ margin: "10px 0" }}>
                        <p>Ảnh xem trước:</p>
                        <img src={previewUrl} alt="Xem trước" style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }} />
                    </div>
                )}

                <button type="submit">Tạo Trending</button>
            </form>
        </div>
    );
};

export default TrendForm;
