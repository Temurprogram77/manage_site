import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import download from "../assets/download.png";

const ExamDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const [examData, setExamData] = useState(state?.examData || null);

  useEffect(() => {
    if (examData) return; // Agar navigate orqali kelsa, API chaqirilmaydi

    const fetchExamDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`https://managelc.uz:8443/api/test/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("API xatosi");
        const data = await res.json();
        setExamData(data.data);
      } catch (err) {
        console.error("Exam detail error:", err);
      }
    };

    fetchExamDetail();
  }, [id, examData]);

  const downloadPDF = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://managelc.uz:8443/api/test/${id}/pdf`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("PDF yuklab bo‘lmadi");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `test_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("PDF yuklab bo‘lmadi");
    }
  };

  if (!examData) {
    return (
      <p className="text-center text-gray-600 mt-8">
        ⏳ Ma’lumot yuklanmoqda...
      </p>
    );
  }

  return (
    <div className="max-w-xl md:mx-auto mt-10 p-6 mx-4 rounded-xl">
      <div className="exam-root flex flex-col gap-4 max-w-[350px] mx-auto">
        <h2 className="exam-title text-[30px] font-bold text-center mb-8 leading-7">
          Result for test number: {id}
        </h2>

        <div className="bg-[#C0C0C0] w-full pb-2 rounded-xl">
          <div className="bg-[#FF6A00] w-full h-full px-7 pb-2 pt-3 rounded-xl flex items-center justify-between text-white font-bold">
            <p className="text-[25px]">Overall:</p>
            <h2 className="text-[45px]">{examData.percentage}%</h2>
          </div>
        </div>

        <div className="flex justify-between gap-2 w-full">
          <div className="bg-[#C0C0C0] pb-2 rounded-xl">
            <div className="bg-[#FFE100] h-full px-7 pb-2 pt-3 sm:text-[45px] text-[38px] rounded-xl flex items-center text-white font-bold">
              {examData.status}
            </div>
          </div>
          <div className="bg-[#C0C0C0] pb-2 rounded-xl">
            <div
              onClick={downloadPDF}
              className="bg-[#00B3FF] px-7 pb-2 pt-3 sm:text-[22px] text-[18px] rounded-xl flex flex-col items-center text-white font-bold cursor-pointer hover:opacity-90 transition-all"
            >
              <img src={download} alt="download" className="w-[40px]" />
              <p>Download</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full mt-3 bg-[#ffffffcc] p-4 rounded-xl shadow">
          <p>
            <span className="font-semibold">Total questions:</span>{" "}
            {examData.totalQuestions}
          </p>
          <p>
            <span className="font-semibold">Correct answers:</span>{" "}
            {examData.correctAnswers}
          </p>
          <p className="whitespace-pre-line">
            <span className="font-semibold">Description:</span>{" "}
            {examData.description}
          </p>
          <p className="text-gray-500 text-sm">Date: {examData.localDate}</p>
        </div>
      </div>
    </div>
  );
};

export default ExamDetail;
