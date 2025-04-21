import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/PostPage.css"; // Import CSS riêng cho PostPage

export default function PostPage() {
    const [searchParams] = useSearchParams();
    const tag = searchParams.get("tag") || "";

    const [post, setPost] = useState("");
    const [image, setImage] = useState(null);

    // Xử lý chọn ảnh
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setImage(imageUrl);
        }
    };

    // Xử lý đăng bài
    const handleSubmit = () => {
        if (!post.trim() && !image) {
            alert("Vui lòng nhập nội dung hoặc tải lên một hình ảnh.");
            return;
        }
        alert(`Bài viết của bạn về "${tag}" đã được đăng! 🚀`);
        setPost("");
        setImage(null);
    };

    return (
        <div className="post-page">
            <h2> Đăng bài về {tag}</h2>
            <textarea
                value={post}
                onChange={(e) => setPost(e.target.value)}
                placeholder="Viết nội dung của bạn..."
                className="post-input"
            />
            {/* Nút chọn ảnh */}
            <input type="file" accept="image/*" onChange={handleImageChange} className="image-input" />
            {/* Hiển thị ảnh đã chọn */}
            {image && <img src={image} alt="Preview" className="post-preview" />}
            <button onClick={handleSubmit} className="post-button">
                Đăng bài
            </button>
        </div>
    );
}
