import { NextResponse } from "next/server";
import connectDB  from "@/lib/db";
import { Quiz } from "@/models/quiz"; // Adjust the import path if your models are elsewhere

export async function GET() {
  try {
    await connectDB();

    // Fetch all quizzes
    // .select("-questions") EXCLUDES the questions field (and answers)
    // .select("-__v") EXCLUDES the internal version key
    // .sort({ liveFrom: 1 }) sorts them by start time (Earliest first)
    const exams = await Quiz.find({})
      .select("-questions -__v") 
      .sort({ liveFrom: 1 });

    return NextResponse.json(exams);

  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
