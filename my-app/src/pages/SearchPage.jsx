import Navbar from "../components/Navbar"; // Import Navbar
import NewNavbar from "../components/newNavbar";
import "../styles/SearchPage.css"; // Import CSS riêng cho SearchPage

export default function SearchPage() {
    return (
        <div className="search-page">
            {/* <Navbar /> Navbar ở trên cùng */}
            <NewNavbar /> {/* Navbar mới */}

        </div>
    );
}
