// js/config.js
const config = {
    // Tự động detect môi trường
    API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8000'  // Local development
        : 'https://here4u-render.onrender.com/'  // Production (thay bằng URL Render của bạn)
};

// Export for use in other files
window.APP_CONFIG = config;