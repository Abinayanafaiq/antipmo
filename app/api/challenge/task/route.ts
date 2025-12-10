import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import Challenge from "@/models/Challenge";
import { getUserIdFromRequest } from "@/lib/auth";

export async function POST(req) {
  await connectDB();

  const userId = getUserIdFromRequest(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const challenge = await Challenge.findOne({ userId });

  if (!challenge)
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  // toggle
  challenge.tasks = challenge.tasks.map((t) => {
    if (t.id === id) return { ...t.toObject(), done: !t.done };
    return t;
  });

  await challenge.save();

  return NextResponse.json({ success: true, challenge });
}
