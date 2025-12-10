import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import User from "@/models/User";
import Challenge from "@/models/Challenge";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(req) {
  await connectDB();

  const userId = getUserIdFromRequest(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await User.findById(userId).select("-password").lean();
  const challenge = await Challenge.findOne({ userId }).lean();

  return NextResponse.json({ success: true, profile: { user, challenge } });
}
