/**
 * Authentication utility functions
 */

/**
 * Save user data to localStorage after login
 * @param {Object} userData - User data from API response
 */
export const saveUserData = (userData) => {
  if (!userData) return;
  
  // Save user role separately for easier access
  if (userData.role) {
    localStorage.setItem("role", userData.role);
  }
  
  // Save user object with name and email
  localStorage.setItem("user", JSON.stringify({
    name: userData.nama || userData.name,
    email: userData.email,
    role: userData.role,
    phone: userData.nomor_hp || ""
  }));
};

/**
 * Clear user data from localStorage on logout
 */
export const clearUserData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
};

/**
 * Get current user data from localStorage
 * @returns {Object|null} User data or null if not logged in
 */
export const getCurrentUser = () => {
  const userData = localStorage.getItem("user");
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error("Failed to parse user data from localStorage", error);
    return null;
  }
};

/**
 * Check if user is logged in
 * @returns {boolean} True if user is logged in
 */
export const isLoggedIn = () => {
  return !!localStorage.getItem("token");
};

/**
 * Check if user is admin
 * @returns {boolean} True if user is admin
 */
export const isAdmin = () => {
  return localStorage.getItem("role") === "admin";
}; 