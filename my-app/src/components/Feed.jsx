import Post from "./Post";
import dummyPosts from "../data/posts"; // Import danh sách post
import "../styles/feed.css";

export default function Feed() {
    return (
        <div className="feed">
            {dummyPosts.map(post => (
                <Post key={post.id} post={post} />
            ))}
        </div>
    );
}
