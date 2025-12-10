import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import Challenge from "@/models/Challenge";
import User from "@/models/User";

export async function GET(req) {
  await connectDB();

  // top by currentStreak desc, limit 20
  const top = await Challenge.find({})
    .sort({ currentStreak: -1, longestStreak: -1 })
    .limit(20)
    .lean();

  // populate usernames (fast approach: batch fetch)
  const userIds = top.map((t) => t.userId);
  const users = await User.find({ _id: { $in: userIds } })
    .select("name email")
    .lean();
  const userMap = {};
  users.forEach((u) => (userMap[u._id] = u));

  const payload = top.map((t) => ({
    userId: t.userId,
    name: (userMap[t.userId] && userMap[t.userId].name) || "Anonymous",
    currentStreak: t.currentStreak,
    longestStreak: t.longestStreak,
  }));

  return NextResponse.json({ success: true, leaderboard: payload });
}
