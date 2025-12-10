import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import Challenge from "@/models/Challenge";
import { getUserIdFromRequest } from "@/lib/auth";

export async function POST(req) {
  await connectDB();

  const userId = getUserIdFromRequest(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reason } = await req.json();
  const challenge = await Challenge.findOne({ userId });

  if (!challenge)
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  challenge.relapseHistory.push({
    date: new Date().toISOString(),
    reason: reason || "Tidak diisi",
  });

  // reset streak but keep lastCheckIn as-is (optionally null)
  challenge.currentStreak = 0;
  challenge.dailyChecked = false;
  challenge.lastCheckIn = null;

  await challenge.save();

  return NextResponse.json({ success: true, challenge });
}
