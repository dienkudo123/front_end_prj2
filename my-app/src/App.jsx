import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Feed from "./components/Feed";
import Profile from "./pages/Profile";
import SearchPage from "./pages/SearchPage";
import PostDetail from "./pages/PostDetail";
import Trending from "./pages/TrendingPage";
import PostPage from "./pages/PostPage";
import NotificationsPage from "./pages/NotificationsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatPage from "./pages/ChatPage";
import { useEffect, useState } from "react";
import axiosInstance from "./utils/api";
import { UserProvider } from "./context/UserContext";

// Import CSS
import "./styles/App.css";
import "./styles/sidebar.css";
import "./styles/feed.css";
import "./styles/profile.css";
import "./styles/SearchPage.css";
import "./styles/PostDetail.css";
import "./styles/PostPage.css";
import "./styles/NotificationsPage.css";
import "./styles/Auth.css";
import PartnerSidebar from "./components/PartnerSidebar";

function AppContent() {
    const location = useLocation();
    const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
    const [avatarUrl, setAvatarUrl] = useState(null);
    // const [displayName, setDisplayName] = useState(null);

    useEffect(() => {
        const featchUserProfile = async () => {
            const response = await axiosInstance.get(`http://localhost:3000/user/me`);
            // console.log('User profile data:', response.data.data);
            const userData = response.data.data;
            // setDisplayName(userData.user.displayName || paramUsername);
            if (userData.user.avatar) {
            setAvatarUrl(`http://localhost:3000${userData.user.avatar}`);
            }
        }
        featchUserProfile();        
    }
    , []);
    return (
        <div className="app-container">
            {!isAuthPage && <Sidebar avatarUrl={avatarUrl}/>}
            <div className="main-content">
                <Routes>
                    {/* Routes có sidebar */}
                    <Route path="/" element={<Feed />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/profile/:username" element={<Profile />} />
                    <Route path="/post/:id" element={<PostDetail />} />
                    <Route path="/trending" element={<Trending />} />
                    <Route path="/post/new" element={<PostPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />

                    {/* Routes không có sidebar */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Routes>
            </div>
            {!isAuthPage && <PartnerSidebar />}
        </div>
    );
}

export default function App() {
    return (
        
        <Router>
            <UserProvider>
            <AppContent />
            </UserProvider>
        </Router>
        
    );
}
