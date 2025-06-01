import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useLocation } from "react-router-dom";
import axiosInstance from "../utils/api";
import "../styles/PartnerSidebar.css"; // Import file CSS riêng
import { io } from "socket.io-client";
import MessageDialog from "./MessageDialog";
import {useNavigate} from "react-router-dom";
import rankingAnimation from "../assets/beaee5e90d93bfafa5f5f55acb23abfd28ad180c.png";

const socket = io("http://localhost:3000");

export default function PartnerSidebar() {
  const { user } = useUser();
  const location = useLocation();
  const [partners, setPartners] = useState([]);
  const [chatBox, setChatBox] = useState(null);
  const [rankings, setRankings] = useState([]);
  const navigate = useNavigate();
  

  const isTrendingPage = location.pathname === '/trending';

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await axiosInstance.get(`/user/friend`);
        const users = response.data.data;
        const partnerList = users.filter((partner) => {
          return partner.id !== user.id;
        });
        setPartners(partnerList);
        console.log("Partner list:", partnerList);
      } catch (error) {
        console.error("Error fetching partners:", error);
      }
    };

    fetchPartners();
  }, [user.id]);

  useEffect(() => {
    if (isTrendingPage) {
      const fetchRankings = async () => {
        try {
          const response = await axiosInstance.get(`user/ranking`);
          setRankings(response.data.data);
          console.log("Rankings:", response.data.data);
        } catch (error) {
          console.error("Error fetching rankings:", error);
        }
      };

      fetchRankings();
    }
  }, [isTrendingPage]);

  const chooseChat = (partnerId) => {
    const fetchChat = async () => { 
      try {
        const response = await axiosInstance.post(`/chatBox/create`, { partnerId });
        setChatBox(response.data.data);
        console.log("Selected chat:", chatBox);
      } catch (error) {
        console.error("Error fetching chat:", error);
      }
    }
    fetchChat();
  }
  const goToUserProfile = (userId) => {
      const me = localStorage.getItem("user");
      console.log("Current user:", me);
      const currentUser = JSON.parse(me);
      const myId = currentUser.id;
      if (userId === myId) {
        navigate(`/profile/me`);
      }
      else {
        navigate(`/user/${userId}`);
      }
    };

  useEffect(() => {
    if (!chatBox) return;   
    socket.emit("join", { chatBoxId: chatBox.id });
    const handleMessage = ({ userId, content }) => {
      const updatedMessages = [...chatBox.messages, { userId, content }];
      setChatBox((prevChatBox) => ({
        ...prevChatBox,
        messages: updatedMessages,
      }));
    };
    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
}, [chatBox])


  return (
    <div className="partner-sidebar">
      <MessageDialog chatBox={chatBox} user={user} onClose={() => setChatBox(null)}/>
      
      {/* First section - Always show friends */}
      <div className="partner-section">
        <div className="partner-sidebar-tile">
          Bạn Bè
        </div>
        <div className="partner-list">
          {partners.map((partner) => (
            <div key={partner.id} className="partner-item" onClick={() => chooseChat(partner.id)}>
              <img
                src={
                  partner.avatar
                    ? `http://localhost:3000${partner.avatar}`
                    : "https://via.placeholder.com/150"
                }
                alt="Avatar"
                className="partner-avatar-icon"
              />
              <span className="partner-name">{partner.displayName}</span>
            </div>
          ))}
        </div>
      </div>

      {isTrendingPage && <div className="partner-divider"></div>}

      <div className="partner-section">
        {isTrendingPage ? (
          <>
            <div className="partner-sidebar-tile">
              Bảng Xếp Hạng
            </div>
            <div className="ranking-list">
              {rankings.map((rank, index) => (
                <div 
                  key={rank.id || index} 
                  className="ranking-item" 
                  onClick={() => goToUserProfile(rank.id)}
                  style={index === 0 ? {
                    backgroundImage: `url(${rankingAnimation})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  } : {}}
                >
                  <div className="ranking-position">#{index + 1}</div>
                  <div className={`ranking-avatar-container ${index === 0 ? 'rank-1-avatar' : ''}`}>
                    <img
                      src={
                        rank.avatar
                          ? `http://localhost:3000${rank.avatar}`
                          : "https://via.placeholder.com/150"
                      }
                      alt="Avatar"
                      className="ranking-avatar-icon"
                    />
                    {index === 0 && (
                      <>
                        <div className="golden-frame"></div>
                        <div className="crown-icon">👑</div>
                      </>
                    )}
                  </div>
                  <div className="ranking-info">
                    <span className="ranking-name">{rank.displayName || rank.name}</span>
                    <span className="ranking-score">{rank.point} điểm</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
