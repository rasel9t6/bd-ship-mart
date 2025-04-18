import { connectToDB } from '@/lib/dbConnect';
import User from '@/models/User';
import { UserType } from '@/types/next-utils';

import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async () => {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectToDB();

    const user = await User.findOne({ email: session.user.email }).select(
      '+userId'
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('[users_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectToDB();

    const updateData = await req.json();
    const allowedFields = ['name', 'phone', 'image', 'address'];

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: session.user.email });
    if (existingUser) {
      return NextResponse.json(
        {
          error: 'Account already exists',
          redirect: '/auth/reset-password',
        },
        { status: 409 }
      );
    }

    // Validate update data
    const updates: Partial<UserType> = {};

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        if (key === 'address') {
          const addressFields: (keyof NonNullable<UserType['address']>)[] = [
            'street',
            'city',
            'state',
            'zipCode',
            'country',
          ];

          if (!updates.address) {
            updates.address = {};
          }

          addressFields.forEach((field) => {
            const addressValue = updateData.address?.[field];
            if (addressValue !== undefined) {
              (updates.address as NonNullable<UserType['address']>)[field] =
                addressValue;
            }
          });
        } else {
          updates[key as keyof UserType] = updateData[key];
        }
      }
    });

    // Add updatedAt timestamp
    updates.updatedAt = new Date();

    // Find and update user
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    ).select('+userId');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('[users_POST]', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid data provided', details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};
