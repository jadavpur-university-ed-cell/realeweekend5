import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB  from "@/lib/db";
import { Quiz, Submission } from "@/models/quiz"; 

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 1. Update the type definition for params
export async function POST(
  req: Request, 
  { params }: { params: Promise<{ slug: string }> } // Type as Promise
) {
  try {
    // 2. Await the params object BEFORE using it
    const { slug } = await params; 

    // Validate Cookie
    const token = (await cookies()).get("quiz_token")?.value; // Also await cookies()
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId; 

    await connectDB();

    // 3. Use the unwrapped 'slug' variable
    const quiz = await Quiz.findOne({ slug: slug }); 
    
    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    const now = new Date();

    if (now < quiz.liveFrom) return NextResponse.json({ error: "Portal not open yet" }, { status: 403 });
    if (now > quiz.liveUntil) return NextResponse.json({ error: "Portal closed" }, { status: 403 });

    const existing = await Submission.findOne({ userId, quizId: quiz._id });
    if (existing) return NextResponse.json({ error: "You have already attempted this quiz" }, { status: 400 });

    await Submission.create({
      userId,
      quizId: quiz._id,
      startedAt: now
    });

    const portalCloseTime = new Date(quiz.liveUntil).getTime();
    const durationTime = now.getTime() + (quiz.durationMinutes * 60 * 1000);
    const deadline = new Date(Math.min(portalCloseTime, durationTime));

    return NextResponse.json({
      questions: quiz.questions, 
      deadline: deadline.toISOString()
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
