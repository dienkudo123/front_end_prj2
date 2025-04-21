import { useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/Profile.css"; // Import CSS riêng cho Profile

export default function Profile() {
    const { username } = useParams();
    const [posts, setPosts] = useState([
        { id: 1, image: "https://th.bing.com/th/id/OIP.o2PwdCIlnk04dNQreJ3V2gHaMd?rs=1&pid=ImgDetMain" },
        { id: 2, image: "https://th.bing.com/th/id/OIP.3A4HIGRlPCVjh9H_qTUdzAHaLH?rs=1&pid=ImgDetMain" },
        { id: 3, image: "https://toigingiuvedep.vn/wp-content/uploads/2022/04/hinh-anh-hai-huoc-ba-dao-nhat-the-gioi.jpg" },
        { id: 4, image: "https://th.bing.com/th/id/OIP.3A4HIGRlPCVjh9H_qTUdzAHaLH?rs=1&pid=ImgDetMain" },
        { id: 5, image: "https://th.bing.com/th/id/OIP.o2PwdCIlnk04dNQreJ3V2gHaMd?rs=1&pid=ImgDetMain" },
        { id: 6, image: "https://toigingiuvedep.vn/wp-content/uploads/2022/04/hinh-anh-hai-huoc-ba-dao-nhat-the-gioi.jpg" },
    ]);

    return (
        <div className="profile-page">
            <div className="profile-header">
                <img
                    src={`https://i.pravatar.cc/150?u=${username}`}
                    alt="Avatar"
                    className="profile-avatar"
                />
                <h2>{username || "User"}</h2>
                <button className="edit-profile-button">Edit Profile</button>
            </div>

            <div className="profile-posts">
                {posts.map(post => (
                    <div key={post.id} className="profile-post">
                        <img src={post.image} alt="Post" className="profile-post-image" />
                    </div>
                ))}
            </div>
        </div>
    );
}
