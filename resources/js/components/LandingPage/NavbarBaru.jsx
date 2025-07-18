import { Link } from "react-router-dom";
import { Menus } from "../../utils";
import DesktopMenu from "./DesktopMenu";
import MobMenu from "./MobMenu";
import NavbarUserDropdown from "./NavbarUserDropdown";
import { useState, useEffect } from "react";

/* Navbar component: Modify menu, link path, and sign-in button here */
export default function NavbarBaru() {
  const token = localStorage.getItem("token");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`h-16 text-[15px] fixed top-0 left-0 right-0 flex-center bg-white text-black z-[1000] transition-shadow duration-300 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <nav className="px-3 lg:px-15 flex-center-between w-full max-w-7xl mx-auto gap-x-3">
        <div className="flex-center gap-x-3 z-[999] relative">
          {/* Logo Sidontaq */}
          <a href="/">
            <img
              src="/img/LogoSidontaqNav.jpeg"
              alt="Logo"
              className="h-13 w-auto"
              draggable={false}
            />
          </a>
        </div>

        {/* Menu list: Modify menu items here */}
        <ul className="gap-x-1 hidden lg:flex lg:flex-center">
          {Menus.map((menu) => (
            <DesktopMenu menu={menu} key={menu.name} />
          ))}
        </ul>

        <div className="flex-center gap-x-5">
          {/* Conditionally render NavbarUserDropdown if logged in, else Masuk button */}
          {token ? (
            <NavbarUserDropdown />
          ) : (
            <Link
              to="/loginbaru"
              aria-label="masuk"
              className="bg-[#59B997] text-white z-[999] relative px-3 py-1.5 shadow rounded-xl flex-center border border-[#59B997] transition-colors duration-300 ease-in-out hover:bg-white hover:text-[#59B997]"
            >
              Masuk
            </Link>
          )}
          <div className="lg:hidden">
            <MobMenu Menus={Menus} />
          </div>
        </div>
      </nav>
    </header>
  );
}
