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
  const { slug } = await params;  
  try {
    const token = (await cookies()).get("quiz_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const { answers, tabSwitches, autoSubmitted } = await req.json();

    await connectDB();

    const quiz = await Quiz.findOne({ slug: slug });
    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    // Find the open submission
    const submission = await Submission.findOne({
      userId: decoded.userId,
      quizId: quiz._id
    });

    if (!submission) return NextResponse.json({ error: "No active submission found" }, { status: 400 });
    if (submission.submittedAt) return NextResponse.json({ error: "Already submitted" }, { status: 400 });

    // Calculate Score
    let score = 0;
    quiz.questions.forEach((q: any) => {
      const userAns = answers[q._id]; // User selected option
      if (userAns && userAns === q.correctAnswer) {
        score += 1;
      }
    });

    // Update Submission
    submission.answers = answers;
    submission.score = score;
    submission.tabSwitches = tabSwitches;
    submission.submittedAt = new Date();
    submission.isFlagged = tabSwitches >= 3; // Flag if they cheated

    await submission.save();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
