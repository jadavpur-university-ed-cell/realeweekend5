import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/user'; // Ensure casing matches your file!
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create the new user
    const newUser = await User.create({
      name,
      email,
      rollNumber,
      department,
      password: hashedPassword,
    });

    // --- AUTO-LOGIN LOGIC STARTS HERE ---

    // 5. Generate JWT Token
    const token = jwt.sign(
      { 
        userId: newUser._id, 
        role: newUser.role, 
        email: newUser.email 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    // 6. Create Response with Cookie
    const response = NextResponse.json(
      { message: 'User registered and logged in successfully.' },
      { status: 201 }
    );

    // Set the cookie so the browser considers them logged in immediately
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;
    // --- AUTO-LOGIN LOGIC ENDS HERE ---

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
