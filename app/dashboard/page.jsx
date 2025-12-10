"use client";

import React, { useState, useEffect } from "react";

export default function NoFapDashboard() {
  const [loading, setLoading] = useState(true);

  // DARK MODE
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("nf_dark") === "1";
  });

  // APPLY THEME
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

  // ============================================================
  //                  1. LOAD CHALLENGE + LEADERBOARD
  // ============================================================
  useEffect(() => {
    async function loadData() {
      // LOAD CHALLENGE
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

      // LOAD LEADERBOARD
      const lb = await fetch("/api/leaderboard", { cache: "no-store" });
      const lbData = await lb.json();

      if (lbData.success) {
        setLeaderboard(lbData.leaderboard);
      }

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

  // ============================================================
  //                         2. CHECK-IN
  // ============================================================
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

  // ============================================================
  //                        3. RELAPSE
  // ============================================================
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

  // ============================================================
  //                      4. TOGGLE TASK
  // ============================================================
  async function toggleTask(id) {
    const res = await fetch("/api/challenge/task", {
      method: "POST",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (data.success) {
      const c = data.challenge;
      setTasks(c.tasks);
    }
  }

  // ============================================================
  //                       UI COMPONENTS
  // ============================================================

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

  const StreakBlock = () => (
    <Card className="text-center">
      <div className="text-lg font-extrabold">Current Streak</div>
      <div className="text-5xl font-black tracking-tight my-3">
        {currentStreak} <span className="text-sm font-medium">hari</span>
      </div>
      <div className="flex justify-between text-sm font-semibold">
        <div>
          Longest: <span className="font-black">{longestStreak}d</span>
        </div>
        <div>
          Target: <span className="font-black">{dayTarget}d</span>
        </div>
      </div>
    </Card>
  );

  const ProgressBar = () => (
    <Card>
      <div className="font-bold mb-3">Progress</div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg h-6 border-4 border-black overflow-hidden">
        <div
          className="h-6 rounded-l-lg"
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
          <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            Tandai jika hari ini kamu clean
          </div>
        </div>
        <div className="flex flex-col items-end">
          <button
            onClick={handleCheckIn}
            className={`px-6 py-3 font-extrabold rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_#000] ${
              dailyChecked
                ? "bg-green-200 text-black"
                : "bg-[#ffdd00] text-black"
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
            className="mt-3 px-4 py-2 font-bold rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_#000] bg-[#ff3b3b] text-white"
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
              <div
                className={`font-semibold ${
                  t.done ? "line-through text-gray-500 dark:text-gray-400" : ""
                }`}
              >
                {t.title}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Habit stack untuk bantu kontrol
              </div>
            </div>

            <button
              onClick={() => toggleTask(t.id)}
              className={`px-3 py-2 rounded border-4 border-black shadow-[4px_4px_0px_0px_#000] font-bold ${
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
      <ol className="list-decimal pl-5 space-y-2 text-sm">
        {leaderboard.map((u, i) => (
          <li key={i} className="font-semibold">
            {u.name} — {u.currentStreak}d
          </li>
        ))}
      </ol>
    </Card>
  );

  const InsightsCard = () => (
    <Card>
      <div className="font-bold mb-3">Weekly Insight</div>
      <div className="text-sm dark:text-gray-300">
        Berdasarkan logmu minggu ini: urge tertinggi biasanya di malam hari.
        Rekomendasi: tambahkan ritual tidur, kurangi screen time 1 jam sebelum
        tidur.
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#0f0f0f] dark:text-white p-8 transition-all">
      <header className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#ffdd00] border-4 border-black rounded-md shadow-[6px_6px_0px_0px_#000] flex items-center justify-center font-black">
            NF
          </div>
          <div>
            <div className="text-lg font-extrabold">NoFap Challenge</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Streak-driven habit system
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* DARK MODE TOGGLE */}
          <button
            onClick={() => setDarkMode((d) => !d)}
            className="px-4 py-2 rounded border-4 border-black bg-white dark:bg-gray-300 font-bold shadow-[4px_4px_0px_0px_#000]"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>

          {/* PROFILE PAGE */}
          <button
            onClick={() => (window.location.href = "/profile")}
            className="px-4 py-2 rounded border-4 border-black shadow-[4px_4px_0px_0px_#000] font-bold bg-white dark:bg-gray-200"
          >
            Profile
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
        <div className="col-span-4 space-y-6">
          <StreakBlock />
          <ProgressBar />
          <CheckInCard />
        </div>

        <div className="col-span-5 space-y-6">
          <TasksCard />
          <InsightsCard />
        </div>

        <div className="col-span-3 space-y-6">
          <LeaderboardCard />

          <Card>
            <div className="font-bold mb-3">Quick Actions</div>
            <div className="flex flex-col gap-3">
              <button className="px-4 py-3 rounded border-4 border-black shadow-[4px_4px_0px_0px_#000] font-bold bg-[#ffdd00]">
                Start Focus Session
              </button>
              <button className="px-4 py-3 rounded border-4 border-black shadow-[4px_4px_0px_0px_#000] font-bold bg-white dark:bg-gray-200">
                Open Journal
              </button>
              <button
                className="px-4 py-3 rounded border-4 border-black shadow-[4px_4px_0px_0px_#000] font-bold bg-white dark:bg-gray-200"
                onClick={() => alert("Share to group (placeholder)")}
              >
                Share Progress
              </button>
            </div>
          </Card>

          <Card>
            <div className="font-bold mb-3">Relapse History</div>
            <div className="text-sm space-y-2 dark:text-gray-300">
              {relapseHistory.length === 0 ? (
                <div className="italic text-gray-600 dark:text-gray-400">
                  No relapse recorded
                </div>
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

      <footer className="max-w-6xl mx-auto mt-8 text-center text-xs text-gray-600 dark:text-gray-400">
        Built with neobrutalism — focus on habit, not shame.
      </footer>
    </div>
  );
}
