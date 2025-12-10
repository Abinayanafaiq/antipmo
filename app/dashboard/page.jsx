"use client";

import React, { useState, useEffect } from "react";

export default function NoFapDashboard() {
  const [loading, setLoading] = useState(true);

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("nf_dark") === "1";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("nf_dark", "1");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.removeItem("nf_dark");
    }
  }, [darkMode]);

  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [dayTarget, setDayTarget] = useState(30);
  const [dailyChecked, setDailyChecked] = useState(false);
  const [relapseHistory, setRelapseHistory] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    async function loadData() {
      const res = await fetch("/api/challenge", { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        const c = data.challenge;
        setCurrentStreak(c.currentStreak);
        setLongestStreak(c.longestStreak);
        setDayTarget(c.dayTarget);
        setDailyChecked(c.dailyChecked);
        setRelapseHistory(c.relapseHistory);
        setTasks(c.tasks);
      }

      const lb = await fetch("/api/leaderboard", { cache: "no-store" });
      const lbData = await lb.json();
      if (lbData.success) setLeaderboard(lbData.leaderboard);

      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-bold">
        Loading...
      </div>
    );
  }

  async function handleCheckIn() {
    if (dailyChecked) return;

    const res = await fetch("/api/challenge/checkin", { method: "POST" });
    const data = await res.json();

    if (data.success) {
      const c = data.challenge;
      setCurrentStreak(c.currentStreak);
      setLongestStreak(c.longestStreak);
      setDailyChecked(c.dailyChecked);
    }
  }

  async function handleRelapse(reason = "Tidak diisi") {
    const res = await fetch("/api/challenge/relapse", {
      method: "POST",
      body: JSON.stringify({ reason }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (data.success) {
      const c = data.challenge;
      setCurrentStreak(c.currentStreak);
      setRelapseHistory(c.relapseHistory);
      setDailyChecked(false);
    }
  }

  async function toggleTask(id) {
    const res = await fetch("/api/challenge/task", {
      method: "POST",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (data.success) setTasks(data.challenge.tasks);
  }

  const Card = ({ children, className = "" }) => (
    <div
      className={`bg-white dark:bg-[#1c1c1c] dark:text-white border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_#000] ${className}`}
    >
      {children}
    </div>
  );

  const progressPercent = Math.min(
    100,
    Math.round((currentStreak / dayTarget) * 100)
  );

  const MobileNav = () => (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1c1c1c] border-t-4 border-black shadow-[0px_-6px_0px_0px_#000] py-3 flex justify-around text-sm font-bold z-50">
      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        Home
      </button>
      <button onClick={() => (window.location.href = "/profile")}>
        Profile
      </button>
      <button onClick={() => setDarkMode((d) => !d)}>
        {darkMode ? "Light" : "Dark"}
      </button>
    </div>
  );

  const StreakBlock = () => (
    <Card className="text-center">
      <div className="text-lg font-extrabold">Current Streak</div>
      <div className="text-5xl font-black my-3">
        {currentStreak} <span className="text-sm">hari</span>
      </div>
      <div className="flex justify-between text-sm font-semibold">
        <div>Longest: {longestStreak}d</div>
        <div>Target: {dayTarget}d</div>
      </div>
    </Card>
  );

  const ProgressBar = () => (
    <Card>
      <div className="font-bold mb-3">Progress</div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg h-6 border-4 border-black overflow-hidden">
        <div
          className="h-6"
          style={{
            width: `${progressPercent}%`,
            background: "linear-gradient(90deg,#ffdd00,#ffb347)",
          }}
        />
      </div>
      <div className="mt-2 text-sm font-semibold">
        {progressPercent}% of {dayTarget} days
      </div>
    </Card>
  );

  const CheckInCard = () => (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-bold">Daily Check-In</div>
          <div className="text-sm mt-1 dark:text-gray-300">
            Tandai jika hari ini kamu clean
          </div>
        </div>
        <div className="flex flex-col items-end">
          <button
            onClick={handleCheckIn}
            className={`px-6 py-3 font-extrabold border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_#000] ${
              dailyChecked ? "bg-green-200" : "bg-[#ffdd00]"
            }`}
          >
            {dailyChecked ? "Checked" : "Check In"}
          </button>
          <button
            onClick={() =>
              handleRelapse(
                prompt("Kenapa relapse? (opsional)") || "Tidak diisi"
              )
            }
            className="mt-3 px-4 py-2 bg-[#ff3b3b] border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_#000] text-white font-bold"
          >
            Report Relapse
          </button>
        </div>
      </div>
    </Card>
  );

  const TasksCard = () => (
    <Card>
      <div className="font-bold mb-3">Daily Tasks</div>
      <div className="space-y-3">
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center justify-between">
            <div>
              <div className={t.done ? "line-through opacity-60" : ""}>
                {t.title}
              </div>
              <div className="text-xs opacity-60">
                Habit stack untuk membantu kontrol
              </div>
            </div>
            <button
              onClick={() => toggleTask(t.id)}
              className={`px-3 py-2 border-4 border-black rounded shadow-[4px_4px_0px_0px_#000] ${
                t.done ? "bg-green-200" : "bg-white dark:bg-gray-200"
              }`}
            >
              {t.done ? "Done" : "Mark"}
            </button>
          </div>
        ))}
      </div>
    </Card>
  );

  const LeaderboardCard = () => (
    <Card>
      <div className="font-bold mb-3">Leaderboard</div>
      <ol className="pl-5 list-decimal space-y-2 text-sm">
        {leaderboard.map((u, i) => (
          <li key={i} className="font-semibold">
            {u.name} — {u.currentStreak}d
          </li>
        ))}
      </ol>
    </Card>
  );

  return (
    <div className="min-h-screen pb-20 bg-[#f5f5f5] dark:bg-[#0f0f0f] dark:text-white p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-8 flex items-center justify-between sticky top-0 bg-[#f5f5f5] dark:bg-[#0f0f0f] py-4 z-40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#ffdd00] border-4 border-black rounded-md shadow-[6px_6px_0px_0px_#000] flex items-center justify-center font-black">
            NF
          </div>
          <div>
            <div className="font-extrabold text-base md:text-lg">
              NoFap Challenge
            </div>
            <div className="text-xs md:text-sm opacity-70">
              Streak-driven habit system
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <button
            onClick={() => setDarkMode((d) => !d)}
            className="px-4 py-2 border-4 border-black bg-white dark:bg-gray-300 rounded shadow-[4px_4px_0px_0px_#000] font-bold"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={() => (window.location.href = "/profile")}
            className="px-4 py-2 border-4 border-black bg-white dark:bg-gray-200 rounded shadow-[4px_4px_0px_0px_#000] font-bold"
          >
            Profile
          </button>
        </div>
      </header>

      {/* RESPONSIVE GRID */}
      <main
        className="
          max-w-6xl mx-auto
          grid 
          grid-cols-1 
          md:grid-cols-6 
          lg:grid-cols-12 
          gap-6
        "
      >
        <div className="col-span-1 md:col-span-3 lg:col-span-4 space-y-6">
          <StreakBlock />
          <ProgressBar />
          <CheckInCard />
        </div>

        <div className="col-span-1 md:col-span-3 lg:col-span-5 space-y-6">
          <TasksCard />
          <InsightsCard />
        </div>

        <div className="col-span-1 md:col-span-6 lg:col-span-3 space-y-6">
          <LeaderboardCard />

          <Card>
            <div className="font-bold mb-3">Quick Actions</div>
            <div className="flex flex-col gap-3">
              <button className="px-4 py-3 border-4 border-black rounded shadow-[4px_4px_0px_0px_#000] font-bold bg-[#ffdd00]">
                Start Focus Session
              </button>
              <button className="px-4 py-3 border-4 border-black rounded shadow-[4px_4px_0px_0px_#000] font-bold bg-white dark:bg-gray-200">
                Open Journal
              </button>
              <button
                className="px-4 py-3 border-4 border-black rounded shadow-[4px_4px_0px_0px_#000] font-bold bg-white dark:bg-gray-200"
                onClick={() => alert("Share to group (placeholder)")}
              >
                Share Progress
              </button>
            </div>
          </Card>

          <Card>
            <div className="font-bold mb-3">Relapse History</div>
            <div className="text-sm space-y-2">
              {relapseHistory.length === 0 ? (
                <div className="italic opacity-60">No relapse recorded</div>
              ) : (
                relapseHistory.map((r, i) => (
                  <div key={i} className="text-xs">
                    {new Date(r.date).toLocaleString()}: {r.reason}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </main>

      {/* MOBILE NAVIGATION */}
      <MobileNav />
    </div>
  );
}
