import { jwtDecode } from "jwt-decode";

export function getUserId() {
    const token = localStorage.getItem("accessToken");
    if (token) {
    const decoded = jwtDecode(token);
    const userId = decoded.sub;
        return userId;
    }
    return null;
}
