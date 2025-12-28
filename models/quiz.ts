// models/Quiz.ts
import mongoose, { Schema, Document, Model } from "mongoose";

// --- 1. QUIZ MODEL ---
// Defines the questions, correct answers, and time windows.

export interface IQuestion {
  text: string;
  options: string[];
  correctAnswer: string; // Stored securely on server
  _id?: string;
}

export interface IQuiz extends Document {
  slug: string;           // e.g., "technokraft"
  title: string;          // e.g., "Technokraft Prelims"
  liveFrom: Date;         // When the portal opens (8:00 PM)
  liveUntil: Date;        // When the portal closes (9:00 PM)
  durationMinutes: number;// Exam duration (20 mins)
  questions: IQuestion[]; // Array of questions
}

const QuestionSchema = new Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true }, // Crucial: Never sent to frontend
});

const QuizSchema = new Schema<IQuiz>({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  liveFrom: { type: Date, required: true },
  liveUntil: { type: Date, required: true },
  durationMinutes: { type: Number, default: 20 },
  questions: [QuestionSchema],
});


// --- 2. SUBMISSION MODEL ---
// Tracks the user's specific attempt, answers, and anti-cheat data.

export interface ISubmission extends Document {
  userId: string;         // Reference to your User model (ID or Email)
  quizId: mongoose.Types.ObjectId;
  startedAt: Date;
  submittedAt?: Date;
  answers: Map<string, string>; // Map of QuestionID -> UserOption
  score: number;
  tabSwitches: number;
  isFlagged: boolean;     // True if cheating suspected
}

const SubmissionSchema = new Schema<ISubmission>({
  userId: { type: String, required: true }, 
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date }, // Null means currently in progress
  
  answers: { 
    type: Map, 
    of: String, // Question ID keys -> Option value
    default: {} 
  },
  
  score: { type: Number, default: 0 },
  
  // Anti-Cheat Metrics
  tabSwitches: { type: Number, default: 0 },
  isFlagged: { type: Boolean, default: false },
});

// Compound Index: Ensures a user can only have ONE submission per quizz
SubmissionSchema.index({ userId: 1, quizId: 1 }, { unique: true });


// --- EXPORTS ---
// Check if models exist to prevent overwrite errors in Next.js hot-reloading
export const Quiz: Model<IQuiz> = mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);
export const Submission: Model<ISubmission> = mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);
