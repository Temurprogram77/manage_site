import React, { useState } from "react";

export default function TelegramLogin() {
  const [user, setUser] = useState(null);

  const onTelegramAuth = (userData) => {
    setUser(userData);
  };

  return (
    <main className="card">
      <h1>Telegram bilan kirish</h1>
      <p>Quyidagi tugma orqali autentifikatsiya qiling.</p>

      {!user && (
        <div id="tg-login">
          <script
            async
            src="https://telegram.org/js/telegram-widget.js?22"
            data-telegram-login="testnimadir2_bot"
            data-size="large" 
            data-userpic="true"
            data-onauth="onTelegramAuth(user)"
            data-request-access="write"
          ></script>
        </div>
      )}

      {user && (
        <div className="profile" id="profile">
          <img
            id="p-photo"
            src={user.photo_url || "https://telegram.org/img/t_logo.png"}
            alt="User photo"
          />
          <h2 id="p-name">
            {user.first_name} {user.last_name || ""}
          </h2>
          {user.username && (
            <span className="username" id="p-username">
              @{user.username}
            </span>
          )}
          <span id="p-id">ID: {user.id}</span>
        </div>
      )}
    </main>
  );
}
