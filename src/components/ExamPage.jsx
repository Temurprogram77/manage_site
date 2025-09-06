// src/components/ExamPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStars } from "../StarContext";
import "./ExamPage.css";
import micro from "../assets/micro.png";

const QUESTIONS = [
  { id: 1, part: 1, number: 1, text: "What is the capital of France?", answer: "paris" },
  { id: 2, part: 1, number: 2, text: "Say your first name.", answer: "" }, // free text
  { id: 3, part: 1, number: 3, text: "What is 2 plus 2?", answer: "4" },
];

const TIME_PER_QUESTION = 15; // 15 soniya

const ExamPage = () => {
  const navigate = useNavigate();
  const { addStar } = useStars();
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [results, setResults] = useState([]);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef(null);

  // Timer + TTS
  useEffect(() => {
    if (finished || !QUESTIONS[index]) return;

    setTimeLeft(TIME_PER_QUESTION);

    speakText(QUESTIONS[index].text);

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);

    return () => clearInterval(timerRef.current);
  }, [index, finished]);

  // Auto evaluate when time is up
  useEffect(() => {
    if (timeLeft <= 0 && !finished && QUESTIONS[index]) evaluateAnswer("");
  }, [timeLeft, finished, index]);

  // Javobni tekshirish va API'ga yuborish
  const evaluateAnswer = (userText) => {
    if (finished || !QUESTIONS[index]) return;

    const q = QUESTIONS[index];
    const normalizedUser = (userText || "").toString().trim().toLowerCase();
    const correctAnswer = (q.answer || "").toString().trim().toLowerCase();

    let isCorrect = false;
    if (correctAnswer === "") {
      isCorrect = normalizedUser.length > 0;
    } else {
      isCorrect = normalizedUser === correctAnswer;
    }

    setResults((prev) => [
      ...prev,
      { questionId: q.id, correct: isCorrect, answer: normalizedUser },
    ]);
    if (isCorrect) addStar();

    // 🔹 Javobni API'ga yuborish
    const token = localStorage.getItem("token");
    fetch("http://167.86.121.42:8080/api/test/startTest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        questionId: q.id,
        answer: normalizedUser || null,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Answer API javobi:", data);
      })
      .catch((err) => {
        console.error("❌ Answer API xato:", err);
      });

    clearInterval(timerRef.current);

    setTimeout(() => {
      if (index + 1 < QUESTIONS.length) {
        setIndex((i) => i + 1);
        setTranscript("");
        setTimeLeft(TIME_PER_QUESTION);
      } else {
        setFinished(true);
      }
    }, 900);
  };

  // 🔹 Mikrofonni bosganda yozib olish va OpenAI Whisper API'ga yuborish
  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      let audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");
        formData.append("model", "gpt-4o-mini-transcribe"); // Whisper modeli

        try {
          const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_OPENAI_KEY}`,
            },
            body: formData,
          });

          const data = await response.json();
          console.log("🎤 AI transcript:", data.text);

          setTranscript(data.text);
          evaluateAnswer(data.text);
        } catch (err) {
          console.error("❌ Whisper API xato:", err);
        }
      };

      audioChunks = [];
      mediaRecorder.start();
      setListening(true);

      // 5 soniyadan keyin yozishni to‘xtatish
      setTimeout(() => {
        mediaRecorder.stop();
        setListening(false);
      }, 5000);
    } catch (err) {
      console.error("❌ Mikrofon ishlamadi:", err);
      alert("Mikrofonni yoqib berishingiz kerak.");
    }
  };

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  if (finished) {
    const trueCount = results.filter((r) => r.correct).length;
    const falseCount = results.filter((r) => !r.correct).length;
    const storedStars = Number(localStorage.getItem("stars") || 0);

    return (
      <div className="exam-root">
        <h2 className="exam-title">Exam finished 🎉</h2>
        <p>
          ✅ Correct: {trueCount} | ❌ Wrong: {falseCount} | ⭐ Stars: {storedStars}
        </p>
        <button className="btn primary mt-6" onClick={() => navigate("/dashboard")}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  const q = QUESTIONS[index];

  return (
    <div className="exam-root">
      <div className="exam-card">
        <div className="exam-header">
          <div className="part">Part {q?.part}</div>
          <div className="progress">
            Question {index + 1} / {QUESTIONS.length}
          </div>
          <div className="timer">⏳ {timeLeft}s</div>
        </div>

        <div className="question-area">
          <div className="question-text">{q?.text}</div>
        </div>

        <div className="transcript-area">
          <div className="transcript-label">Your answer</div>
          <div className="transcript-box">
            {transcript || <span className="muted">Speak using the mic below...</span>}
          </div>
        </div>

        <div className="controls">
          <button
            className={`mic-btn ${listening ? "listening" : ""}`}
            onClick={startListening}
            aria-label="Start recording"
          >
            <img src={micro} alt="" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
