import React from "react";
import { useLocation, useParams } from "react-router-dom";

const ExamDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();

  return (
    <div className="max-w-xl md:mx-auto mt-10 p-6 mx-4 bg-[#FFA666] border-4 border-[#09B900] shadow-md rounded-xl">
      <h2 className="text-2xl font-bold text-center mb-6">Exam Detail</h2>

      {state ? (
        <div className="space-y-4 text-lg">
          <p>
            <span className="font-semibold">ID:</span> {id}
          </p>
          <p>
            <span className="font-semibold">Date:</span> {state.date}
          </p>
          <p>
            <span className="font-semibold">Percent:</span> {state.percentage}%
          </p>
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
