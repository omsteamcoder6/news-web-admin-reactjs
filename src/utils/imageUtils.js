// utils/imageUtils.js

// VITE_API_URL may include /api (e.g. http://localhost:5000/api)
// Static files are served at /uploads/... so we must strip the /api suffix
const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE_URL = RAW_API_URL.replace(/\/api\/?$/, '');

/**
 * Get full image URL from relative path
 * @param {string} imagePath - Relative image path (e.g., /uploads/events/xxx.webp)
 * @returns {string} Full URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a data URL (base64)
  if (imagePath.startsWith('data:image')) {
    return imagePath;
  }

  // If it's a relative path starting with /uploads
  if (imagePath.startsWith('/uploads')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // Default: treat as relative path
  return `${API_BASE_URL}/uploads/${imagePath}`;
};

/**
 * Get base URL for images (without /api)
 */
export const getImageBaseUrl = () => API_BASE_URL;

/**
 * Check if image URL is valid
 */
export const isValidImageUrl = (url) => {
  if (!url) return false;
  return url.startsWith('http') || url.startsWith('/uploads') || url.startsWith('data:image');
};