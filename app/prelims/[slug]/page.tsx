"use client";
import { useEffect, useState, useCallback, use } from "react"; // Import 'use'
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

type Question = {
  _id: string;
  text: string;
  options: string[];
};

// Update prop type to Promise
export default function QuizRunner({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  
  // Unwrap params using React.use()
  const { slug } = use(params);

  const [status, setStatus] = useState<"LOADING" | "ACTIVE" | "SUBMITTED" | "ERROR">("LOADING");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [timeLeft, setTimeLeft] = useState(0); // Seconds
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [tabSwitches, setTabSwitches] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. Initialize Quiz
  useEffect(() => {
    const startQuiz = async () => {
      try {
        // Use unwrapped 'slug' here
        const res = await fetch(`/api/quiz/${slug}/start`, { method: "POST" });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to start");

        setQuestions(data.questions);
        
        // Calculate Time
        const deadline = new Date(data.deadline).getTime();
        const secondsRemaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
        setTimeLeft(secondsRemaining);
        
        setStatus("ACTIVE");

        // Force Fullscreen
        try {
            await document.documentElement.requestFullscreen();
        } catch (e) {
            console.log("Fullscreen blocked");
        }
      } catch (e: any) {
        setStatus("ERROR");
        setErrorMsg(e.message);
      }
    };
    
    // Ensure slug is available before fetching
    if (slug) {
        startQuiz();
    }
  }, [slug]);

  // 2. Timer Hook
  useEffect(() => {
    if (status !== "ACTIVE") return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  // 3. Anti-Cheat Hook
  useEffect(() => {
    if (status !== "ACTIVE") return;

    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            alert("Maximum tab switches exceeded. Submitting test.");
            handleSubmit(true);
          } else {
            alert(`WARNING: Don't switch tabs! (${newCount}/3 warnings)`);
          }
          return newCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [status]);

  // 4. Submit Logic
  const handleSubmit = useCallback(async (auto = false) => {
    setStatus("SUBMITTED");
    if (document.fullscreenElement) document.exitFullscreen();

    try {
      // Use unwrapped 'slug' here
      await fetch(`/api/quiz/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, tabSwitches, autoSubmitted: auto }),
      });
      // Redirect after 3s
      setTimeout(() => router.push("/prelims/dashboard"), 3000);
    } catch (e) {
      console.error("Submit failed", e);
    }
  }, [answers, tabSwitches, slug, router]);

  // Helper: Format Time
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === "LOADING") return (
    <div className="h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
      <p>Secure Exam Environment Loading...</p>
    </div>
  );

  if (status === "ERROR") return (
    <div className="h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
      <AlertCircle className="text-red-500 w-12 h-12" />
      <h2 className="text-xl font-bold">Access Denied</h2>
      <p className="text-gray-400">{errorMsg}</p>
      <button onClick={() => router.push("/prelims/dashboard")} className="mt-4 bg-white/10 px-6 py-2 rounded">Back to Dashboard</button>
    </div>
  );

  if (status === "SUBMITTED") return (
    <div className="h-screen bg-black text-white flex flex-col items-center justify-center gap-4 animate-in fade-in">
        <CheckCircle2 className="text-green-500 w-16 h-16" />
        <h1 className="text-3xl font-bold">Test Submitted!</h1>
        <p className="text-gray-400">Your responses have been recorded successfully.</p>
        <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-none" onContextMenu={(e) => e.preventDefault()}>
      
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-25 bg-gray-900 border-b border-white/10 flex items-center justify-between px-6 z-50">
        <div className="font-bold text-lg tracking-wide text-gray-200">{slug.toUpperCase()} PRELIMS</div>
        <div className={`font-mono text-xl font-bold px-4 py-1 rounded border ${timeLeft < 300 ? 'bg-red-900/20 border-red-500 text-red-500 animate-pulse' : 'bg-black border-blue-500 text-blue-400'}`}>
           {formatTime(timeLeft)}
        </div>
      </div>

      {/* Questions Container */}
      <div className="max-w-3xl mx-auto pt-28 pb-32 px-6">
        {questions.map((q, idx) => (
            <div key={q._id} className="mb-12">
                <h3 className="text-lg md:text-xl font-medium mb-4 leading-relaxed">
                    <span className="text-blue-500 font-bold mr-2">{idx + 1}.</span>
                    {q.text}
                </h3>
                <div className="grid gap-3 pl-0 md:pl-8">
                    {q.options.map((option) => (
                        <label 
                            key={option} 
                            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 group
                                ${answers[q._id] === option 
                                    ? "bg-blue-600/20 border-blue-500" 
                                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                }
                            `}
                        >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                                ${answers[q._id] === option ? "border-blue-400" : "border-gray-500 group-hover:border-gray-400"}
                            `}>
                                {answers[q._id] === option && <div className="w-2.5 h-2.5 bg-blue-400 rounded-full" />}
                            </div>
                            <input 
                                type="radio" 
                                name={q._id} 
                                className="hidden" 
                                onChange={() => setAnswers(prev => ({ ...prev, [q._id]: option }))}
                            />
                            <span className={answers[q._id] === option ? "text-white" : "text-gray-300"}>
                                {option}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        ))}
      </div>

      {/* Footer Submit */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur border-t border-white/10 flex justify-end px-6 md:px-20 z-50">
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-400 hidden md:block">
                {Object.keys(answers).length} of {questions.length} questions answered
            </span>
            <button 
                onClick={() => { if(confirm("Are you sure you want to finish the test?")) handleSubmit(); }}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 px-8 rounded-lg shadow-lg transition-transform active:scale-95"
            >
                Submit Test
            </button>
          </div>
      </div>
    </div>
  );
}
