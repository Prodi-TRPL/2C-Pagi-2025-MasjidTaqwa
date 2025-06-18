import { useState, useEffect } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTachometerAlt, faUser, faHistory, faRightFromBracket, faBell } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

export default function NavbarUserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState("donatur"); // default ke donatur
  const [user, setUser] = useState({ name: "User", email: "user@example.com" });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
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

        setRole("donatur"); // kamu bisa sesuaikan jika ingin dinamis
      } catch (err) {
        console.error("Gagal ambil user:", err);
      }
    };

    fetchUser();
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

    if (result.isDismissed || result.isConfirmed) {
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
          {/* Donatur menu */}
          {role === "donatur" && (
            <>
              <li>
                <DropdownItem onItemClick={closeDropdown} tag="a" to="/profile" className="...">
                  <FontAwesomeIcon icon={faUser} className="..." />
                  Profile
                </DropdownItem>
              </li>
              <li>
                <DropdownItem onItemClick={closeDropdown} tag="a" to="/notifikasi" className="...">
                  <FontAwesomeIcon icon={faBell} className="..." />
                  Notifikasi
                </DropdownItem>
              </li>
              <li>
                <DropdownItem onItemClick={closeDropdown} tag="a" to="/riwayat-transaksi" className="...">
                  <FontAwesomeIcon icon={faHistory} className="..." />
                  Riwayat Transaksi
                </DropdownItem>
              </li>
              <li>
                <DropdownItem onItemClick={closeDropdown} tag="a" to="/progress-pembangunan" className="...">
                  <FontAwesomeIcon icon={faTachometerAlt} className="..." />
                  Progress Pembangunan
                </DropdownItem>
              </li>
              <li>
                <DropdownItem
                  onItemClick={() => {
                    setIsLoggingOut(true);
                    closeDropdown();
                  }}
                  tag="button"
                  className="..."
                >
                  <FontAwesomeIcon icon={faRightFromBracket} className="..." />
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
