import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ExamHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("userData");

    // Foydalanuvchi login qilmagan bo'lsa login sahifaga yo'naltirish
    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    // Serverga tokenni tekshirish
    const fetchHistory = async () => {
      try {
        const res = await fetch("http://167.86.121.42:8080/api/test", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
          setHistory(data.data);
        } else {
          setHistory([]);
        }
      } catch (err) {
        console.error("API error:", err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const handleClick = (item) => {
    navigate(`/exam/${item.id}`, { state: item });
  };

  return (
    <div className="lg:max-w-[75rem] md:mx-auto mx-4">
      <h2 className="md:text-[32px] sm:text-[30px] text-[28px] md:font-semibold font-bold my-4 text-center">
        Exams history
      </h2>

      {loading ? (
        <p className="text-center text-gray-500">Yuklanmoqda...</p>
      ) : history.length === 0 ? (
        <p className="text-center text-gray-500">Hozircha test ishlanmagan</p>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => handleClick(item)}
              className="bg-[#BFBFBF] pb-2 rounded-xl cursor-pointer hover:shadow-lg transition"
            >
              <div className="bg-[#FFA666] rounded-xl py-3 px-6 text-white font-semibold flex justify-between items-center">
                <p>{item.date}</p>
                <div className="bg-[#09B900] px-4 py-0.5 rounded-2xl">
                  {item.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamHistory;
