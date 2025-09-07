import React from "react";
import { useNavigate } from "react-router-dom";
import "./Explanation.css";

const Explanation = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/exam");
  };

  return (
    <div className="explanation-container md:px-0 px-4">
      <div className="explanation-card">
        <h1 className="title">⚠️ Exam Instructions</h1>
        <p className="text">
          You will have several questions. Each question has a time limit. You can answer via microphone and your results will be saved. You cannot go back, only move forward. Please focus carefully!
        </p>
        <p className="text">
          When ready, click the button below to start the exam.
        </p>

        <button className="start-btn" onClick={handleStart}>
          🚀 Start Exam
        </button>
      </div>
    </div>
  );
};

export default Explanation;
