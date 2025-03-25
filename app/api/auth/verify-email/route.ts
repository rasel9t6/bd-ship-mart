// app/api/auth/verify-email/route.ts
import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(req: Request) {
  await connectToDB();

  try {
    const { token } = await req.json();

    // Find user with matching verification token
    const user = await User.findOne({
      verificationToken: token,
      emailVerified: false,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Mark email as verified
    user.emailVerified = true;
    user.verificationToken = null;
    await user.save();

    return NextResponse.json({
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
