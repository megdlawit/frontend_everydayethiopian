import React from "react";
import { Link } from "react-router-dom";
import { navItems } from "../../static/data";

const Navbar = ({ active }) => {
  return (
    <nav className="w-full bg-[#1C3B3E]">
      <ul
        className={`
          flex flex-wrap 
          text-white font-medium
          transition-all duration-300 ease-in-out

          /* Desktop layout */
          sm:flex-row sm:justify-center sm:gap-6 sm:py-1.5 sm:text-[15px]

          /* Mobile layout */
          flex-col items-start gap-0.5 py-1 px-3 text-[14px]
        `}
      >
        {navItems &&
          navItems.map((item, index) => (
            <li key={index} className="w-full sm:w-auto">
              <Link
                to={item.url}
                className={`block sm:inline-block px-1 rounded-md hover:text-[#FFC300] transition duration-150 ${
                  active === index + 1
                    ? "text-[#FFC300]"
                    : "text-white"
                }`}
              >
                {item.title}
              </Link>
            </li>
          ))}
      </ul>
    </nav>
  );
};

export default Navbar;
