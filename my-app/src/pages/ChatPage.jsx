import { useEffect, useRef, useState } from "react";
import "../styles/ChatPage.css";
import axiosInstance from "../utils/api";
import { getUserId } from "../utils/auth";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatBoxes, setChatBoxes] = useState([]);
  const [message, setMessage] = useState();
  const lastMessageRef = useRef(null);
  const userId = getUserId();

  useEffect(() => {
    const fetchChatBoxes = async () => {
      const response = await axiosInstance.get("http://localhost:3000/chatBox");
      const chatBoxesData = response.data.data.map((item) => {
        const partner = item.users.find((user) => user.id != userId);
        return {
          id: item.id,
          partner,
          messages: item.messages,
        };
      });
      setChatBoxes(chatBoxesData);
    };
    fetchChatBoxes();
  }, [userId]);

  useEffect(() => {
    if (!selectedChat) return;
    socket.emit("join", { chatBoxId: selectedChat.id });

    const handleMessage = ({ chatBoxId, userId, content }) => {
      if (chatBoxId === selectedChat.id) {
        setChatBoxes((prevChatBoxes) => {
          const updatedChatBoxes = prevChatBoxes.map((chatBox) => {
            if (chatBox.id === chatBoxId) {
              const newMessage = {
                userId,
                content,
              };
              const updatedMessages = [...chatBox.messages, newMessage];
              return { ...chatBox, messages: updatedMessages };
            } else {
              return chatBox;
            }
          });

          const updatedSelectedChat = updatedChatBoxes.find(
            (box) => box.id === chatBoxId
          );
          setSelectedChat(updatedSelectedChat);
          return updatedChatBoxes;
        });
      }
    };
    socket.on("message", handleMessage); 

    return () => {
      socket.off("message", handleMessage);
    };
  }, [selectedChat]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    socket.emit("message", {
      chatBoxId: selectedChat.id,
      userId,
      message,
    });
    setMessage("");
  };

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChat]);

  return (
    <div className="chat-container">
      <div className="chat-page">
        <ul className="chat-list">
          {chatBoxes.map((item) => (
            <li
              key={item.id}
              className={`chat-item ${item.read ? "read" : "unread"}`}
            >
              <img src={item.partner.avatar} alt="Avatar" className="avatar" />
              <div
                className="chat-content"
                onClick={() => {
                  setSelectedChat(item);
                }}
              >
                <strong className="partner-name">
                  {item.partner.displayName}
                </strong>
                <p className="message">
                  {item.messages[item.messages.length - 1].content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="chat-box">
        {selectedChat ? (
          <>
            <div className="chat-partner">
              <img
                src={selectedChat.partner.avatar}
                alt="Avatar"
                className="avatar"
              ></img>
              <h3>{selectedChat.partner.displayName}</h3>
            </div>
            <div className="chat-messages">
              {selectedChat.messages.map((message, index) => (
                <div
                  key={index}
                  className={`message-list ${
                    message.userId === userId ? "owner" : "partner"
                  }`}
                  ref={
                    index === selectedChat.messages.length - 1
                      ? lastMessageRef
                      : null
                  }
                >
                  <p
                    className={`message-list ${
                      message.userId === userId
                        ? "owner-message"
                        : "partner-message"
                    }`}
                  >
                    {" "}
                    {message.content}{" "}
                  </p>
                </div>
              ))}
            </div>
            <input
              className="chat-input"
              type="text"
              placeholder="Nhập tin nhắn..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </>
        ) : (
          <div className="chat-placeholder">
            Chọn một cuộc trò chuyện để bắt đầu
          </div>
        )}
      </div>
    </div>
  );
}
