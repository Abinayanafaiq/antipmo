import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import Challenge from "@/models/Challenge";
import { getUserIdFromRequest } from "@/lib/auth";
import {
  toJakartaDateString,
  isSameJakartaDay,
  isYesterdayJakarta,
  toJakartaDateIso,
} from "@/lib/date";

export async function GET(req) {
  await connectDB();

  const userId = getUserIdFromRequest(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let challenge = await Challenge.findOne({ userId });

  if (!challenge) {
    challenge = await Challenge.create({
      userId,
      currentStreak: 0,
      longestStreak: 0,
      dayTarget: 30,
      lastCheckIn: null,
      dailyChecked: false,
      relapseHistory: [],
      tasks: [
        { id: 1, title: "Journaling - 5 menit", done: false },
        { id: 2, title: "Cold shower - 1 menit", done: false },
        { id: 3, title: "Workout 15 menit", done: false },
      ],
    });
  } else {
    // Sync dailyChecked: jika lastCheckIn adalah hari ini (Jakarta), dailyChecked true; else false
    const last = challenge.lastCheckIn;
    const isToday = last ? isSameJakartaDay(last, toJakartaDateIso()) : false;
    if (isToday && !challenge.dailyChecked) {
      challenge.dailyChecked = true;
      await challenge.save();
    } else if (!isToday && challenge.dailyChecked) {
      challenge.dailyChecked = false;
      await challenge.save();
    }
  }

  // Return challenge
  return NextResponse.json({ success: true, challenge });
}
