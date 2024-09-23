import React from "react";
import { BiClipboard, BiHomeAlt, BiUser } from "react-icons/bi";
import { BsClipboardData, BsBriefcase } from "react-icons/bs";
import { Link } from "react-scroll";

const Nav = () => {
  return (
    <nav className="fixed bottom-2 lg:bottom-8 w-full overflow-hidden z-50">
      <div className="container mx-auto">
        {/*nav inner*/}
        <div className="w-full bg-black/20 h-[96px] backdrop-blur-2xl rounded-full max-w-[600px] mx-auto px-8 flex justify-between items-center text-2xl text-white/50">
          <Link
            to="home"
            activeclass="active"
            smooth={true}
            spy={true}
            className="cursor-pointer w-[60px] h-[60px] flex items-center justify-center"
          >
            <BiHomeAlt />
          </Link>
          <Link
            to="about"
            activeclass="active"
            smooth={true}
            spy={true}
            className="cursor-pointer w-[60px] h-[60px] flex items-center justify-center"
          >
            <BiUser />
          </Link>
          <Link
            to="contact"
            activeclass="active"
            smooth={true}
            spy={true}
            className="cursor-pointer w-[60px] h-[60px] flex items-center justify-center"
          >
            <BiClipboard />
          </Link>
          <Link
            to="projects"
            activeclass="active"
            smooth={true}
            spy={true}
            className="cursor-pointer w-[60px] h-[60px] flex items-center justify-center"
          >
            <BsBriefcase />
          </Link>
          <Link
            to="education"
            activeclass="active"
            smooth={true}
            spy={true}
            className="cursor-pointer w-[60px] h-[60px] flex items-center justify-center"
          >
            <BsClipboardData />
          </Link>
          <Link
            to="contact"
            activeclass="active"
            smooth={true}
            spy={true}
            className="cursor-pointer w-[60px] h-[60px] flex items-center justify-center"
          >
            <BiClipboard />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
