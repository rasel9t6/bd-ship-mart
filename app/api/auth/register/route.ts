// app/api/auth/register/route.ts
import { NextResponse } from "next/server";

import User from "@/models/User";
import { hashPassword, generateVerificationToken } from "@/lib/password-utils";
import { sendVerificationEmail } from "@/lib/email-service";
import { connectToDB } from "@/lib/dbConnect";

export async function POST(req: Request) {
  await connectToDB();

  try {
    const userData = await req.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create new user
    const newUser = new User({
      ...userData,
      password: hashedPassword,
      verificationToken,
      emailVerified: false,
    });

    await newUser.save();

    // Send verification email
    await sendVerificationEmail(newUser.email, verificationToken);

    return NextResponse.json({
      message: "User registered successfully",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
