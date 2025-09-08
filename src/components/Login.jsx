import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Login = ({ chatId }) => {
  // <-- chatId prop sifatida olinadi
  const navigate = useNavigate();
  const location = useLocation();
  const chatIdFromTelegram = location.state?.chatId || ""; // Telegramdan kelgan chatId

  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    region: "",
    city: "",
    chatId: chatIdFromTelegram, // <-- avtomatik to'ldiriladi
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async () => {
    let newErrors = {};
    if (!formData.fullname) newErrors.fullname = "Ism kiritilishi shart!";
    if (!formData.phone) {
      newErrors.phone = "Telefon raqam shart!";
    } else if (!/^\+998\d{9}$/.test(formData.phone)) {
      newErrors.phone =
        "Telefon raqam +998 bilan boshlanishi va 13 ta belgidan iborat bo‘lishi kerak!";
    }
    if (!formData.region) newErrors.region = "Viloyat tanlang!";
    if (!formData.city) newErrors.city = "Shahar tanlang!";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        chatId: chatId || "123456789",
        fullName: formData.fullname,
        region: formData.region,
        city: formData.city,
        phone: formData.phone,
        imageUrl: "https://picsum.photos/200",
      };

      const res = await fetch("https://167.86.121.42:8080/auth/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`API ishlamadi: ${res.status}`);
      }

      const data = await res.json();

      if (data.success === false) {
        alert(data.message || "Login muvaffaqiyatsiz!");
        return;
      }

      if (data.data) {
        localStorage.setItem("token", data.data);
        localStorage.setItem("userData", JSON.stringify(data.data));
        console.log("📌 Token saqlandi:", data.data);
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 md:px-0 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md space-y-5">
        <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>

        <div>
          <input
            type="text"
            name="fullname"
            placeholder="Ismingiz"
            value={formData.fullname}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.fullname ? "border-red-500" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-orange-500`}
          />
          {errors.fullname && (
            <p className="text-red-500 text-sm mt-1">{errors.fullname}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            name="phone"
            placeholder="+998901234567"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.phone ? "border-red-500" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-orange-500`}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            name="region"
            placeholder="Viloyatingiz"
            value={formData.region}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.region ? "border-red-500" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-orange-500`}
          />
          {errors.region && (
            <p className="text-red-500 text-sm mt-1">{errors.region}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            name="city"
            placeholder="Shaharingiz"
            value={formData.city}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.city ? "border-red-500" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-orange-500`}
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
        >
          {loading ? "Yuborilmoqda..." : "Continue"}
        </button>
      </div>
    </div>
  );
};

export default Login;
