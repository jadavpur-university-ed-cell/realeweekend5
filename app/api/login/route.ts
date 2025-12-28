// app/api/login/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '../../../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. Connect to DB
    await connectDB();

    // 2. Find User (explicitly select password)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 3. Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 4. Create JWT Token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    (await cookies()).set('quiz_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 4, // 4 hours
      path: '/',
    });

    // 5. Set Cookie & Return Response
    const response = NextResponse.json(
      { message: 'Login successful' },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
