// src/components/ExamPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStars } from "../StarContext";
import "./ExamPage.css";
import micro from "../assets/micro.png";

const ExamPage = () => {
  const navigate = useNavigate();
  const { addStar } = useStars();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [question, setQuestion] = useState(null);

  const [stage, setStage] = useState("loading"); // "loading" | "thinking" | "waiting" | "speaking" | "finished"
  const [timeLeft, setTimeLeft] = useState(0);

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [results, setResults] = useState([]);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // ✅ SpeechRecognition init
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("❌ Sizning brauzeringiz ovozdan matnga o‘tkazishni qo‘llab-quvvatlamaydi");
      return;
    }
    const recog = new SpeechRecognition();
    recog.lang = "en-US";
    recog.interimResults = false;
    recog.continuous = false;

    recog.onresult = (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ")
        .trim();
      setTranscript(text);
    };
    recog.onerror = () => setListening(false);
    recog.onend = () => {
      setListening(false);
      if (stage === "speaking") {
        sendAnswer();
      }
    };

    recognitionRef.current = recog;
  }, [stage]);

  // ✅ Savollarni API'dan olib kelish
  const loadQuestions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ Token topilmadi, avval login qiling!");
        return;
      }

      const res = await fetch("http://167.86.121.42:8080/question?page=0&size=10", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`❌ Savol olishda xato: ${res.status}`);

      const data = await res.json();
      console.log("✅ Questions API:", data);

      if (data?.data?.body?.length > 0) {
        setQuestions(data.data.body);
        setQuestion(data.data.body[0]);
        setStage("thinking");
        setTimeLeft(5); // 5 soniya thinking
        speakText(data.data.body[0].question);
      }
    } catch (err) {
      console.error("❌ Savol olishda xato:", err);
    }
  };

  // ✅ Javobni yuborish
  const sendAnswer = async () => {
    if (!question) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://167.86.121.42:8080/api/test/startTest?questionId=${question.id}&answer=${encodeURIComponent(transcript || "")}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      console.log("✅ Answer response:", data);
    } catch (err) {
      console.error("❌ Javob yuborishda xato:", err);
    }

    setResults((prev) => [...prev, { questionId: question.id, answer: transcript || null }]);
    setTranscript("");

    const nextIndex = currentIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
      const nextQ = questions[nextIndex];
      setQuestion(nextQ);
      setStage("thinking");
      setTimeLeft(5);
      speakText(nextQ.question);
    } else {
      setStage("finished");
    }
  };

  // ✅ Timer boshqaruvi
  useEffect(() => {
    if (!question || stage === "loading" || stage === "finished") return;

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [stage, question]);

  // ✅ Timer tugaganda stage o‘zgartirish
  useEffect(() => {
    if (!question || stage === "loading" || stage === "finished") return;

    if (timeLeft <= 0) {
      if (stage === "thinking") {
        setStage("waiting");
        setTimeLeft(0);
      } else if (stage === "speaking") {
        stopListening(); // mikrofonni o‘chirish
      }
    }
  }, [timeLeft, stage, question]);

  // ✅ Mikrofon boshqaruvi
  const startListening = async () => {
    if (!recognitionRef.current || stage !== "waiting") return;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setStage("speaking");
      setTimeLeft(30);

      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);

      recognitionRef.current.start();
      setListening(true);
    } catch (err) {
      console.error("❌ Mikrofon ruxsat berilmadi:", err);
      alert("Mikrofonni yoqishingiz kerak!");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && listening) recognitionRef.current.stop();
    setListening(false);
  };

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  if (stage === "finished") {
    return (
      <div className="exam-root">
        <h2 className="exam-title">Exam finished 🎉</h2>
        <p>✅ Siz {results.length} ta savolga javob berdingiz.</p>
        <button className="btn primary mt-6" onClick={() => navigate("/dashboard")}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (!question) return <div className="exam-root">⏳ Loading question...</div>;

  return (
    <div className="exam-root">
      <div className="exam-card">
        <div className="exam-header">
          <div className="part">Category ID: {question.categoryId}</div>
          <div className="progress">Question ID: {question.id}</div>
          <div className="timer">⏳ {timeLeft > 0 ? `${timeLeft}s` : ""}</div>
        </div>

        <div className="question-area">
          <div className="question-text">{question.question}</div>
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
            disabled={stage !== "waiting"}
            onClick={startListening}
            aria-label="Start recording"
          >
            <img src={micro} alt="" />
          </button>
        </div>

        <div className="phase-info">
          {stage === "thinking" && <p>🤔 Thinking time...</p>}
          {stage === "waiting" && <p>⏳ Press mic to start speaking</p>}
          {stage === "speaking" && <p>🎤 Speak now...</p>}
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
