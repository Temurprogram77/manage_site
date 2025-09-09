import React, { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import download from "../assets/download.png";

const ExamDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const [finalLevel, setFinalLevel] = useState(null);
  const [results, setResults] = useState([]);

  const downloadPDF = async () => {
    try {
      const token = localStorage.getItem("token");

      if (results.length === 0) return alert("No results to download!");

      for (let res of results) {
        const resId = res.questionId;
        const response = await fetch(
          `http://167.86.121.42:8080/api/test/${resId}/pdf`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok)
          throw new Error(`Failed to download PDF for test ${resId}`);

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `test_${resId}.pdf`; // fayl nomi
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url); // URLni ozod qilish
      }

      alert("All PDFs downloaded!");
    } catch (err) {
      console.error(err);
      alert("Failed to download PDFs");
    }
  };

  return (
    <div className="max-w-xl md:mx-auto mt-10 p-6 mx-4 rounded-xl">

      {state ? (
        <div className="exam-root flex flex-col gap-4 max-w-[350px] mx-auto">
          <h2 className="exam-title text-[30px] font-bold text-center mb-8 leading-7">
            Result for test number:{" "}
            {results.length > 0
              ? results[results.length - 1].questionId
              : "N/A"}
          </h2>

          <div className="bg-[#C0C0C0] w-full pb-2 rounded-xl">
            <div className="bg-[#FF6A00] w-full h-full px-7 pb-2 pt-3 rounded-xl flex items-center justify-between text-white font-bold">
              <p className="text-[25px]">Overal: </p>
              <h2 className="text-[45px]">52</h2>
            </div>
          </div>
          <div className="flex justify-between gap-2 w-full">
            <div className="bg-[#C0C0C0] pb-2 rounded-xl">
              <div className="bg-[#FFE100] h-full px-7 pb-2 pt-3 sm:text-[45px] text-[38px] rounded-xl flex items-center text-white font-bold">
                {finalLevel || "N/A"}
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
          <div className="flex flex-col gap-3 w-full">
            {results.map((res, idx) => (
              <div
                key={res.questionId + idx}
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
                  <span className="font-semibold">Level:</span> {res.level}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-700 text-center text-lg mt-4">
          Ma'lumot topilmadi
        </p>
      )}
    </div>
  );
};

export default ExamDetail;
