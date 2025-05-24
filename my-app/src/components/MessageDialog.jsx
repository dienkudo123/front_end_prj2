import React, { useState, useRef, useEffect } from "react";
import "../styles/MessageDialog.css";
import { io } from "socket.io-client";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { FaSmile } from "react-icons/fa";

const API_BASE_URL = "http://localhost:3000";
const socket = io("http://localhost:3000");

export default function MessageDialog({ chatBox, user, onClose }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const lastMessageRef = useRef(null);
  const partner = chatBox?.users.find((u) => u.id !== user.id);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    setMessages(chatBox?.messages || []);
  }, [chatBox, user.id]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    socket.emit("message", {
      chatBoxId: chatBox.id,
      userId: user.id,
      message,
    });
    setMessage("");
    setMessages([...messages, { senderId: user.id, content: message }]);
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

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji.native);
  };

  if (!chatBox) return null;
  console.log(messages);

  return (
    <div className="message-dialog">
      <div className="message-dialog-header">
        <div className="message-dialog-header-info">
          <img src={`${API_BASE_URL}${partner?.avatar}`} alt="Avatar" />
          <span>{partner?.username}</span>
        </div>
        <button onClick={onClose}>×</button>
      </div>
      <div className="message-dialog-body">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={
              msg.userId === user.id
                ? "message-item message-own"
                : "message-item"
            }
            ref={idx === messages.length - 1 ? lastMessageRef : null}
          >
            {msg.content}
          </div>
        ))}
      </div>
      <div className="message-dialog-footer">
        <div className="message-dialog-footer-input-wrapper">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Nhập tin nhắn..."
          />
          <button
            className="emoji-button"
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            tabIndex={-1}
          >
            <FaSmile />
          </button>
          {showEmojiPicker && (
            <div className="emoji-picker-wrapper" ref={emojiPickerRef}>
              <Picker data={data} onEmojiSelect={handleEmojiSelect} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
