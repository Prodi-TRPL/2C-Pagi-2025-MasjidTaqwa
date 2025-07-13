import { useState, useEffect } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserEdit, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import axios from "axios"; // Added axios import
import { clearUserData, getCurrentUser, isLoggedIn } from "../../utils/auth";

// Create a custom event for profile updates
export const PROFILE_UPDATED_EVENT = "profileUpdated";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState({ name: "", email: "" });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  // Function to fetch current user data from API
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      // Try to get user role to determine which endpoint to use
      const userRole = localStorage.getItem("role");
      
      if (userRole === "admin") {
        const response = await axios.get("/api/admin-profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update local state
        setUser({
          name: response.data.nama || "",
          email: response.data.email || ""
        });
        
        // Update localStorage
        localStorage.setItem("user", JSON.stringify({
          name: response.data.nama,
          email: response.data.email,
          role: response.data.role,
          phone: response.data.nomor_hp || ""
        }));
      } else {
        // For non-admin users
        const userData = localStorage.getItem("user");
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser({
              name: parsedUser.name || "",
              email: parsedUser.email || "",
            });
          } catch (error) {
            console.error("Failed to parse user data from localStorage", error);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Initial load of user data
  useEffect(() => {
    fetchUserData();
    
    // Add event listener for profile updates
    const handleProfileUpdate = () => {
      console.log("Profile update detected, refreshing user data");
      fetchUserData();
    };
    
    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdate);
    
    // Cleanup
    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    if (!isOpen && isLoggingOut) {
      handleLogout();
      setIsLoggingOut(false);
    }
  }, [isOpen, isLoggingOut]);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  async function handleLogout() {
    try {
      // Get token before removing it
      const token = localStorage.getItem('token');
      
      // Get user data to determine if they're an admin
      const user = getCurrentUser();
      
      // Send logout request to server if token exists
      if (token) {
        console.log('Sending logout request with token:', token);
        try {
          // First, if user is admin, log the logout activity using our dedicated endpoint
          if (user && user.role === 'admin') {
            console.log('Logging admin logout activity');
            await axios.post('/api/log-admin-logout', {
              name: user.name || 'Unknown',
              email: user.email || 'unknown@example.com'
            });
          }
          
          // Then send the normal logout request
          const response = await axios.post('/api/logout', {}, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          console.log('Logout response:', response.data);
        } catch (error) {
          console.error('Error during logout process:', error);
          // Continue with logout even if the request fails
        }
      } else {
        console.warn('No token found for logout request');
      }
      
      // Clear user data
      clearUserData();
      
      const result = await Swal.fire({
          icon: 'success',
          title: 'Logout berhasil!',
          text: 'Anda telah keluar dari platform.',
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
          position: 'center',
          allowOutsideClick: true,
          customClass: {
            container: 'z-[100000]', // increased z-index
            popup: 'z-[100000]',
            backdrop: 'bg-black bg-opacity-50 z-[99999] fixed top-0 left-0 w-full h-full'
          }
        });
      
      // Navigate to home page after logout
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear user data and redirect even if the logout request fails
      clearUserData();
      navigate('/', { replace: true });
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <img src="../img/user/admin.jpeg" alt="User" />
        </span>
        <span className="hidden sm:block mr-1 font-medium text-theme-sm">
          {user.name || "User"}
        </span>
        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {user.name || "User"}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {user.email || "user@gmail.com"}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/dashboardhome/profil-admin"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <FontAwesomeIcon icon={faUserEdit} className="w-5 h-5 fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300" />
              Profil Admin
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={() => {
                setIsLoggingOut(true);
                closeDropdown();
              }}
              tag="button"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="w-5 h-5 fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300" />
              Keluar
            </DropdownItem>
          </li>
        </ul>
      </Dropdown>
    </div>
  );
}
