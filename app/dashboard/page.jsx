"use client";

import React, { useState, useEffect } from "react";

export default function NoFapDashboard() {
  const [loading, setLoading] = useState(true);

  // ============================================================
  //                     DARK MODE SAFE VERSION
  // ============================================================
  const [darkMode, setDarkMode] = useState(false);
  const [ready, setReady] = useState(false);

  // load theme safely AFTER hydration
  useEffect(() => {
    const saved = localStorage.getItem("nf_dark");
    if (saved === "1") setDarkMode(true);
    setReady(true); // hydration finished
  }, []);

  // apply theme
  useEffect(() => {
    if (!ready) return;
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("nf_dark", "1");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.removeItem("nf_dark");
    }
  }, [darkMode, ready]);

  // ============================================================
  //                      STATE DATA USER
  // ============================================================
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [dayTarget, setDayTarget] = useState(30);
  const [dailyChecked, setDailyChecked] = useState(false);
  const [relapseHistory, setRelapseHistory] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // ============================================================
  //                      LOAD INITIAL DATA
  // ============================================================
  useEffect(() => {
    async function loadData() {
      try {
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
      } catch (err) {
        console.log("LOAD ERROR:", err);
      }

      setLoading(false);
    }

    loadData();
  }, []);

  // Loading UI
  if (!ready || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-bold">
        Loading...
      </div>
    );
  }

  // ============================================================
  //                       API ACTIONS
  // ============================================================
  async function handleCheckIn() {
    if (dailyChecked) return;

    const res = await fetch("/api/challenge/checkin", { method: "POST" });
    const data = await res.json();

    if (data.success) {
      const c = data.challenge;
      setCurrentStreak(c.currentStreak);
      setLongestStreak(c.longestStreak);
      setDailyChecked(true);
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
      setCurrentStreak(0);
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

  // ============================================================
  //                       UI COMPONENTS
  // ============================================================
  const Card = ({ children, className = "" }) => (
    <div
      className={`bg-white dark:bg-[#1c1c1c] border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_#000] ${className}`}
    >
      {children}
    </div>
  );

  const progressPercent = Math.min(
    100,
    Math.round((currentStreak / dayTarget) * 100)
  );

  // ======================= INSIGHTS CARD ========================
  const InsightsCard = () => (
    <Card>
      <div className="font-bold mb-3">Weekly Insight</div>
      <div className="text-sm opacity-80">
        Berdasarkan logmu minggu ini: urge tertinggi biasanya di malam hari.
        Rekomendasi: tambah ritual tidur & kurangi screen time malam.
      </div>
    </Card>
  );

  // ======================= MOBILE NAV ===========================
  const MobileNav = () => (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1c1c1c] border-t-4 border-black shadow-[0_-6px_0_0_#000] py-3 flex justify-around text-sm font-bold z-50">
      <button onClick={() => window.scrollTo(0, 0)}>Home</button>
      <button onClick={() => (window.location.href = "/profile")}>
        Profile
      </button>
      <button onClick={() => setDarkMode((d) => !d)}>
        {darkMode ? "Light" : "Dark"}
      </button>
    </div>
  );

  // ============================================================
  //                   FINAL RESPONSIVE DASHBOARD
  // ============================================================
  return (
    <div className="min-h-screen pb-20 p-4 md:p-8 bg-[#f5f5f5] dark:bg-[#0f0f0f] dark:text-white">
      {/* HEADER */}
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

      {/* GRID SYSTEM FULL RESPONSIVE */}
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
          <Card>
            <div className="text-lg font-extrabold">Current Streak</div>
            <div className="text-5xl font-black my-3">{currentStreak}d</div>
            <div className="flex justify-between text-sm">
              <div>Longest: {longestStreak}d</div>
              <div>Target: {dayTarget}d</div>
            </div>
          </Card>

          <Card>
            <div className="font-bold mb-3">Progress</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-6 border-4 border-black rounded overflow-hidden">
              <div
                className="h-full"
                style={{
                  width: `${progressPercent}%`,
                  background: "linear-gradient(90deg,#ffdd00,#ffb347)",
                }}
              />
            </div>
            <div className="mt-2 text-sm">
              {progressPercent}% of {dayTarget} days
            </div>
          </Card>

          <Card>
            <div className="font-bold mb-3">Daily Check-In</div>
            <button
              onClick={handleCheckIn}
              className={`px-6 py-3 border-4 border-black rounded shadow-[4px_4px_0px_0px_#000] font-bold w-full ${
                dailyChecked ? "bg-green-200" : "bg-[#ffdd00]"
              }`}
            >
              {dailyChecked ? "Checked" : "Check In"}
            </button>

            <button
              onClick={() =>
                handleRelapse(prompt("Kenapa relapse?") || "Tidak diisi")
              }
              className="mt-3 px-4 py-2 bg-[#ff3b3b] border-4 border-black rounded shadow-[4px_4px_0px_0px_#000] text-white font-bold w-full"
            >
              Report Relapse
            </button>
          </Card>
        </div>

        {/* MIDDLE */}
        <div className="col-span-1 md:col-span-3 lg:col-span-5 space-y-6">
          <Card>
            <div className="font-bold mb-3">Daily Tasks</div>
            {tasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between my-2"
              >
                <div className={t.done ? "line-through opacity-60" : ""}>
                  {t.title}
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
          </Card>

          <InsightsCard />
        </div>

        {/* RIGHT */}
        <div className="col-span-1 md:col-span-6 lg:col-span-3 space-y-6">
          <Card>
            <div className="font-bold mb-3">Leaderboard</div>
            <ol className="list-decimal pl-5">
              {leaderboard.map((u, i) => (
                <li key={i} className="font-semibold">
                  {u.name} — {u.currentStreak}d
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <div className="font-bold mb-3">Relapse History</div>

            {relapseHistory.length === 0 ? (
              <div className="italic opacity-60">No relapse recorded</div>
            ) : (
              relapseHistory.map((r, i) => (
                <div key={i} className="text-xs my-1">
                  {new Date(r.date).toLocaleString()}: {r.reason}
                </div>
              ))
            )}
          </Card>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
