import { Link } from "react-router-dom";
import { FaHome, FaSearch, FaBell, FaUser, FaFire, FaComment, FaComments } from "react-icons/fa"; // Import icon
import "../styles/sidebar.css"; // Import file CSS riêng
import { useUser } from "../context/UserContext";
import { FiSettings, FiLogOut } from "react-icons/fi";
import axiosInstance from "../utils/api";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = "http://localhost:3000";
import { useState, useRef, useEffect } from "react";
import logo from "../assets/Logo.jpg";

export default function Sidebar() {

    return (
        <div className="sidebar">
            <div className="sidebar-title">
                Tin hot nhất trong tháng
            </div>
        </div>
    );
}
