// src/components/RegisterForm.jsx
import React, { useState } from "react";

const BOT_TOKEN = "SIZNING_BOT_TOKEN"; // Bot tokenni shu yerga qo'ying
const CHAT_ID = "SIZNING_CHAT_ID"; // Sizga ma'lumot keladigan Telegram chat ID

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    phone: "",
    city: "",
    region: "",
    imgUrl: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const message = `
✅ Yangi foydalanuvchi ro'yxatdan o'tdi:
Username: ${formData.username}
Ismi: ${formData.name}
Telefon: ${formData.phone}
Shahar: ${formData.city}
Region: ${formData.region}
Rasm URL: ${formData.imgUrl}
`;

    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
        }),
      });
      alert("Ro'yxatdan o'tish muvaffaqiyatli!");
      setFormData({
        username: "",
        name: "",
        phone: "",
        city: "",
        region: "",
        imgUrl: "",
      });
    } catch (error) {
      console.error("Xato:", error);
      alert("Xatolik yuz berdi, qayta urinib ko'ring.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="username"
        placeholder="Telegram username"
        value={formData.username}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="name"
        placeholder="Ismingiz"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="phone"
        placeholder="Telefon raqami"
        value={formData.phone}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="city"
        placeholder="Shahar"
        value={formData.city}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="region"
        placeholder="Region"
        value={formData.region}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="imgUrl"
        placeholder="Rasm URL"
        value={formData.imgUrl}
        onChange={handleChange}
      />
      <button type="submit">Ro'yxatdan o'tish</button>
    </form>
  );
};

export default RegisterForm;
