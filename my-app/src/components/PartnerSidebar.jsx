import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import axiosInstance from "../utils/api";
import "../styles/PartnerSidebar.css"; // Import file CSS riêng
import { io } from "socket.io-client";
import MessageDialog from "./MessageDialog";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:3000");

export default function PartnerSidebar() {
  const { user } = useUser();
  const [partners, setPartners] = useState([]);
  const [chatBox, setChatBox] = useState(null);
  const [keyword, setKeyWord] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        let partnerList;
        if (keyword) {
          const response = await axiosInstance.get(
            `/user/search?keyword=${keyword}`
          );
          partnerList = response.data.data;
        } else {
          const response = await axiosInstance.get(`/user`);
          const users = response.data.data;
          partnerList = users.filter((partner) => {
            return partner.id !== user.id;
          });
        }

        setPartners(partnerList);
        console.log("Partner list:", partnerList);
      } catch (error) {
        console.error("Error fetching partners:", error);
      }
    };

    fetchPartners();
  }, [user.id, keyword]);

  const chooseChat = (partnerId) => {
    const fetchChat = async () => {
      try {
        const response = await axiosInstance.post(`/chatBox/create`, {
          partnerId,
        });
        setChatBox(response.data.data);
        console.log("Selected chat:", chatBox);
      } catch (error) {
        console.error("Error fetching chat:", error);
      }
    };
    fetchChat();
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
  }, [chatBox]);

  const goToUserProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="partner-sidebar">
      <MessageDialog
        chatBox={chatBox}
        user={user}
        onClose={() => setChatBox(null)}
      />
      <div className="partner-section">
        <div className="partner-sidebar-title">Bạn bè & Gợi ý kết nối</div>

        <input
          type="text"
          placeholder="Tìm kiếm bạn bè hoặc gợi ý..."
          className="partner-search-input"
          value={keyword}
          onChange={(e) => setKeyWord(e.target.value)}
        />

        <div className="partner-list">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="partner-item"
              onClick={() => chooseChat(partner.id)}
            >
              <img
                src={
                  partner.avatar
                    ? `http://localhost:3000${partner.avatar}`
                    : "https://via.placeholder.com/150"
                }
                alt="Avatar"
                className="partner-avatar-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  goToUserProfile(partner.id);
                }}
              />
              <span className="partner-name">{partner.displayName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
