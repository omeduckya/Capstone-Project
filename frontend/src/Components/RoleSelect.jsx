import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";  // 确保 logo 在同目录

const RoleSelectLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#fffef5] via-[#ffedea] to-[#ffdce5] px-6 font-sans text-[#2d2d2d]">

      {/* logo circle */}
      <div className="mb-12">
        <div className="w-44 h-44 bg-white rounded-full flex items-center justify-center shadow-md border border-pink-50 p-2 overflow-hidden">
          <img 
            src={logo} 
            alt="cake craft studio" 
            className="w-full h-full object-contain rounded-full"
          />
        </div>
      </div>

      {/* main heading */}
      <div className="text-center max-w-3xl mb-14">
        <h1 className="text-[2.6rem] md:text-[3.2rem] font-serif font-extrabold mb-6 leading-[1.1] tracking-tight text-[#1a1a1a]">
          #1 platform connecting home bakers <br />
          with people who crave something special.
        </h1>
        <p className="text-lg md:text-xl text-[#555] font-light tracking-wide">
          discover custom and ready-made cakes crafted by talented <br className="hidden md:block" />
          home bakers — all in one place.
        </p>
      </div>

      {/* action cards */}
      <div className="flex flex-col md:flex-row gap-5 w-full max-w-4xl">

        {/* customer button */}
        <button
          onClick={() => navigate("/auth/customer")}
          className="flex-1 flex items-center p-5 bg-white/40 backdrop-blur-lg rounded-[2.5rem] border border-white/60 hover:bg-white/70 transition-all duration-300 shadow-sm group"
        >
          <div className="w-14 h-14 bg-[#ffe4e6] rounded-2xl flex items-center justify-center mr-4">
             <span className="text-2xl">👤</span>
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-bold text-[#1a1a1a] text-[1.05rem]">Continue as Customer</h3>
            <p className="text-xs text-gray-500 leading-tight">Browse home bakers, order custom or ready-made cakes.</p>
          </div>
          <span className="text-xl text-gray-400 group-hover:translate-x-1 group-hover:text-black transition-all mr-2">→</span>
        </button>

        {/* baker button */}
        <button
          onClick={() => navigate("/auth/baker")}
          className="flex-1 flex items-center p-5 bg-white/40 backdrop-blur-lg rounded-[2.5rem] border border-white/60 hover:bg-white/70 transition-all duration-300 shadow-sm group"
        >
          <div className="w-14 h-14 bg-[#f0f9ff] rounded-2xl flex items-center justify-center mr-4 text-2xl">
             🎂
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-bold text-[#1a1a1a] text-[1.05rem]">Continue as Baker</h3>
            <p className="text-xs text-gray-500 leading-tight">Showcase your creations and build your brand.</p>
          </div>
          <span className="text-xl text-gray-400 group-hover:translate-x-1 group-hover:text-black transition-all mr-2">→</span>
        </button>

      </div>

      {/* footer */}
      <p className="mt-14 text-sm text-gray-400 font-medium tracking-tight">
        Join thousands of happy customers and talented bakers
      </p>

    </div>
  );
};

export default RoleSelectLanding;
