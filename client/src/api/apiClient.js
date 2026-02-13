import axios from "axios";

// Axios instance for API calls
// In dev mode, Vite proxy handles /api -> localhost:5000
// In production, VITE_API_BASE_URL should point to Railway backend
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Image CDN base URL
export const IMG_CDN = "https://img.ophim.live/uploads/movies/";

/**
 * Construct full image URL from API thumbnail/poster path
 * @param {string} path - relative image path from API
 * @returns {string} full image URL
 */
export const getImageUrl = (path) => {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith("http")) return path;
    return `${IMG_CDN}${path}`;
};

export default apiClient;
