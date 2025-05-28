import React, { useState } from "react";
import axios from "axios";
import "../styles/PostForm.css"; // tái sử dụng style của PostForm

const TrendForm = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [note, setNote] = useState("");

    const token = localStorage.getItem("accessToken");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            alert("Bạn cần đăng nhập để tạo trending.");
            return;
        }

        try {
            const res = await axios.post(
                "http://localhost:3000/trendTopic/create",
                { title, description, note },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert("Tạo trending thành công!");
            setTitle("");
            setDescription("");
            setNote("");
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
                <input
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

                <button type="submit">Tạo Trending</button>
            </form>
        </div>
    );
};

export default TrendForm;
