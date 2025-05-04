import React from "react";

const Footer = () => {
  return (
    <div className="bg-slate-800 text-white flex flex-col justify-center items-center fixed w-full bottom-0">
      <div className="logo font-bold text-white text-1xl ">
        <span className="text-purple-500">&lt;</span>
        <span>Pass</span>
        <span className="text-purple-500">OP/ &gt;</span>
      </div>

      <div className='flex justify-center items-center'>Created with ❤️ by Chynphie</div>
    </div>
  );
};

export default Footer;
