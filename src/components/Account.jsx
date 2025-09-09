import React, { useEffect, useState } from "react";
import { HiOutlineCog } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

const Account = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newUser, setNewUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSave = () => {
    const phoneRegex = /^\+998\d{9}$/;
    if (!phoneRegex.test(newUser.phone)) {
      setError("❌ Telefon raqami noto‘g‘ri. Format: +998XXXXXXXXX");
      return;
    }

    localStorage.setItem("userData", JSON.stringify(newUser));
    setUser(newUser);
    setEditing(false);
    setError("");
  };

  const handleCancel = () => {
    setEditing(false);
    setNewUser(user);
    setError("");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedUser = { ...user, photo_url: reader.result };
        setUser(updatedUser);
        localStorage.setItem("userData", JSON.stringify(updatedUser));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return <p className="text-center mt-10">Foydalanuvchi topilmadi !</p>;
  }

  return (
    <div className="relative flex flex-col items-center my-4 rounded-2xl py-4 border-2 border-black space-y-3 gradient sm:max-w-[400px] h-[95vh] w-auto sm:mx-auto mx-4">
      <div className="relative">
        <img
          src={user.photo_url || "https://telegram.org/img/t_logo.png"}
          alt="User"
          className="w-32 h-32 rounded-full border-4 border-[#FF6A00]"
        />
        <label
          htmlFor="photoInput"
          className="absolute bottom-2 right-2 bg-[#FF6A00] text-white p-2 rounded-full cursor-pointer shadow-md"
        >
          ✏️
        </label>
        <input
          type="file"
          id="photoInput"
          className="hidden"
          accept="image/*"
          onChange={handlePhotoChange}
        />
      </div>

      <AnimatePresence mode="wait">
        {editing ? (
          <motion.div
            key="edit-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center space-y-2 w-full px-4"
          >
            <input
              type="text"
              defaultValue={user.fullName}
              onChange={(e) =>
                setNewUser({ ...user, fullName: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              defaultValue={user.phone}
              maxLength={13}
              onChange={(e) => {
                const value = e.target.value;
                if (/^[+0-9]*$/.test(value)) {
                  setNewUser({ ...user, phone: value });
                }
              }}
              className="border p-2 rounded w-full"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <input
              type="text"
              defaultValue={user.region}
              onChange={(e) =>
                setNewUser({ ...user, region: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              defaultValue={user.city}
              onChange={(e) => setNewUser({ ...user, city: e.target.value })}
              className="border p-2 rounded w-full"
            />
            <button
              onClick={handleSave}
              className="bg-[#FF6A00] w-full text-white px-4 py-2 rounded-lg mt-5"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="w-full text-[#FF6A00] px-4 py-2 rounded-lg mt-5"
            >
              Cancel
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="view-mode"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col px-4 w-full"
          >
            <div className="bg-white p-3 rounded-xl">
              <h2 className="text-xl font-semibold">{user.fullName}</h2>
              <p className="text-gray-600">
                <span className="text-black">Telefon raqam</span> {user.phone}
              </p>
              <p className="text-gray-600">
                <span className="text-black">Viloyat</span>: {user.region},
              </p>
              <p className="text-gray-600">
                <span className="text-black">Shahar</span>: {user.city},
              </p>
              <p className="text-gray-500 text-sm">
                Telegram ID: {user.chatId}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!editing && (
        <button
          onClick={() => {
            setEditing(true);
            setNewUser(user);
          }}
          className="absolute top-1 right-5 bg-[#FF6A00] text-white px-4 py-2 rounded-full"
        >
          <HiOutlineCog />
        </button>
      )}
    </div>
  );
};

export default Account;
