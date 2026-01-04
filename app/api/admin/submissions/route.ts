// app/api/admin/submissions/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
// Adjust these imports to where your models are actually defined
import { Quiz, Submission } from "@/models/quiz"; 
import User from "@/models/user";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// -- Type Definitions for DB Results --
interface IDBUser {
    _id: any;
    name: string;
    email: string;
    rollNumber: string;
    department: string;
}

interface IDBQuiz {
    _id: any;
    title: string;
    slug: string;
}

interface IDBSubmission {
    _id: any;
    userId: string; // Stored as string in your schema
    quizId: any;    // ObjectId
    score: number;
    startedAt: Date;
    submittedAt?: Date;
    tabSwitches: number;
    isFlagged: boolean;
}

export async function GET() {
    try {
        // 1. Auth Check
        const cookieStore = await cookies();
        const token = cookieStore.get("quiz_token")?.value;
        
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify Token
        jwt.verify(token, JWT_SECRET);
        // Optional: Add logic here to check if decoded.role === 'admin'

        await connectDB();

        // 2. Fetch All Data needed (Parallel for performance)
        const [rawSubmissions, rawUsers, rawQuizzes] = await Promise.all([
            Submission.find({}).lean<IDBSubmission[]>(),
            User.find({}).select("name email rollNumber department").lean<IDBUser[]>(),
            Quiz.find({}).select("title slug").lean<IDBQuiz[]>()
        ]);

        // 3. Create Lookup Maps for O(1) access
        // Map: UserID String -> User Object
        const userMap = new Map<string, IDBUser>();
        rawUsers.forEach(u => userMap.set(u._id.toString(), u));

        // Map: QuizID String -> Quiz Object
        const quizMap = new Map<string, IDBQuiz>();
        rawQuizzes.forEach(q => quizMap.set(q._id.toString(), q));

        // 4. Transform Submissions into Dashboard Format
        const enrichedSubmissions = rawSubmissions.map((sub) => {
            const user = userMap.get(sub.userId.toString());
            const quiz = quizMap.get(sub.quizId.toString());

            // Calculate Time Taken in Seconds
            let timeTaken = 0;
            if (sub.startedAt && sub.submittedAt) {
                const start = new Date(sub.startedAt).getTime();
                const end = new Date(sub.submittedAt).getTime();
                timeTaken = (end - start) / 1000;
            }

            return {
                _id: sub._id.toString(),
                user: {
                    name: user?.name || "Unknown User",
                    email: user?.email || "N/A",
                    rollNumber: user?.rollNumber || "N/A",
                    department: user?.department || "N/A"
                },
                quizTitle: quiz?.title || "Unknown Quiz",
                score: sub.score || 0,
                timeTaken: timeTaken, // In Seconds
                tabSwitches: sub.tabSwitches || 0,
                isFlagged: sub.isFlagged || false,
                submittedAt: sub.submittedAt ? sub.submittedAt.toISOString() : null,
                startedAt: sub.startedAt ? sub.startedAt.toISOString() : null
            };
        });

        // 5. Return Clean JSON
        return NextResponse.json({ submissions: enrichedSubmissions });

    } catch (e: any) {
        console.error("Admin API Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
