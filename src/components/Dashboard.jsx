import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toj from "../assets/toj.png";
import star from "../assets/star.png";
import logo from "../assets/image.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [level, setLevel] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // Dashboard ma'lumotlari
    fetch("http://167.86.121.42:8080/user/dashboard", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.status) {
          setLevel(data.data.status);
        }
      })
      .catch((err) => {
        console.error("Dashboard API error:", err);
      });

    // Leaderboard ma'lumotlari
    fetch("http://167.86.121.42:8080/user/leaderBoard", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setLeaderboard(data.data);

          // Eng birinchi o'rin scoreni user.score ga set qilish
          const firstPlace = data.data.find((p) => p.rank === 1);
          if (firstPlace) {
            setUser((prev) => ({ ...prev, score: firstPlace.score }));
          }
        }
      })
      .catch((err) => {
        console.error("Leaderboard API error:", err);
      });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#E6F0FA] flex justify-center py-6 px-4">
      <div className="w-full max-w-sm md:max-w-3xl lg:max-w-[75rem] space-y-4">
        {/* Score */}
        <div className="bg-white rounded-2xl shadow p-4 flex justify-between items-center">
          <div>
            <span className="text-xl md:text-2xl font-bold">
              {user?.score || 0}
            </span>
            <span className="text-yellow-500 text-2xl md:text-3xl">★</span>
          </div>
          <Link to="/account">
            <div className="border-2 border-black flex items-center justify-center rounded-full overflow-hidden">
              <img
                src={user?.photo_url || logo}
                className="w-[35px] h-[35px] object-cover"
                alt="profile"
              />
            </div>
          </Link>
        </div>

        {/* Exams history */}
        <div className="pb-2 bg-[#c0c0c0] rounded-2xl">
          <div
            onClick={() => navigate("/exams-history")}
            className="bg-orange-500 text-white rounded-2xl shadow p-4 md:col-span-2 cursor-pointer hover:opacity-90"
          >
            <h2 className="text-lg md:text-xl font-semibold">Exams history</h2>
            <p className="text-sm md:text-base opacity-90">
              View and analyze exam history!
            </p>
          </div>
        </div>

        {/* Level and Avg score */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
          <div className="pb-2 bg-[#c0c0c0] rounded-2xl">
            <div
              onClick={() => navigate("/level")}
              className="bg-white rounded-2xl shadow p-4 text-center cursor-pointer hover:bg-gray-50"
            >
              <p className="text-2xl font-bold">{level || "..."}</p>
              <p className="text-gray-500 text-sm">Your level</p>
            </div>
          </div>
          <div className="pb-2 bg-[#c0c0c0] rounded-2xl">
            <div
              onClick={() => navigate("/average-score")}
              className="bg-white rounded-2xl shadow p-4 text-center cursor-pointer hover:bg-gray-50"
            >
              <p className="text-2xl font-bold">{user?.score || 0}</p>
              <p className="text-gray-500 text-sm">Avg score</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="pb-2 bg-[#c0c0c0] rounded-2xl">
            <button
              onClick={() => navigate("/explanation")}
              className="bg-[#09B900] w-full text-white rounded-2xl shadow p-4 text-center font-medium hover:bg-green-600 transition"
            >
              Take exam <br />
              <span className="text-sm opacity-90">Test your knowledge</span>
            </button>
          </div>
          <div className="pb-2 bg-[#c0c0c0] rounded-2xl">
            <button
              onClick={() => navigate("/donation")}
              className="bg-[#B90000] w-full text-white rounded-2xl shadow p-4 text-center font-semibold hover:bg-red-700 transition"
            >
              Donation <br />
              <span className="text-sm opacity-80">Support the team</span>
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="gradient w-full rounded-xl p-3 border border-black">
          <h2 className="text-[20px] font-bold text-center mb-4">
            Leaderboard
          </h2>
          <div className="relative rounded-xl px-[0.5px] py-[1px]">
            <div className="absolute -top-8 -left-6">
              <img src={toj} alt="toj" className="w-[50px]" />
            </div>
            {leaderboard.length > 0 ? (
              leaderboard.map((player) => {
                let rankColor = "bg-blue-400"; // default
                if (player.rank === 1) rankColor = "bg-yellow-400";
                else if (player.rank === 2) rankColor = "bg-gray-400";
                else if (player.rank === 3) rankColor = "bg-orange-400";

                return (
                  <div
                    key={player.id}
                    className="flex items-center justify-between rounded-xl p-3 bg-[#ffffffbb] mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`rounded-full w-[30px] h-[30px] flex items-center justify-center font-bold text-white ${rankColor}`}
                      >
                        <p>{player.rank}</p>
                      </div>
                      <p>{player.fullName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <h2>{player.score}</h2>
                      <img src={star} className="w-[20px]" alt="star" />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 py-4">No data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
