import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import axiosInstance from "../utils/api";
import "../styles/PartnerSidebar.css"; // Import file CSS riêng
import { io } from "socket.io-client";
import MessageDialog from "./MessageDialog";

const socket = io("http://localhost:3000");

export default function PartnerSidebar() {
  const { user } = useUser();
  const [partners, setPartners] = useState([]);
  const [chatBox, setChatBox] = useState(null);

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
      <div className="partner-sidebar-tile">
        Những người bạn quan tâm
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
  );
}
