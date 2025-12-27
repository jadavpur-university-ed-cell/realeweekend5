import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '../../../models/user';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, rollNumber, department, password } = await req.json();

    // 1. Connect to DB
    await connectDB();

    // 2. Check if user already exists
    const existingUser = await User.findOne({ 
        $or: [{ email }, { rollNumber }] 
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this Email or Roll Number already exists.' },
        { status: 400 }
      );
    }

    // 3. Hash the password (Security First)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create the new user
    // Note: We don't pass 'role' or 'eventsRegistered' here, 
    // so they will use their default values ('user' and [])
    await User.create({
      name,
      email,
      rollNumber,
      department,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: 'User registered successfully.' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
