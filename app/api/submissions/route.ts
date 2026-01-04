// app/api/dashboard-data/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import { Quiz, Submission } from "@/models/quiz";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("quiz_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded: any = jwt.verify(token, JWT_SECRET);
        await connectDB();

        // 1. Get Quizzes
        const quizzes = await Quiz.find({}).lean();

        // 2. Get Submissions for this user
        const submissions = await Submission.find({ userId: decoded.userId })
            .select("-answers -__v")
            .lean();

        // 3. Create Map: { "quizId": "SUBMITTED" }
        // const submissionMap: Record<string, string> = {};
        // submissions.forEach((sub: any) => {
        //     submissionMap[sub.quizId.toString()] = sub.status;
        // });

        return NextResponse.json({
            quizzes,
            // submissionMap,
            submissions
        });
    } catch (e) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
