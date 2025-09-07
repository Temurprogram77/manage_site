import React from "react";
import { useLocation, useParams } from "react-router-dom";

const ExamDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-bold text-center mb-4">Exam Detail</h2>

      {state ? (
        <div className="space-y-3 text-lg">
          <p>
            <span className="font-semibold">ID:</span> {id}
          </p>
          <p>
            <span className="font-semibold">Sana:</span> {state.date}
          </p>
          <p>
            <span className="font-semibold">Foiz:</span> {state.percentage}%
          </p>
        </div>
      ) : (
        <p className="text-gray-500 text-center">Ma'lumot topilmadi</p>
      )}
    </div>
  );
};

export default ExamDetail;
