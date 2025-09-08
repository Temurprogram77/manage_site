// src/components/NotFound.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <div className="flex flex-col items-center justify-center rounded-xl gap-2 p-4 gradient">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-2xl">Page not found</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-[#FF6A00] text-white rounded"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
