import React from "react";
import heroImg from "../assets/hero.png";
import logo from "../assets/logo.png";
import { FaTelegramPlane } from "react-icons/fa"; // Telegram icon
import { Link } from "react-router-dom";

const Landing = () => {
  const handleTelegramLogin = () => {
    // To'g'ridan-to'g'ri Telegram bot login URL'iga yo'naltirish
    window.location.href = "https://t.me/testnimadir2_bot";
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-white px-6 py-8 max-w-md mx-auto md:max-w-2xl">
      <div className="h-fit">
        <img
          src={logo}
          alt="logo"
          className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
        />

        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold leading-snug mb-6">
            Find out <br /> your English level!
          </h1>
          <img src={heroImg} alt="hero" className="w-72 md:w-96 lg:w-[28rem]" />
        </div>

        <button
          onClick={handleTelegramLogin}
          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-sky-400 to-blue-600 text-white py-3 rounded-full text-lg md:text-xl font-semibold shadow-lg hover:from-sky-500 hover:to-blue-700 transition-all duration-300"
        >
          <FaTelegramPlane className="text-2xl" />
          Continue with Telegram
        </button>
      </div>
    </div>
  );
};

export default Landing;
