"use client";

import { useEffect, useState } from "react";

export default function LeaderboardPage() {
  const [list, setList] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      if (data.success) setList(data.leaderboard);
    }
    load();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
      <ol className="pl-6 list-decimal">
        {list.map((r, i) => (
          <li key={i} className="mb-2 font-semibold">
            {r.name} — {r.currentStreak}d (best {r.longestStreak}d)
          </li>
        ))}
      </ol>
    </div>
  );
}
