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
import { useState } from "react";
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
import "./styles/shop.css";
import "./styles/adminUser.css";

import PartnerSidebar from "./components/PartnerSidebar";
import NewNavbar from "./components/newNavbar";
import { FaBlogger } from "react-icons/fa";

function AppContent() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";
  const [currentTrend, setCurrentTrend] = useState(null);
  const { user } = useUser();

  let bgrUrl =
    "url(https://media.istockphoto.com/id/183273186/vi/anh/n%E1%BB%81n-tr%E1%BB%ABu-t%C6%B0%E1%BB%A3ng-m%C3%A0u-xanh-nh%E1%BA%A1t-v%C3%A0-xanh-l%C3%A1-c%C3%A2y.jpg?b=1&s=612x612&w=0&k=20&c=sJ2JfahovtKdjNE6Y4wwdpo3iT0yZo5Hs7uSDcZMaqk=)";

  if (user?.bgrUrl) {
    bgrUrl = `url(http://localhost:3000${encodeURI(user.bgrUrl)})`;
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
          {/* <Route path="/user/:id" element={<UserProfile />} /> */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/admin/users" element={<AdminUsers />} />
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
