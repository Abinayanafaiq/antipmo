import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import Challenge from "@/models/Challenge";
import { getUserIdFromRequest } from "@/lib/auth";
import {
  toJakartaDateIso,
  isSameJakartaDay,
  isYesterdayJakarta,
} from "@/lib/date";

export async function POST(req) {
  await connectDB();

  const userId = getUserIdFromRequest(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const challenge = await Challenge.findOne({ userId });
  if (!challenge)
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  const nowIso = toJakartaDateIso();

  // if already checked today → ignore
  if (
    challenge.lastCheckIn &&
    isSameJakartaDay(challenge.lastCheckIn, nowIso)
  ) {
    // ensure dailyChecked true
    challenge.dailyChecked = true;
    await challenge.save();
    return NextResponse.json({ success: true, challenge });
  }

  // If lastCheckIn was yesterday (consecutive), increment streak, else reset to 1
  if (challenge.lastCheckIn && isYesterdayJakarta(challenge.lastCheckIn)) {
    challenge.currentStreak = (challenge.currentStreak || 0) + 1;
  } else {
    // not consecutive — start from 1
    challenge.currentStreak = 1;
  }

  // update longest
  if (
    !challenge.longestStreak ||
    challenge.currentStreak > challenge.longestStreak
  ) {
    challenge.longestStreak = challenge.currentStreak;
  }

  // set lastCheckIn and dailyChecked
  challenge.lastCheckIn = nowIso;
  challenge.dailyChecked = true;

  await challenge.save();

  return NextResponse.json({ success: true, challenge });
}
