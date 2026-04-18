import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "@/models/user";
import { connectDB } from "@/lib/db";

export async function POST(req: Request) {
  await connectDB();

  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 400 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return NextResponse.json({ error: "Wrong password" }, { status: 400 });
  }

  const token = jwt.sign(
    { id: user._id, name: user.name },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

  return NextResponse.json({ token, user });
}




