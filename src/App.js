// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Sahifa komponentlarini import qilamiz
import Landing from "./components/Landing";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Explanation from "./components/Explanation";
import ExamPage from "./components/ExamPage";
import TelegramLogin from "./components/TelegramLogin";

import { StarProvider } from "./StarContext";
import ExamHistory from "./components/ExamHistory";

function App() {
  return (
    <StarProvider>
      <Router>
        <Routes>
          
          {/* Boshlang‘ich landing sahifa */}
          <Route path="/" element={<Landing />} />

          {/* Login sahifasi */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard sahifasi – foydalanuvchi asosiy paneli */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Explanation sahifasi – tushuntirish sahifasi */}
          <Route path="/explanation" element={<Explanation />} />

          {/* ExamPage – imtihon sahifasi */}
          <Route path="/exam" element={<ExamPage />} />

          {/* ExamHistoryPage – imtihon sahifasi istoriyasi */}
          <Route path="/exams-history" element={<ExamHistory />} />

          {/* TelegramLogin – Telegram orqali login sahifasi */}
          <Route path="/telegram-login" element={<TelegramLogin />} />

        </Routes>
      </Router>
    </StarProvider>
  );
}

export default App;
