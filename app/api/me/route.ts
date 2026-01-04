import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/user'; // Ensure correct casing (User vs user)
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    // 1. Get Cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    // 3. Connect & Fetch User
    await connectDB();
    
    // We explicitly exclude the password field for security
    const user = await User.findById(decoded.userId).select('-password');
    // console.log(user);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 4. Return User Data
    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    console.error('Fetch Me Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
