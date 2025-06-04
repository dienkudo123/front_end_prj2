import React, { useState } from "react";
import axios from "axios";
import "../styles/PostForm.css";

const TrendingForm = ({ onSuccess }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [note, setNote] = useState("");
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);

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

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("note", note);
            if (image) {
                formData.append("file", image);
            }

            const token = localStorage.getItem('accessToken');
            await axios.post("http://localhost:3000/trendTopic/create", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            alert("Tạo trending thành công!");
            // Reset form
            setTitle("");
            setDescription("");
            setNote("");
            setImage(null);
            setPreviewUrl(null);

            // Gọi callback đóng modal nếu có
            if (onSuccess) {
                onSuccess();
            }
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert("Mô tả quá dài. Cần ngắn gọn hơn!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="post-container">
            <h2>Tạo xu hướng</h2>
            <form onSubmit={handleSubmit} className="post-form">
                <textarea
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề trend"
                    required
                />
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả ngắn gọn"
                    required
                />
                <textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ghi chú nếu có"
                />
                <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                />
                <label htmlFor="image" className="custom-file-button">Chọn ảnh</label>

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
                    {loading ? "Đang tạo..." : "Tạo Trending"}
                </button>
            </form>
        </div>
    );
};

export default TrendingForm;
