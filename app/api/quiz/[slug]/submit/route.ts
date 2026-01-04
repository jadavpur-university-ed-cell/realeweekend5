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

    const submission = await Submission.findOne({
      userId: decoded.userId,
      quizId: quiz._id
    });

    if (!submission) return NextResponse.json({ error: "No active submission found" }, { status: 400 });
    if (submission.submittedAt) return NextResponse.json({ error: "Already submitted" }, { status: 400 });

    // --- SCORING LOGIC FIX ---
    let score = 0;
    
    // Debug: See what is coming in
    console.log("Incoming Answers:", answers); 

    quiz.questions.forEach((q: any) => {
      // 1. CRITICAL: Convert ObjectId to String for lookup
      const questionId = q._id.toString(); 
      
      // 2. Lookup user answer safely
      const userAns = answers[questionId]; 
      
      // 3. Trim whitespace just in case (optional but recommended)
      const cleanUserAns = userAns ? userAns.trim() : null;
      const cleanCorrectAns = q.correctAnswer ? q.correctAnswer.trim() : null;

      // Debug: Log comparisons to server console to verify match
      console.log(`QID: ${questionId} | User: ${cleanUserAns} | Correct: ${cleanCorrectAns} | Match: ${cleanUserAns === cleanCorrectAns}`);

      if (cleanUserAns && cleanUserAns === cleanCorrectAns) {
        score += 1;
      }
    });

    console.log(`Final Score Calculated: ${score}/${quiz.questions.length}`);

    // Update Submission
    submission.answers = answers;
    submission.score = score; // This should now save correctly
    submission.tabSwitches = tabSwitches;
    submission.submittedAt = new Date();
    submission.isFlagged = tabSwitches >= 3;

    await submission.save();

    return NextResponse.json({ success: true, score }); // Return score to frontend for verification

  } catch (error) {
    console.error("Submit Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
