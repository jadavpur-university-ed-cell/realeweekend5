"use client";
import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";

type Question = {
  _id: string;
  text: string;
  options: string[];
  image?: string;
};

export default function QuizRunner({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);

  const [status, setStatus] = useState<"LOADING" | "ACTIVE" | "SUBMITTED" | "ERROR">("LOADING");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [tabSwitches, setTabSwitches] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  // NEW: Track which question is visible
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // 1. Initialize Quiz
  useEffect(() => {
    const startQuiz = async () => {
      try {
        const res = await fetch(`/api/quiz/${slug}/start`, { method: "POST" });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to start");

        setQuestions(data.questions);

        const deadline = new Date(data.deadline).getTime();
        const secondsRemaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
        setTimeLeft(secondsRemaining);

        setStatus("ACTIVE");

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

    if (slug) startQuiz();
  }, [slug]);

  // 2. Timer Hook (Unchanged)
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

  // 3. Anti-Cheat Hook (Unchanged)
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
      await fetch(`/api/quiz/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, tabSwitches, autoSubmitted: auto }),
      });
      setTimeout(() => router.push("/prelims/dashboard"), 3000);
    } catch (e) {
      console.error("Submit failed", e);
    }
  }, [answers, tabSwitches, slug, router]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to change questions
  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(prev => prev - 1);
    }
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

  const currentQ = questions[currentQIndex];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-none flex flex-col" onContextMenu={(e) => e.preventDefault()}>

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-25 bg-gray-900 border-b border-white/10 flex items-center justify-between px-6 z-500">
        <div className="font-bold text-lg tracking-wide text-gray-200">{slug.toUpperCase()} PRELIMS</div>
        <div className={`font-mono text-xl font-bold px-4 py-1 rounded border ${timeLeft < 300 ? 'bg-red-900/20 border-red-500 text-red-500 animate-pulse' : 'bg-black border-blue-500 text-blue-400'}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="flex-1 pt-24 pb-24 px-4 md:px-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Col: Question Area (Takes up 8/12 cols) */}
        <div className="lg:col-span-9">
          {currentQ && (
            <div className="bg-gray-900/30 border border-white/5 p-6 md:p-8 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
              {currentQ.image && (
                <div className="my-4">
                  <img src={currentQ.image} alt="Question Chart" className=" rounded-lg border border-white/10" />
                </div>
              )}
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl md:text-2xl font-medium leading-relaxed whitespace-pre-wrap">
                  <span className="text-blue-500 font-bold mr-3">Q{currentQIndex + 1}.</span>
                  {currentQ.text}
                </h3>
              </div>

              <div className="grid gap-3 pl-0 md:pl-2">
                {currentQ.options.map((option) => (
                  <label
                    key={option}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 group
                                    ${answers[currentQ._id] === option
                        ? "bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }
                                `}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                                    ${answers[currentQ._id] === option ? "border-blue-400" : "border-gray-500 group-hover:border-gray-400"}
                                `}>
                      {answers[currentQ._id] === option && <div className="w-2.5 h-2.5 bg-blue-400 rounded-full" />}
                    </div>
                    <input
                      type="radio"
                      name={currentQ._id}
                      className="hidden"
                      onChange={() => setAnswers(prev => ({ ...prev, [currentQ._id]: option }))}
                      checked={answers[currentQ._id] === option}
                    />
                    <span className={answers[currentQ._id] === option ? "text-white font-medium" : "text-gray-300"}>
                      {option}
                    </span>
                  </label>
                ))}
              </div>

              {/* Navigation Buttons inside the card */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={handlePrev}
                  disabled={currentQIndex === 0}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} /> Previous
                </button>

                {currentQIndex === questions.length - 1 ? (
                  <button
                    onClick={() => { if (confirm("Submit now?")) handleSubmit(); }}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-8 rounded-lg shadow-lg transition-transform active:scale-95"
                  >
                    Submit Test
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
                  >
                    Next <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Question Palette (Takes up 3/12 cols) */}
        <div className="lg:col-span-3">
          <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-4 sticky top-24">
            <div className="flex items-center gap-2 mb-4 text-gray-300">
              <LayoutGrid size={18} />
              <span className="font-medium">Question Palette</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q._id];
                const isCurrent = idx === currentQIndex;

                return (
                  <button
                    key={q._id}
                    onClick={() => setCurrentQIndex(idx)}
                    className={`
                                    h-10 w-full rounded-md text-sm font-bold transition-all duration-200 flex items-center justify-center
                                    ${isCurrent
                        ? "bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-black"
                        : isAnswered
                          ? "bg-green-900/40 text-green-400 border border-green-800 hover:bg-green-900/60"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700 border border-white/5"
                      }
                                `}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 space-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded"></div> Current
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-900/40 border border-green-800 rounded"></div> Answered
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-800 border border-white/5 rounded"></div> Not Visited
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile Footer Status (Only shows on mobile where sidebar might be too long) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-black/90 backdrop-blur border-t border-white/10 flex justify-between items-center z-50">
        <span className="text-sm text-gray-400">
          {Object.keys(answers).length}/{questions.length} Answered
        </span>
        <button
          onClick={() => setTabSwitches(prev => prev)} // Dummy op or open drawer
          className="text-blue-400 text-sm font-medium"
        >
          View Map
        </button>
      </div>
    </div>
  );
}
