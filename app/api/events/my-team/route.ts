import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/user';
import Team from '@/models/team';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    await connectDB();

    // 1. Auth Check
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      userId = decoded.userId;
    } catch (e) {
      return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }

    // 2. Find the Team where this user is a member
    // We search the Team collection directly for a team that has this userId in its 'members' array
    const team = await Team.findOne({ members: userId }).lean();

    if (!team) {
      // It's okay if they have no team, just return null
      return NextResponse.json({ team: null }, { status: 200 });
    }

    // 3. Fetch Member Details manually
    // We have the member IDs from the team object, so let's get their names
    const members = await User.find({ 
        _id: { $in: team.members } 
    }).select('name email rollNumber').lean();

    // 4. Combine and Return
    const fullTeamData = {
        name: team.name,
        teamCode: team.teamCode,
        members: members
    };

    return NextResponse.json({ team: fullTeamData }, { status: 200 });

  } catch (error) {
    console.error('Fetch My Team Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
