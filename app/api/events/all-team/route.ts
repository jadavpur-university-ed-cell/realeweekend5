import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/user';
import Team from '@/models/team';

const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
  } catch (error) {
    console.error('DB Connection Error:', error);
    throw new Error('Failed to connect to DB');
  }
};

export async function GET() {
  try {
    await connectDB();

    // 1. Fetch ALL Users
    const users = await User.find({})
      .select('name email rollNumber department eventsRegistered teamId')
      .sort({ createdAt: -1 })
      .lean();

    // 2. Fetch ALL Teams (Since all teams are for PitchGenix)
    // Removed the filter { eventName: 'PitchGenix' }
    const teams = await Team.find({}) 
      .populate('leader', 'name email rollNumber department')
      .populate('members', 'name email rollNumber department')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ 
      success: true, 
      users, 
      teams 
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
