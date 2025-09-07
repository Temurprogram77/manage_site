import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStars } from "../StarContext";
import "./ExamPage.css";
import micro from "../assets/micro.png";
import download from "../assets/download.png";

const ExamPage = () => {
  const [finalResult, setFinalResult] = useState(0);
  const [finalLevel, setFinalLevel] = useState(null);
  const navigate = useNavigate();
  const { addStar } = useStars();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [question, setQuestion] = useState(null);
  const [stage, setStage] = useState("loading");
  const [timeLeft, setTimeLeft] = useState(0);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [results, setResults] = useState([]);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

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
      if (stage === "speaking") sendAnswer();
    };

    recognitionRef.current = recog;
  }, [stage]);

  const loadQuestions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://167.86.121.42:8080/question?page=0&size=10",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (data?.data?.body?.length > 0) {
        setQuestions(data.data.body);
        setQuestion(data.data.body[0]);
        setStage("thinking");
        setTimeLeft(15);
        speakText(data.data.body[0].question);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const finishExam = async () => {
    setStage("finished");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://167.86.121.42:8080/api/test/finish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && data.percentage !== undefined) {
        setFinalResult(data.percentage);
      }
      if (results.length > 0) {
        setFinalLevel(results[results.length - 1].level || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const evaluateLevel = async (answer) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://167.86.121.42:8080/api/test/evaluateLevel",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: answer }),
        }
      );
      const data = await res.json();
      return data.level;
    } catch {
      return null;
    }
  };

  const sendAnswer = async () => {
    if (!question) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://167.86.121.42:8080/api/test/startTest?questionId=${
          question.id
        }&answer=${encodeURIComponent(transcript || "")}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      const level = await evaluateLevel(transcript);
      setResults((prev) => [
        ...prev,
        {
          questionId: question.id,
          answer: transcript || null,
          correct: data.correct ?? null,
          level: level ?? "N/A",
        },
      ]);
    } catch (err) {
      console.error(err);
    }
    setTranscript("");
    const nextIndex = currentIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
      const nextQ = questions[nextIndex];
      setQuestion(nextQ);
      setStage("thinking");
      setTimeLeft(15);
      speakText(nextQ.question);
    } else {
      finishExam();
    }
  };

  useEffect(() => {
    if (stage === "loading" || stage === "finished" || !question) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, question]);

  useEffect(() => {
    if (timeLeft > 0) return;
    if (stage === "thinking") {
      startSpeaking();
    } else if (stage === "speaking") {
      stopSpeaking();
    }
  }, [timeLeft, stage]);

  const startSpeaking = async () => {
    if (!recognitionRef.current) return;
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setStage("speaking");
      setTimeLeft(30);
      recognitionRef.current.start();
      setListening(true);
    } catch {
      alert("Mikrofonni yoqishingiz kerak!");
    }
  };

  const stopSpeaking = () => {
    if (recognitionRef.current && listening) recognitionRef.current.stop();
    setListening(false);
    sendAnswer();
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

  const progress = stage === "speaking" ? (timeLeft / 30) * 283 : 0;

  if (stage === "finished")
    return (
      <div className="exam-root flex flex-col gap-4 max-w-[350px] mx-auto">
        <h2 className="exam-title text-[30px] font-bold text-center mb-8 leading-7">
          Result for test number: 1234
        </h2>
        <div className="bg-[#C0C0C0] w-full pb-2 rounded-xl">
          <div className="bg-[#FF6A00] w-full h-full px-7 pb-2 pt-3 rounded-xl flex items-center justify-between text-white font-bold">
            <p className="text-[25px]">Overal: </p>
            <h2 className="text-[45px]">52</h2>
          </div>
        </div>
        <div className="flex justify-between w-full">
          <div className="bg-[#C0C0C0] pb-2 rounded-xl">
            <div className="bg-[#FFE100] h-full px-7 pb-2 pt-3 text-[45px] rounded-xl flex items-center text-white font-bold">
              B2
            </div>
          </div>
          <div className="bg-[#C0C0C0] pb-2 rounded-xl">
            <div className="bg-[#00B3FF] px-7 pb-2 pt-3 text-[22px] rounded-xl flex flex-col items-center text-white font-bold">
              <img src={download} alt="download" className="w-[40px]" />
              <p>Download</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full">
          {results.map((res, idx) => (
            <div
              key={res.questionId}
              className="bg-[#ffffffcc] w-full p-3 rounded-xl shadow flex flex-col gap-2"
            >
              <p className="font-bold">
                {idx + 1}. Question ID: {res.questionId}
              </p>
              <p>
                <span className="font-semibold">Your answer:</span>{" "}
                {res.answer || "No answer"}
              </p>
              <p>
                <span className="font-semibold">Correct:</span>{" "}
                {res.correct === null ? "N/A" : res.correct ? "✅" : "❌"}
              </p>
              <p>
                <span className="font-semibold">Level:</span> {res.level}
              </p>
            </div>
          ))}
        </div>
      </div>
    );

  if (!question) return <div className="exam-root">⏳ Loading question...</div>;

  return (
    <div className="exam-root">
      <div className="exam-card">
        <div className="exam-header mb-3 flex w-full justify-between">
          <div className="w-[5%]"></div>
          <div className="part">
            Category: {question.categoryName} | Page: {currentIndex + 1}
          </div>
          <div className="part">1.1</div>
        </div>

        <div className="question-area relative">
          <div className="top-6 bg-[#e65c00] w-fit flex justify-center text-white px-3 rounded-xl absolute">
            <div className="w-fit">
              {stage === "thinking" && timeLeft > 0 ? `${timeLeft}s` : "Start talking."}
            </div>
          </div>
          <div className="question-text">{question.question}</div>
        </div>

        <div className="transcript-area">
          <div className="transcript-label">Your answer</div>
          <div className="transcript-box">
            {transcript || (
              <span className="muted">Speak using the mic...</span>
            )}
          </div>
        </div>

        <div className="controls">
          <button
            className={`mic-btn ${listening ? "listening" : ""}`}
            disabled
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

        <div className="phase-info">
          {stage === "thinking" && <p>🤔 Thinking time...</p>}
          {stage === "speaking" && <p>🎤 Speak now...</p>}
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
