// App.js
import React, { useState } from "react";
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
import ExamDetail from "./components/Examdetail";
import NotFound from "./components/NotFound";
import RegisterForm from "./components/RegisterForm";

function App() {
  const [telegramUser, setTelegramUser] = useState(null);

  return (
    <StarProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route 
            path="/login" 
            element={<Login chatId={telegramUser?.id || "123456789"} />} 
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explanation" element={<Explanation />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/exams-history" element={<ExamHistory />} />
          <Route 
            path="/telegram-login" 
            element={<TelegramLogin onAuth={(user) => setTelegramUser(user)} />} 
          />
          <Route path="/exam/:id" element={<ExamDetail />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </StarProvider>
  );
}

export default App;
