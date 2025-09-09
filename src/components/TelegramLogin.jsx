import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function TelegramLogin() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.onTelegramAuth = (userData) => {
      setUser(userData);

      // User ma'lumotlarini localStorage ga saqlaymiz
      localStorage.setItem("userData", JSON.stringify(userData));

      // Login sahifasiga o'tkazamiz
      navigate("/login", { state: { chatId: userData.id, user: userData } });
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", "testnimadir2_bot"); // bot username @siz
    script.setAttribute("data-size", "large");
    script.setAttribute("data-userpic", "true");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");

    const container = document.getElementById("tg-login");
    if (container) {
      container.innerHTML = "";
      container.appendChild(script);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen grid place-items-center bg-[radial-gradient(1200px_600px_at_70%_-20%,#17264a_0%,#0b1220_55%,#070b14_100%)] text-[#e9f0ff] font-sans">
      <main className="w-full max-w-md bg-[#111a2e] rounded-2xl p-6 shadow-lg text-center">
        <h1 className="text-2xl font-semibold mb-2">Telegram bilan kirish</h1>
        <p className="text-[#9bb0d1] mb-4">
          Quyidagi tugma orqali autentifikatsiya qiling.
        </p>

        {!user && <div id="tg-login"></div>}
      </main>
    </div>
  );
}
