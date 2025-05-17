import "../styles/navbar.css"; // Import CSS riêng cho Navbar

export default function Navbar({ onSearch }) {
  return (
    <div className="navbar">
      <input
        type="text"
        placeholder="Tìm kiếm..."
        className="navbar-search"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}
