import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import { Quiz, Submission } from "@/models/quiz";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Validate Cookie
    const token = (await cookies()).get("quiz_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    await connectDB();

    const quiz = await Quiz.findOne({ slug: slug });
    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    const now = new Date();

    if (now < quiz.liveFrom) return NextResponse.json({ error: "Portal not open yet" }, { status: 403 });
    if (now > quiz.liveUntil) return NextResponse.json({ error: "Portal closed" }, { status: 403 });

    // 1. Check if submission exists normally first
    let submission = await Submission.findOne({ userId, quizId: quiz._id });

    // 2. Logic to calculate deadline (Reused in both create and resume cases)
    const portalCloseTime = new Date(quiz.liveUntil).getTime();
    // Use submission start time if resuming, otherwise use now
    const baseTime = submission ? new Date(submission.startedAt).getTime() : now.getTime(); 
    const durationTime = baseTime + (quiz.durationMinutes * 60 * 1000);
    const deadline = new Date(Math.min(portalCloseTime, durationTime));

    // 3. If it exists, handle Resume vs Block
    if (submission) {
      if ((submission as any).status === "SUBMITTED") {
        return NextResponse.json({ error: "You have already attempted this quiz" }, { status: 400 });
      }
      // If active, just return success (Resume functionality)
      return NextResponse.json({
        questions: quiz.questions,
        deadline: deadline.toISOString(),
        resumed: true
      });
    }

    // 4. Try to create (Handle Race Condition)
    try {
      await Submission.create({
        userId,
        quizId: quiz._id,
        startedAt: now,
      });
    } catch (error: any) {
      // If the error is a Duplicate Key Error (Code 11000), it means a parallel request 
      // just created the submission milliseconds ago. We treat this as a success.
      if (error.code === 11000) {
        // Fetch the one that beat us to the database
        const racingSubmission = await Submission.findOne({ userId, quizId: quiz._id });
        if (racingSubmission) {
             // Return the same payload as if we just created it
             return NextResponse.json({
                questions: quiz.questions,
                deadline: deadline.toISOString(),
                resumed: true
            });
        }
      }
      // If it's a real error, rethrow it
      throw error;
    }

    return NextResponse.json({
      questions: quiz.questions,
      deadline: deadline.toISOString()
    });

  } catch (error) {
    console.error("Start API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
