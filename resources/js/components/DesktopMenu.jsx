import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

const scrollWithOffset = (el) => {
  const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset;
  const yOffset = -80; 
  window.scrollTo({ top: yCoordinate + yOffset, behavior: 'smooth' });
};

export default function DesktopMenu({ menu }) {
  const [isHover, toggleHover] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleHashLinkClick = (event, to) => {
    event.preventDefault();
    const id = to.split('#')[1];
    if (location.pathname !== '/') {
      navigate('/', { replace: false });
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const yCoordinate = element.getBoundingClientRect().top + window.pageYOffset;
          const yOffset = -80;
          window.scrollTo({ top: yCoordinate + yOffset, behavior: 'smooth' });
          window.history.pushState(null, '', to);
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        const yCoordinate = element.getBoundingClientRect().top + window.pageYOffset;
        const yOffset = -80;
        window.scrollTo({ top: yCoordinate + yOffset, behavior: 'smooth' });
        window.history.pushState(null, '', to);
      }
    }
  };

  const toggleHoverMenu = () => {
    toggleHover(!isHover);
  };

  const subMenuAnimate = {
    enter: {
      opacity: 1,
      rotateX: 0,
      transition: {
        duration: 0.5,
      },
      display: "block",
    },
    exit: {
      opacity: 0,
      rotateX: -15,
      transition: {
        duration: 0.5,
      },
      transitionEnd: {
        display: "none",
      },
    },
  };

  const hasSubMenu = menu?.subMenu?.length;

  return (
    <motion.li
      className="group/link"
      onHoverStart={() => {
        toggleHoverMenu();
      }}
      onHoverEnd={toggleHoverMenu}
      key={menu.name}
    >
      <span className="flex-center gap-1 cursor-pointer px-3 py-1 rounded-xl text-black transition-colors duration-300 ease-in-out hover:bg-[#59B997] hover:text-white">
        {menu.link ? (
          menu.link.includes('#') ? (
            <HashLink
              smooth
              to={menu.link}
              className="hover:text-white"
              scroll={el => scrollWithOffset(el)}
              onClick={(e) => handleHashLinkClick(e, menu.link)}
            >
              {menu.name}
            </HashLink>
          ) : (
            <Link to={menu.link} className="hover:text-white">{menu.name}</Link>
          )
        ) : (
          menu.name
        )}
        {hasSubMenu && (
          <ChevronDown className="mt-[0.6px] group-hover/link:rotate-180 duration-200" />
        )}
      </span>
      {hasSubMenu && (
        <motion.div
          className="sub-menu"
          initial="exit"
          animate={isHover ? "enter" : "exit"}
          variants={subMenuAnimate}
        >
          <div
            className={`grid gap-7 ${
              menu.gridCols === 3
                ? "grid-cols-3"
                : menu.gridCols === 2
                ? "grid-cols-2"
                : "grid-cols-1"
            }`}
          >
            {hasSubMenu &&
              menu.subMenu.map((submenu, i) => (
                <div className="relative cursor-pointer" key={i}>
                  {menu.gridCols > 1 && menu?.subMenuHeading?.[i] && (
                    <p className="text-sm mb-4 text-black">
                      {menu?.subMenuHeading?.[i]}
                    </p>
                  )}
                  <div className="flex-center gap-x-4 group/menubox cursor-pointer hover:text-[#59B997]">
                    <div className="bg-gray-200 w-fit p-2 rounded-md group-hover/menubox:bg-[#59B997] group-hover/menubox:text-white duration-300">
                      {submenu.icon ? <submenu.icon /> : null}
                    </div>
                    <div>
                      <h6 className="font-semibold">
                        {submenu.link ? (
                          submenu.link.includes('#') ? (
                            <HashLink
                              smooth
                              to={submenu.link}
                              className="hover:text-[#59B997]"
                              scroll={el => scrollWithOffset(el)}
                              onClick={(e) => handleHashLinkClick(e, submenu.link)}
                            >
                              {submenu.name}
                            </HashLink>
                          ) : (
                            <Link to={submenu.link} className="hover:text-[#59B997]">{submenu.name}</Link>
                          )
                        ) : (
                          submenu.name
                        )}
                      </h6>
                      <p className="text-sm text-black">{submenu.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </motion.li>
  );
}
