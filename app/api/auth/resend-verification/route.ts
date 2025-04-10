// app/api/auth/resend-verification/route.ts
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/dbConnect";
import User from "@/models/User";
import { generateVerificationToken } from "@/lib/password-utils";
import { sendVerificationEmail } from "@/lib/email-service";

export async function POST(req: Request) {
  await connectToDB();

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 },
      );
    }

    // If already verified, no need to send verification
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email is already verified" },
        { status: 200 },
      );
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();

    // Update user with new token
    user.verificationToken = verificationToken;
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    return NextResponse.json({
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 },
    );
  }
}
