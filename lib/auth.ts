import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Define the shape of your JWT payload
interface UserPayload {
  userId: string;
  role: string;
  email: string;
}

export async function getUser(): Promise<UserPayload | null> {
  // 1. Get the cookie store (Server-side only)
  const cookieStore = await cookies();
  
  // 2. Retrieve the token by name
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    // 3. Verify the token using your secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    
    // 4. Return the decoded payload
    return decoded as UserPayload;
  } catch (error) {
    // If token is invalid or expired
    return null;
  }
}
