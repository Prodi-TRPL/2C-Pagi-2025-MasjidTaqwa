import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

const scrollWithOffset = (el) => {
  const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset;
  const yOffset = -80;
  window.scrollTo({ top: yCoordinate + yOffset, behavior: "smooth" });
};

export default function MobMenu({ Menus }) {
  const [isOpen, setIsOpen] = useState(false);
  const [clicked, setClicked] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
    setClicked(null);
  };

  const handleHashLinkClick = (event, to) => {
    event.preventDefault();
    const id = to.split("#")[1];
    if (location.pathname !== "/") {
      navigate("/", { replace: false });
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const yCoordinate = element.getBoundingClientRect().top + window.pageYOffset;
          const yOffset = -80;
          window.scrollTo({ top: yCoordinate + yOffset, behavior: "smooth" });
          window.history.pushState(null, "", to);
          setIsOpen(false); // Close menu after navigation and scroll
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        const yCoordinate = element.getBoundingClientRect().top + window.pageYOffset;
        const yOffset = -80;
        window.scrollTo({ top: yCoordinate + yOffset, behavior: "smooth" });
        window.history.pushState(null, "", to);
        setIsOpen(false); // Close menu after scroll
      }
    }
  };

  const subMenuDrawer = {
    enter: {
      height: "auto",
      overflow: "hidden",
    },
    exit: {
      height: 0,
      overflow: "hidden",
    },
  };

  return (
    <div className="inline-flex items-center lg:hidden">
      <button className="z-[999] relative" onClick={toggleDrawer}>
        {isOpen ? <X /> : <Menu />}
      </button>

      <motion.div
        className="fixed left-0 right-0 top-16 overflow-y-auto h-full bg-white backdrop-blur text-black p-6 pb-20"
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? "0%" : "-100%" }}
      >
        <ul>
          {Menus.map(({ name, link, subMenu }, i) => {
            const isClicked = clicked === i;
            const hasSubMenu = subMenu?.length;
            return (
              <li key={name} className="">
                <span
                  className={`flex-center-between p-4 rounded-md cursor-pointer relative ${
                    isClicked ? "bg-[#59B997] text-white" : "hover:bg-white/5"
                  }`}
                  onClick={() => setClicked(isClicked ? null : i)}
                >
                  {link ? (
                    link.includes("#") ? (
                      <HashLink
                        smooth
                        to={link}
                        className={isClicked ? "text-white" : ""}
                        scroll={(el) => scrollWithOffset(el)}
                        onClick={(e) => handleHashLinkClick(e, link)}
                      >
                        {name}
                      </HashLink>
                    ) : (
                      <Link to={link} className={isClicked ? "text-white" : ""}>
                        {name}
                      </Link>
                    )
                  ) : (
                    name
                  )}
                  {hasSubMenu && (
                    <ChevronDown
                      className={`ml-auto ${isClicked ? "rotate-180 text-white" : ""}`}
                    />
                  )}
                </span>
                {hasSubMenu && (
                  <motion.ul
                    initial="exit"
                    animate={isClicked ? "enter" : "exit"}
                    variants={subMenuDrawer}
                    className="ml-5"
                  >
                    {subMenu.map(({ name, link, icon: Icon }) => (
                      <li
                        key={name}
                        className="p-2 flex-center hover:bg-white/5 rounded-md gap-x-2 cursor-pointer"
                      >
                        {Icon ? <Icon size={17} /> : null}
                        {link ? (
                          link.includes("#") ? (
                            <HashLink
                              smooth
                              to={link}
                              scroll={(el) => scrollWithOffset(el)}
                              onClick={(e) => handleHashLinkClick(e, link)}
                            >
                              {name}
                            </HashLink>
                          ) : (
                            <Link to={link}>{name}</Link>
                          )
                        ) : (
                          name
                        )}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </li>
            );
          })}
        </ul>
      </motion.div>
    </div>
  );
}
