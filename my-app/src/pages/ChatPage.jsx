import { useEffect, useRef, useState } from "react";
import "../styles/ChatPage.css";
import axiosInstance from "../utils/api";
import { getUserId } from "../utils/auth";
import io from "socket.io-client";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { FaSmile } from "react-icons/fa";
import Navbar from "../components/Navbar";

const API_BASE_URL = "http://localhost:3000";
const socket = io("http://localhost:3000");

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatBoxes, setChatBoxes] = useState([]);
  const [message, setMessage] = useState("");
  const lastMessageRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [userKeyWord, setUserKeyWord] = useState("");
  const [users, setUsers] = useState([]);
  const emojiPickerRef = useRef(null);
  const userId = getUserId();

  useEffect(() => {
    const fetchChatBoxes = async () => {
      const response = await axiosInstance.get("http://localhost:3000/chatBox");
      const chatBoxesData = response.data.data.map((item) => {
        const partner = item.users.find((u) => u.userId != userId);
        return {
          id: item._id,
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

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji.native);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await axiosInstance.get(
        `http://localhost:3000/user/search?keyword=${userKeyWord}`
      );
      setUsers(response.data.data);
    };
    fetchUsers();
  }, [userKeyWord]);

  const handleChat = async (partnerId) => {
    const response = await axiosInstance.post(
      "http://localhost:3000/chatBox/create",
      { partnerId }
    );
    const newChatBox = response.data.data;

    const partner = newChatBox.users.find((u) => u.id !== userId);
    const formattedChatBox = {
      id: newChatBox.id,
      partner,
      messages: newChatBox.messages || [],
    };

    const existing = chatBoxes.find(
      (chatBox) => chatBox.id === formattedChatBox.id
    );
    if (!existing) {
      setChatBoxes([formattedChatBox, ...chatBoxes]);
    }

    setSelectedChat(formattedChatBox);
    setUserKeyWord('');
    socket.emit("join", { chatBoxId: formattedChatBox.id });
  };

  return (
    <div className="chat-container">
      <div className="chat-page">
        <ul className="chat-list">
          <Navbar onSearch={(value) => setUserKeyWord(value)} />
          <ul className="search-suggestions">
            {users.map((user) => (
              <li key={user.id} onClick={() => handleChat(user.id)}>
                <img
                  src={`${API_BASE_URL}${user.avatar}`}
                  alt={`${user.displayName} avatar`}
                />
                <span>{user.displayName}</span>
              </li>
            ))}
          </ul>
          {chatBoxes.map((item) => (
            <li
              key={item.id}
              className={`chat-item ${item.read ? "read" : "unread"}`}
            >
              <img
                src={`${API_BASE_URL}${item.partner.avatar}`}
                alt="Avatar"
                className="avatar"
              />
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
                  {item.messages.length > 0
                    ? item.messages[item.messages.length - 1].content
                    : "Bắt đầu cuộc trò chuyện"}
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
                src={`${API_BASE_URL}${selectedChat.partner.avatar}`}
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
            <div className="chat-input-wrapper">
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
              <button
                className="emoji-button"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
              >
                <FaSmile />
              </button>
              {showEmojiPicker && (
                <div className="emoji-picker-wrapper" ref={emojiPickerRef}>
                  <Picker data={data} onEmojiSelect={handleEmojiSelect} />
                </div>
              )}
            </div>
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
