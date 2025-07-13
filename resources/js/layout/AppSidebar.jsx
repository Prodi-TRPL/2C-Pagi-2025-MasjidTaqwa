import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";

// Import icons from React Icons library
import { 
    MdDashboard, 
    MdKeyboardArrowDown, 
    MdPayment,
    MdCategory,
    MdMoreHoriz,
    MdNotifications,
    MdSecurity,
    MdHistory,
    MdPerson
} from "react-icons/md";
import { 
    FaHandHoldingHeart, 
    FaBuilding, 
    FaMoneyBillWave,
    FaUsersCog
} from "react-icons/fa";
import { BsFileEarmarkBarGraph } from "react-icons/bs";

const navItems = [
    {
        icon: <MdDashboard className="w-5 h-5" />,
        name: "Dashboard Utama",
        path: "/dashboardhome",
    },
    {
        icon: <MdPerson className="w-5 h-5" />,
        name: "Profil Admin",
        path: "/dashboardhome/profil-admin",
    },
    {
        icon: <FaHandHoldingHeart className="w-5 h-5" />,
        name: "Data Donasi",
        path: "/dashboardhome/datadonasi",
    },
    {
        icon: <FaBuilding className="w-5 h-5" />,
        name: "Proyek Pembangunan",
        path: "/dashboardhome/proyek-pembangunan",
    },
    {
        icon: <FaMoneyBillWave className="w-5 h-5" />,
        name: "Pengeluaran",
        path: "/dashboardhome/pengeluaran",
    },
    {
        icon: <BsFileEarmarkBarGraph className="w-5 h-5" />,
        name: "Laporan Keuangan",
        path: "/dashboardhome/laporan-keuangan",
    },
    {
        icon: <MdCategory className="w-5 h-5" />,
        name: "Kategori Pengeluaran",
        path: "/dashboardhome/kategoripengaluaran",
    },
    {
        icon: <MdNotifications className="w-5 h-5" />,
        name: "Notifikasi",
        path: "/dashboardhome/notifikasi",
    },
    {
        icon: <FaUsersCog className="w-5 h-5" />,
        name: "Kelola Akses Donatur",
        path: "/dashboardhome/kelola-akses-donatur",
    },
    {
        icon: <MdHistory className="w-5 h-5" />,
        name: "Log Aktivitas",
        path: "/dashboardhome/log-aktivitas",
    },
];

const AppSidebar = () => {
    const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
    const location = useLocation();

    const [openSubmenu, setOpenSubmenu] = useState(null);
    const [subMenuHeight, setSubMenuHeight] = useState({});
    const subMenuRefs = useRef({});

    const isActive = useCallback(
        (path) => location.pathname === path,
        [location.pathname]
    );

    useEffect(() => {
        let submenuMatched = false;
        navItems.forEach((nav, index) => {
            if (nav.subItems) {
                nav.subItems.forEach((subItem) => {
                    if (isActive(subItem.path)) {
                        setOpenSubmenu({
                            type: "main",
                            index,
                        });
                        submenuMatched = true;
                    }
                });
            }
        });

        if (!submenuMatched) {
            setOpenSubmenu(null);
        }
    }, [location, isActive]);

    useEffect(() => {
        if (openSubmenu !== null) {
            const key = `${openSubmenu.type}-${openSubmenu.index}`;
            if (subMenuRefs.current[key]) {
                setSubMenuHeight((prevHeights) => ({
                    ...prevHeights,
                    [key]: subMenuRefs.current[key]?.scrollHeight || 0,
                }));
            }
        }
    }, [openSubmenu]);

    const handleSubmenuToggle = (index, menuType) => {
        setOpenSubmenu((prevOpenSubmenu) => {
            if (
                prevOpenSubmenu &&
                prevOpenSubmenu.type === menuType &&
                prevOpenSubmenu.index === index
            ) {
                return null;
            }
            return { type: menuType, index };
        });
    };

    const renderMenuItems = (items, menuType) => (
        <ul className="flex flex-col gap-4">
            {items.map((nav, index) => (
                <li key={nav.name}>
                    {nav.subItems ? (
                        <button
                            onClick={() => handleSubmenuToggle(index, menuType)}
                            className={`menu-item group ${
                                openSubmenu?.type === menuType && openSubmenu?.index === index
                                    ? "menu-item-active"
                                    : "menu-item-inactive"
                            } cursor-pointer ${
                                !isExpanded && !isHovered
                                    ? "lg:justify-center"
                                    : "lg:justify-start"
                            }`}
                        >
                            <span
                                className={`menu-item-icon-size  ${
                                    openSubmenu?.type === menuType && openSubmenu?.index === index
                                        ? "menu-item-icon-active"
                                        : "menu-item-icon-inactive"
                                }`}
                            >
                                {nav.icon}
                            </span>
                            {(isExpanded || isHovered || isMobileOpen) && (
                                <span className="menu-item-text">{nav.name}</span>
                            )}
                            {(isExpanded || isHovered || isMobileOpen) && (
                                <MdKeyboardArrowDown
                                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                                        openSubmenu?.type === menuType &&
                                        openSubmenu?.index === index
                                            ? "rotate-180 text-brand-500"
                                            : ""
                                    }`}
                                />
                            )}
                        </button>
                    ) : (
                        nav.path && (
                            <Link
                                to={nav.path}
                                className={`menu-item group ${
                                    isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                                }`}
                            >
                                <span
                                    className={`menu-item-icon-size ${
                                        isActive(nav.path)
                                            ? "menu-item-icon-active"
                                            : "menu-item-icon-inactive"
                                    }`}
                                >
                                    {nav.icon}
                                </span>
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <span className="menu-item-text">{nav.name}</span>
                                )}
                            </Link>
                        )
                    )}
                    {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                        <div
                            ref={(el) => {
                                subMenuRefs.current[`${menuType}-${index}`] = el;
                            }}
                            className="overflow-hidden transition-all duration-300"
                            style={{
                                height:
                                    openSubmenu?.type === menuType && openSubmenu?.index === index
                                        ? `${subMenuHeight[`${menuType}-${index}`]}px`
                                        : "0px",
                            }}
                        >
                            <ul className="mt-2 space-y-1 ml-9">
                                {nav.subItems.map((subItem) => (
                                    <li key={subItem.name}>
                                        <Link
                                            to={subItem.path}
                                            className={`menu-dropdown-item ${
                                                isActive(subItem.path)
                                                    ? "menu-dropdown-item-active"
                                                    : "menu-dropdown-item-inactive"
                                            }`}
                                        >
                                            {subItem.name}
                                            <span className="flex items-center gap-1 ml-auto">
                                                {subItem.new && (
                                                    <span
                                                        className={`ml-auto ${
                                                            isActive(subItem.path)
                                                                ? "menu-dropdown-badge-active"
                                                                : "menu-dropdown-badge-inactive"
                                                        } menu-dropdown-badge`}
                                                    >
                                                        new
                                                    </span>
                                                )}
                                                {subItem.pro && (
                                                    <span
                                                        className={`ml-auto ${
                                                            isActive(subItem.path)
                                                                ? "menu-dropdown-badge-active"
                                                                : "menu-dropdown-badge-inactive"
                                                        } menu-dropdown-badge`}
                                                    >
                                                        pro
                                                    </span>
                                                )}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );

    return (
        <aside
            className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
            ${
                isExpanded || isMobileOpen
                    ? "w-[290px]"
                    : isHovered
                    ? "w-[290px]"
                    : "w-[90px]"
            }
            ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0`}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`py-8 flex ${
                    !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
            >
                <Link to="/">
                    {isExpanded || isHovered || isMobileOpen ? (
                        <>
                            <img
                                className="dark:hidden"
                                src="../img/LogoSidontaqNav.jpeg"
                                alt="Logo"
                                width={200}
                                height={40}
                            />
                        </>
                    ) : (
                        <img
                            src="../img/LogoSidontaq.jpeg"
                            alt="Logo"
                            width={32}
                            height={32}
                        />
                    )}
                </Link>
            </div>
            <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
                <nav className="mb-6">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2
                                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                                    !isExpanded && !isHovered
                                        ? "lg:justify-center"
                                        : "justify-start"
                                }`}
                            >
                                {isExpanded || isHovered || isMobileOpen ? (
                                    "Menu"
                                ) : (
                                    <MdMoreHoriz className="w-6 h-6" />
                                )}
                            </h2>
                            {renderMenuItems(navItems, "main")}
                        </div>
                    </div>
                </nav>
            </div>
        </aside>
    );
};

export default AppSidebar;
