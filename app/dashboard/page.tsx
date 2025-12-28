import { getUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/user';
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
  // Check if role is 'admin' (ensure your DB schema has this field)
  if (currentUser.role === 'admin') {

    // FETCH ALL DATA for Admin View
    // We lean uses .lean() to get plain JS objects which are better for passing to client components
    const allUsers = await User.find({}).sort({ createdAt: -1 }).lean();

    // Convert _id to string to avoid serialization warnings
    const serializedUsers = allUsers.map((u: any) => ({
      ...u,
      _id: u._id.toString(),
      // Ensure arrays exist even if empty
      eventsRegistered: u.eventsRegistered || []
    }));

    return <AdminDashboard allUsers={serializedUsers} />;
  }

  // 5. Default: Render User Dashboard
  return <UserDashboard userData={currentUser} />;

}
