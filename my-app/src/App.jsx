import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Feed from "./components/Feed";
import Profile from "./pages/Profile";
import SearchPage from "./pages/SearchPage";
import PostDetail from "./pages/PostDetail";
import Trending from "./pages/TrendingPage";
import PostPage from "./pages/PostPage";
import NotificationsPage from "./pages/NotificationsPage";
import LoginPage from "./pages/LoginPage";
// import RegisterPage from "./pages/RegisterPage";
import UserProfile from "./pages/UserProfile";
import ChatPage from "./pages/ChatPage";
import { useEffect, useState } from "react";
import axiosInstance from "./utils/api";
import { UserProvider, useUser } from "./context/UserContext";
import Shop from "./pages/shop";
import AdminUsers from "./pages/adminUser"; 

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
import "./styles/shop.css"
import "./styles/adminUser.css"

import PartnerSidebar from "./components/PartnerSidebar";
import NewNavbar from "./components/newNavbar";

function AppContent() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";
  const [currentTrend, setCurrentTrend] = useState(null);
  const { user } = useUser();

  let bgrUrl =
    "url(https://media.istockphoto.com/id/2151855612/photo/blue-sky-yellow-pastel-light-abstract-background-texture-nature-summer-landscapte-sun-cloud.jpg?s=612x612&w=0&k=20&c=uJXwbfxX78fVdfyfdaSytIlFns2vgD35gj25Kso3s9E=)";

  if (user?.bgrUrl) {
    bgrUrl = `url(http://localhost:3000${user.bgrUrl})`;
  }
  const backGround = !isAuthPage
    ? {
        backgroundImage: bgrUrl,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : { backgroundColor: "white" };

  return (
    <div className="app-container" style={backGround}>
      {!isAuthPage && (
        <Sidebar
          currentTrend={currentTrend}
          setCurrentTrend={setCurrentTrend}
        />
      )}
      <div className="main-content">
        {!isAuthPage && <NewNavbar />}
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route
            path="/trending"
            element={<Trending setCurrentTrend={setCurrentTrend} />}
          />
          <Route path="/post/new" element={<PostPage />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/shop" element={<Shop />} />
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
