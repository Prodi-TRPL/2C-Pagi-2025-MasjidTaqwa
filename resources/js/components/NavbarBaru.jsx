// Navbar2.jsx
import { Menus } from "../utils";
import DesktopMenu from "./DesktopMenu";
import MobMenu from "./MobMenu";

/* Navbar component: Modify menu, link path, and sign-in button here */
export default function NavbarBaru() {
    return (
<header className="h-16 text-[15px] fixed inset-0 flex-center bg-white text-black ">
        <nav className=" px-3.5 flex-center-between w-full max-w-7xl mx-auto">
            <div className="flex-center gap-x-3 z-[999] relative">
            {/* Logo Sidontaq */}
<img src="/img/LogoSidontaqNav.jpeg" alt="Logo" className="h-13 w-auto" />
            </div>

{/* Menu list: Modify menu items here */}
<ul className="gap-x-1 hidden lg:flex lg:flex-center">
            {Menus.map((menu) => (
                <DesktopMenu menu={menu} key={menu.name} />
            ))}
            </ul>

            <div className="flex-center gap-x-5">
            {/* Sign In button: Modify sign-in button here */}
            <button
                aria-label="sign-in"
                className="bg-white/5 z-[999] relative px-3 py-1.5 shadow rounded-xl flex-center"
            >
                Sign In
            </button>
            <div className="lg:hidden">
                <MobMenu Menus={Menus} />
            </div>
            </div>
        </nav>
        </header>
    );
}
