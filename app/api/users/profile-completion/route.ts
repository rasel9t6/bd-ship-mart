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

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Try to find user by different ID formats
    let user = null;

    console.log('Profile completion check - userId from params:', userId);
    console.log('Profile completion check - session user:', {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    });

    // First try by MongoDB _id
    if (userId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Trying to find user by MongoDB _id:', userId);
      user = await User.findById(userId);
      console.log('Found by _id:', user ? 'Yes' : 'No');
    }

    // If not found by _id, try by custom userId
    if (!user) {
      console.log('Trying to find user by custom userId:', userId);
      user = await User.findOne({ userId });
      console.log('Found by custom userId:', user ? 'Yes' : 'No');
    }

    // If still not found, try by email from session
    if (!user && session.user.email) {
      console.log('Trying to find user by email:', session.user.email);
      user = await User.findOne({ email: session.user.email });
      console.log('Found by email:', user ? 'Yes' : 'No');
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if profile is complete

    const missingFields = [];

    if (!user.name) missingFields.push('name');
    if (!user.email) missingFields.push('email');
    if (!user.phone) missingFields.push('phone');

    if (!user.address) {
      missingFields.push('address');
    } else {
      if (!user.address.street) missingFields.push('street');
      if (!user.address.city) missingFields.push('city');
      if (!user.address.state) missingFields.push('state');
      if (!user.address.zipCode) missingFields.push('zipCode');
      if (!user.address.country) missingFields.push('country');
    }

    const isComplete = missingFields.length === 0;

    console.log('Profile completion result:', {
      isComplete,
      missingFields,
      userFields: {
        name: !!user.name,
        email: !!user.email,
        phone: !!user.phone,
        address: !!user.address,
        addressFields: user.address
          ? {
              street: !!user.address.street,
              city: !!user.address.city,
              state: !!user.address.state,
              zipCode: !!user.address.zipCode,
              country: !!user.address.country,
            }
          : 'No address object',
      },
    });

    return NextResponse.json({
      isComplete,
      missingFields,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        customerType: user.customerType,
      },
      message: isComplete
        ? 'Profile is complete'
        : `Profile is incomplete. Missing: ${missingFields.join(', ')}`,
    });
  } catch (error) {
    console.error('Error checking profile completion:', error);
    return NextResponse.json(
      { error: 'Failed to check profile completion' },
      { status: 500 }
    );
  }
}
