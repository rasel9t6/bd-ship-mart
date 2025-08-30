import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import User from '@/models/User';
import { authOptions } from '@/lib/authOption';
import { connectToDB } from '@/lib/dbConnect';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    console.log('Debug endpoint - Session user:', session.user);

    // Try to find user by different methods
    const userById = await User.findById(session.user.id);
    const userByEmail = await User.findOne({ email: session.user.email });
    const userByUserId = session.user.userId
      ? await User.findOne({ userId: session.user.userId })
      : null;

    console.log('Debug endpoint - User lookup results:', {
      byId: userById ? 'Found' : 'Not found',
      byEmail: userByEmail ? 'Found' : 'Not found',
      byUserId: userByUserId ? 'Found' : 'Not found',
    });

    // Return the first user found
    const user = userById || userByEmail || userByUserId;

    if (!user) {
      return NextResponse.json(
        {
          error: 'User not found by any method',
          session: session.user,
          lookupAttempts: {
            byId: session.user.id,
            byEmail: session.user.email,
            byUserId: session.user.userId,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User found',
      user: {
        _id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        customerType: user.customerType,
        role: user.role,
      },
      session: session.user,
      lookupMethod: userById ? 'byId' : userByEmail ? 'byEmail' : 'byUserId',
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { error: 'Debug endpoint failed', details: error.message },
      { status: 500 }
    );
  }
}
