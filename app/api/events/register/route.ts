// app/api/events/register/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/user';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    // 1. Get Event Name from body
    const { eventName } = await req.json();

    // 2. Authenticate User via Cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    // 3. Update Database
    await connectDB();
    
    // Check if already registered to avoid duplicates
    const user = await User.findById(decoded.userId);
    if (user.eventsRegistered.includes(eventName)) {
        return NextResponse.json({ message: 'Already registered' }, { status: 200 });
    }

    // Push new event
    user.eventsRegistered.push(eventName);
    await user.save();

    return NextResponse.json({ message: 'Successfully registered!' }, { status: 200 });

  } catch (error) {
    console.error('Event Reg Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
