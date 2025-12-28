import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/user';
import Team from '@/models/team';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import crypto from 'crypto';

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

    const { teamName, eventName } = await req.json();

    if (!teamName) return NextResponse.json({ error: "Team name is required" }, { status: 400 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Check if user is already in PitchGenix
    if (user.eventsRegistered.includes(eventName)) {
        return NextResponse.json({ error: "You are already registered for this event!" }, { status: 400 });
    }

    // Generate Unique Team Code (e.g., "TEAM-AB12")
    const code = "TEAM-" + crypto.randomBytes(2).toString('hex').toUpperCase();

    // Create the Team
    const newTeam = await Team.create({
        name: teamName,
        teamCode: code,
        eventName: eventName,
        leader: userId,
        members: [userId] // Leader is automatically the first member
    });

    // Update the User
    user.eventsRegistered.push(eventName);
    user.teamId = newTeam._id; 
    await user.save();

    return NextResponse.json({ 
        message: "Team created successfully", 
        teamCode: code 
    }, { status: 200 });

  } catch (error) {
    console.error('Create Team Error:', error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
