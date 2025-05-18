import { useState, useEffect } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTachometerAlt, faUser, faHistory, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

export default function NavbarUserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role) {
          setRole(parsedUser.role);
        }
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
      }
    }
  }, []);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/", { replace: true });
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
        className="absolute right-0 mt-[17px] flex w-[220px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <ul className="flex flex-col gap-1">
          {role === "admin" && (
            <>
            <li>
                <DropdownItem
                  onItemClick={closeDropdown}
                  tag="a"
                  to="/profile"
                  className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  <FontAwesomeIcon icon={faUser} className="w-5 h-5 fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300" />
                  Profile
                </DropdownItem>
              </li>
              <li>
                <DropdownItem
                  onItemClick={closeDropdown}
                  tag="a"
                  to="/dashboardhome"
                  className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  <FontAwesomeIcon icon={faTachometerAlt} className="w-5 h-5 fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300" />
                  Dashboard
                </DropdownItem>
              </li>
              <li>
                <DropdownItem
                  onItemClick={() => {
                    closeDropdown();
                    handleLogout();
                  }}
                  tag="button"
                  className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} className="w-5 h-5 fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300" />
                  Keluar
                </DropdownItem>
              </li>
            </>
          )}

          {role === "donatur" && (
            <>
              <li>
                <DropdownItem
                  onItemClick={closeDropdown}
                  tag="a"
                  to="/profile"
                  className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  <FontAwesomeIcon icon={faUser} className="w-5 h-5 fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300" />
                  Profile
                </DropdownItem>
              </li>
              <li>
                <DropdownItem
                  onItemClick={closeDropdown}
                  tag="a"
                  to="/riwayat-donasi"
                  className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  <FontAwesomeIcon icon={faHistory} className="w-5 h-5 fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300" />
                  Riwayat Donasi
                </DropdownItem>
              </li>
              <li>
                <DropdownItem
                  onItemClick={() => {
                    closeDropdown();
                    handleLogout();
                  }}
                  tag="button"
                  className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} className="w-5 h-5 fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300" />
                  Keluar
                </DropdownItem>
              </li>
            </>
          )}
        </ul>
      </Dropdown>
    </div>
  );
}
