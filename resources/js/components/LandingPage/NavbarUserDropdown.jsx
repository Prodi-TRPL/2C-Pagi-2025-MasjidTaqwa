import { useState, useEffect } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTachometerAlt, faUser, faHistory, faRightFromBracket, faBell } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { getUserPermissions, hasPermission, getPermissionDeniedMessage } from "../../utils/permissions";
import AccessDeniedModal from "../ui/AccessDeniedModal";
import axios from "axios"; // Added axios import

export default function NavbarUserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState("donatur");
  const [user, setUser] = useState({ name: "User", email: "user@example.com" });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userPermissions, setUserPermissions] = useState(null);
  const [accessDeniedModal, setAccessDeniedModal] = useState({
    show: false,
    title: "",
    message: "",
    permissionKey: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndPermissions = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/donatur/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Gagal mengambil profil");

        const data = await res.json();

        setUser({
          name: data.nama || "User",
          email: data.email || "user@example.com",
        });

        setRole("donatur");
        
        // Set user permissions
        setUserPermissions({
          canDonate: data.can_donate === true || data.can_donate === 1,
          canViewHistory: data.can_view_history === true || data.can_view_history === 1,
          canViewNotification: data.can_view_notification === true || data.can_view_notification === 1
        });
      } catch (err) {
        console.error("Gagal ambil user:", err);
      }
    };

    fetchUserAndPermissions();
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

  // Function to handle permission-based navigation
  function handleNavigate(path, permissionKey) {
    closeDropdown();
    
    // If not logged in or permissions not loaded, redirect to login
    if (!userPermissions) {
      navigate('/login');
      return;
    }
    
    // Check if user has the required permission
    if (hasPermission(userPermissions, permissionKey)) {
      navigate(path);
    } else {
      // Get denial message based on the permission
      const { title, message } = getPermissionDeniedMessage(permissionKey);
      
      // Show access denied modal
      setAccessDeniedModal({
        show: true,
        title,
        message,
        permissionKey
      });
    }
  }

  // Function to close the access denial modal
  function closeAccessDeniedModal() {
    setAccessDeniedModal({
      ...accessDeniedModal,
      show: false
    });
  }

  async function handleLogout() {
    try {
      // Get token before removing it
      const token = localStorage.getItem("token");
      
      // Get user role to determine if they're an admin
      const userRole = localStorage.getItem("role");
      const isAdmin = userRole === "admin";
      
      // Send logout request to server if token exists
      if (token) {
        console.log('Sending logout request with token:', token);
        try {
          // First, if user is admin, log the logout activity using our dedicated endpoint
          if (isAdmin) {
            console.log('Logging admin logout activity');
            await axios.post('/api/log-admin-logout', {
              // Use the user state variable that's already defined in the component
              name: user.name,
              email: user.email
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
      
      // Remove token after sending logout request
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      const result = await Swal.fire({
        icon: "success",
        title: "Logout berhasil!",
        text: "Anda telah keluar dari platform.",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        position: "center",
        allowOutsideClick: true,
        customClass: {
          container: "z-[100000]",
          popup: "z-[100000]",
          backdrop: "bg-black bg-opacity-50 z-[99999] fixed top-0 left-0 w-full h-full",
        },
      });

      // Navigate to home page after logout
      navigate("/", { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      // Still remove token and redirect even if the request fails
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/", { replace: true });
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
        aria-label="User menu"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <img src="/img/user/admin.jpeg" alt="User avatar" />
        </span>
        <span className="hidden sm:block mr-1 font-medium text-theme-sm">
          {user.name}
        </span>
        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
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
        className="absolute right-0 mt-[17px] flex w-[220px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div className="mb-2 px-3">
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {user.name}
          </span>
          <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
            {user.email}
          </span>
        </div>

        <ul className="flex flex-col gap-1">
          {role === "donatur" && (
            <>
              <li>
                <DropdownItem 
                  onItemClick={closeDropdown} 
                  tag="a" 
                  to="/profile" 
                  className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  <FontAwesomeIcon 
                    icon={faUser} 
                    className="w-5 h-5 fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300" 
                  />
                  <span>Profile</span>
                </DropdownItem>
              </li>
              <li>
                <div 
                  onClick={() => handleNavigate("/notifikasi", "canViewNotification")}
                  className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 cursor-pointer"
                >
                  <FontAwesomeIcon 
                    icon={faBell} 
                    className="w-5 h-5 fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300" 
                  />
                  <span>Notifikasi</span>
                </div>
              </li>
              <li>
                <div 
                  onClick={() => handleNavigate("/riwayat-transaksi", "canViewHistory")}
                  className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 cursor-pointer"
                >
                  <FontAwesomeIcon 
                    icon={faHistory} 
                    className="w-5 h-5 fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300" 
                  />
                  <span>Riwayat Transaksi</span>
                </div>
              </li>
              <li>
                <div
                  onClick={() => {
                    setIsLoggingOut(true);
                    closeDropdown();
                  }}
                  className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 cursor-pointer"
                >
                  <FontAwesomeIcon 
                    icon={faRightFromBracket} 
                    className="w-5 h-5 fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300" 
                  />
                  <span>Keluar</span>
                </div>
              </li>
            </>
          )}
        </ul>
      </Dropdown>

      {/* Access Denied Modal */}
      <AccessDeniedModal
        isOpen={accessDeniedModal.show}
        onClose={closeAccessDeniedModal}
        title={accessDeniedModal.title}
        message={accessDeniedModal.message}
      />
    </div>
  );
}
