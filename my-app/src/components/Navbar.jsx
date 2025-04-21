import "../styles/navbar.css"; // Import CSS riêng cho Navbar

export default function Navbar() {
    return (
        <div className="navbar">
            <input type="text" placeholder="Tìm kiếm..." className="navbar-search" />
        </div>
    );
}
