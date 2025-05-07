import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-slate-800 ">
      <div className="container mx-auto flex justify-between items-center px-4 py-5 h-14">
        <div className="logo font-bold text-white">
          <span className="text-purple-700">&lt;</span>
          Pass
          <span className="text-purple-700">OP/ &gt;</span>
        </div>
        <ul>
          <li className="flex gap-4 text-blue-100">
            <a className="hover:font-bold" href="/login">
              Login
            </a>
            <a className="hover:font-bold" href="/Manage">
              Manage password
            </a>
            <a className="hover:font-bold" href="/contact">
              Contact
            </a>
          </li>
        </ul>
        <a
          href="https://github.com/chynphie"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:bg-purple-500 rounded-full flex my-1 mx-2 justify-between items-center"
        >
          <img
            className="invert p-1 w-10"
            src="src/assets/icons/github.png"
            alt="github logo"
          ></img>
          <span className="font-bold px-2">Github</span>
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
