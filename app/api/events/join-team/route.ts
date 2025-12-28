import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/user';
import Team from '@/models/team';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    await connectDB();

    // --- AUTH CHECK ---
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      userId = decoded.userId;
    } catch (e) {
      return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }
    // ------------------

    const { joinCode, eventName } = await req.json();
    
    if (!joinCode) return NextResponse.json({ error: "Team code is required" }, { status: 400 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Check if user is already in PitchGenix
    if (user.eventsRegistered.includes(eventName)) {
        return NextResponse.json({ error: "You are already registered for this event!" }, { status: 400 });
    }

    // Find the Team
    const team = await Team.findOne({ teamCode: joinCode });
    if (!team) {
        return NextResponse.json({ error: "Invalid Team Code" }, { status: 404 });
    }

    // Check Max Team Size (Optional, e.g., max 4 members)
    if (team.members.length >= 4) {
        return NextResponse.json({ error: "Team is full" }, { status: 400 });
    }

    // Update Team
    team.members.push(userId);
    await team.save();

    // Update User
    user.eventsRegistered.push(eventName);
    user.teamId = team._id;
    await user.save();

    return NextResponse.json({ message: "Joined team successfully" }, { status: 200 });

  } catch (error) {
    console.error('Join Team Error:', error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
