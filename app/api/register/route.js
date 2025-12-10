import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/mongo";

export async function POST(req) {
  await connectDB();
  const { name, email, password } = await req.json();

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json(
      { error: "Email sudah digunakan" },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed,
  });

  return NextResponse.json({ success: true, user });
}
