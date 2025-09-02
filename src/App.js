import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Landing from "./components/Landing";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Explanation from "./components/Explanation";
import ExamPage from "./components/ExamPage";
import TelegramLogin from "./components/TelegramLogin";

import { StarProvider } from "./StarContext"; // ⭐ yulduzlar uchun kontekst

function App() {
  return (
    <StarProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explanation" element={<Explanation />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/telegram-login" element={<TelegramLogin />} />
        </Routes>
      </Router>
    </StarProvider>
  );
}

export default App;
