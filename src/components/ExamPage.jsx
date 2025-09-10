// ExamPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStars } from "../StarContext";
import "./ExamPage.css";
import micro from "../assets/micro.png";

const ExamPage = () => {
  const [finalPercentage, setFinalPercentage] = useState(null);
  const [finalStatus, setFinalStatus] = useState(null);
  const [finalDescription, setFinalDescription] = useState("");
  const [testId, setTestId] = useState(null);
  const navigate = useNavigate();
  const { addStar } = useStars();

  const [question, setQuestion] = useState(null);
  const [stage, setStage] = useState("loading");
  const [timeLeft, setTimeLeft] = useState(0);
  const [listening, setListening] = useState(false);
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState([]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // --- Savolni AI orqali ovoz chiqarib o‘qish (TTS) ---
  const speakQuestion = async (text, callback) => {
    try {
      const res = await fetch("http://localhost:5000/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.onended = () => callback?.();
      audio.onerror = () => callback?.();

      audio.play();
    } catch (err) {
      console.error("TTS error:", err);
      callback?.();
    }
  };

  // --- Audio yozishni boshlash (STT) ---
  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", blob, "answer.webm");

        try {
          const res = await fetch("http://localhost:5000/api/stt", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          setAnswer(data.text || "");
        } catch (err) {
          console.error("STT error:", err);
        }
      };

      mediaRecorderRef.current.start();
      setListening(true);
    } catch {
      alert("Mikrofonni yoqishingiz kerak!");
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && listening) {
      mediaRecorderRef.current.stop();
    }
    setListening(false);
  };

  // --- API bilan ishlash ---
  const callStartTest = async (payload = {}) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://managelc.uz:8443/api/test/startTest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      if (data?.success && data?.data?.question) {
        setQuestion(data.data);
        setStage("reading");
        setAnswer("");

        // AI savolni o‘qiydi
        speakQuestion(data.data.question, () => {
          setStage("thinking");
          setTimeLeft(data.data.timeToThink || 5);
        });
      } else if (data?.success && !data?.data?.question) {
        setStage("finished");
        setFinalPercentage(data?.data?.percentage ?? null);
        setFinalStatus(data?.data?.status ?? null);
        setFinalDescription(data?.data?.description || "");
        setResults(data?.data?.results || []);
        setTestId(data?.data?.id || null);
      }
    } catch (err) {
      console.error("Failed to call startTest:", err);
    }
  };

  useEffect(() => {
    callStartTest();
  }, []);

  const sendAnswer = async () => {
    if (!question) return;

    const payload = {
      questionId: question.id,
      answer: answer || "",
    };

    setResults((prev) => [
      ...prev,
      { questionId: question.id, answer: answer || "No answer" },
    ]);

    setAnswer("");
    await callStartTest(payload);
  };

  // vaqt hisoblash
  useEffect(() => {
    if (stage !== "thinking" && stage !== "speaking") return;
    if (!question) return;

    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [stage, question]);

  useEffect(() => {
    if (timeLeft > 0) return;

    if (stage === "thinking") {
      setStage("speaking");
      setTimeLeft(question?.timeToComplete || 30);
      startListening();
    } else if (stage === "speaking") {
      stopListening();
      sendAnswer();
    }
  }, [timeLeft, stage]);

  const progress =
    stage === "speaking" && question
      ? (timeLeft / (question.timeToComplete || 30)) * 283
      : 0;

  // ✅ PDF yuklash
  const downloadPdf = async () => {
    if (!testId) {
      alert("Test ID topilmadi!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://managelc.uz:8443/api/test/${testId}/pdf`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("PDF yuklab bo‘lmadi");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `test-result-${testId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF yuklashda xatolik:", err);
      alert("PDF yuklashda muammo bo‘ldi!");
    }
  };

  // --- RESULT UI ---
  if (stage === "finished") {
    return (
      <div className="exam-root result-page">
        <div className="result-card">
          <h2 className="result-title">🎉 Test tugadi!</h2>
          <div className="percentage-box">Overall: {finalPercentage ?? 0}%</div>
          <div className="status-row">
            <div className="status-box">{finalStatus ?? "N/A"}</div>
            <button className="btn pdf-btn" onClick={downloadPdf}>
              📄 PDF yuklab olish
            </button>
          </div>
          {finalDescription && (
            <div className="description">
              <h3>📖 Sharh</h3>
              <p>{finalDescription}</p>
            </div>
          )}
          <div className="answers">
            <h3>📋 Sizning javoblaringiz</h3>
            <ul>
              {results.map((r, i) => (
                <li key={i}>
                  <b>Q{r.questionId}:</b> {r.answer}
                </li>
              ))}
            </ul>
          </div>
          <button
            className="btn back-btn"
            onClick={() => navigate("/dashboard")}
          >
            ⬅️ Asosiy sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  // --- SAVOL UI ---
  if (!question) return <div className="exam-root">⏳ Yuklanmoqda...</div>;

  return (
    <div className="exam-root">
      <div className="exam-card">
        <div className="exam-header mb-3 flex w-full justify-between">
          <div className="w-[7.5%]"></div>
          <div className="part">
            Category: {question.categoryName} | {question.subLevelName}
          </div>
          <div className="part">#{question.id}</div>
        </div>

        <div className="question-area relative">
          {stage === "thinking" && timeLeft > 0 && (
            <div className="top-6 bg-[#e65c00] text-white px-3 rounded-xl absolute">
              {timeLeft}s
            </div>
          )}
          {question.imgUrl && (
            <img
              src={question.imgUrl}
              alt="Question visual"
              className="w-full max-w-md mx-auto mb-4 rounded-xl"
            />
          )}
          <div className="question-text">{question.question}</div>
        </div>

        <div className="transcript-area mt-4">
          <div className="transcript-label">Your answer</div>
          <input
            type="text"
            className="transcript-box"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Speak or type your answer..."
          />
        </div>

        <div className="controls mt-4">
          <button
            className={`mic-btn ${listening ? "listening" : ""}`}
            onClick={listening ? stopListening : startListening}
          >
            <svg width="90" height="90">
              <circle className="bg" cx="45" cy="45" r="40" />
              {stage === "speaking" && (
                <circle
                  className="progress"
                  cx="45"
                  cy="45"
                  r="40"
                  style={{ strokeDashoffset: 283 - progress }}
                />
              )}
            </svg>
            <img src={micro} alt="mic" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
