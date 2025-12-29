import { getUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/user';
import Team from '@/models/team'; // 1. Import Team Model
import { redirect } from 'next/navigation';
import UserDashboard from '@/components/dashboard/userDashboard';
import AdminDashboard from '@/components/dashboard/adminDashboard';

export default async function DashboardPage() {
  // 1. Check if user is logged in via cookie
  const userPayload = await getUser();

  if (!userPayload) {
    redirect('/login');
  }

  // 2. Connect DB
  await connectDB();

  // 3. Fetch the current logged-in user to check role
  const currentUser = await User.findById(userPayload.userId);

  if (!currentUser) {
    redirect('/login');
  }

  // 4. Role-based Rendering
  if (currentUser.role === 'admin') {

    // --- FETCH USERS ---
    const allUsers = await User.find({}).sort({ createdAt: -1 }).lean();

    const serializedUsers = allUsers.map((u: any) => ({
      ...u,
      _id: u._id.toString(),
      // Handle potential date objects if they exist
      createdAt: u.createdAt?.toString(),
      updatedAt: u.updatedAt?.toString(),
      eventsRegistered: u.eventsRegistered || []
    }));

    // --- FETCH TEAMS (Added) ---
    // Fetch all teams (since they are all PitchGenix) and populate details
    const allTeams = await Team.find({})
      .populate('leader', 'name email rollNumber department')
      .populate('members', 'name email rollNumber department')
      .sort({ createdAt: -1 })
      .lean();

    // Serialize Teams to avoid "Plain Object" warnings in Next.js
    const serializedTeams = allTeams.map((t: any) => ({
      ...t,
      _id: t._id.toString(),
      createdAt: t.createdAt?.toString(),
      updatedAt: t.updatedAt?.toString(),
      // Serialize Leader ID if it exists
      leader: t.leader ? { ...t.leader, _id: t.leader._id.toString() } : null,
      // Serialize Member IDs
      members: t.members?.map((m: any) => ({ ...m, _id: m._id.toString() })) || []
    }));

    // Pass both users and teams to the dashboard
    return <AdminDashboard allUsers={serializedUsers} allTeams={serializedTeams} />;
  }

  // 5. Default: Render User Dashboard
  return <UserDashboard userData={currentUser} />;
}
