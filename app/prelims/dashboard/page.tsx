"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, AlertTriangle, PlayCircle, LogOut, UserCircle, Loader2 } from "lucide-react";

interface Exam {
  id: string;   // or _id if from mongo directly
  slug: string; // usually the ID for URL
  title: string;
  liveFrom: string;
  liveUntil: string;
}

interface UserData {
  name: string;
  email: string;
  eventsRegistered: string[]; 
}

export default function QuizDashboard() {
  const router = useRouter();
  const [now, setNow] = useState<Date | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [exams, setExams] = useState<Exam[]>([]); // Dynamic State
  const [loading, setLoading] = useState(true);

  // Sync clock
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Data (User + Exams)
  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch User
        const userRes = await fetch('/api/me');
        if (!userRes.ok) {
           router.push('/prelims');
           return;
        }
        const userData = await userRes.json();
        setUser(userData.user);

        // 2. Fetch Exams from DB
        const examsRes = await fetch('/api/exams'); // You need this endpoint
        if (examsRes.ok) {
           const examsData = await examsRes.json();
           setExams(examsData);
          //  console.log("Exams", examsData);
        }

      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  // Logout Handler
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/prelims');
  };

  if (!now || loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white gap-3">
        <Loader2 className="animate-spin text-blue-500" /> Loading Portal...
    </div>
  );

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat p-6 md:p-12 relative overflow-hidden"
      style={{ backgroundImage: "url('/bg/board.png')" }}
    >
      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-0"></div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-white/10 pb-6 mt-10 md:mt-20 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
              Quiz Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">Welcome back to the examination portal.</p>
          </div>

          {/* User Profile Corner */}
          <div className="flex items-center gap-6 bg-white/5 border border-white/10 px-6 py-3 rounded-full backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-3">
              <UserCircle className="w-8 h-8 text-blue-300" />
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-white leading-tight">{user?.name || "Candidate"}</p>
                <p className="text-xs text-gray-400">{user?.email || "No Email"}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-white/20 hidden md:block"></div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm font-semibold"
            >
              <LogOut size={16} /> <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Info & Clock */}
          <div className="lg:col-span-2 space-y-6">

            {/* Live Clock Card */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <Clock size={100} />
              </div>
              <p className="text-gray-400 uppercase tracking-widest text-sm font-bold mb-2">Official Server Time</p>
              <div className="text-5xl md:text-6xl font-mono font-bold text-white tabular-nums tracking-tight drop-shadow-lg">
                {now.toLocaleTimeString('en-US', { hour12: true })}
              </div>
              <p className="text-blue-300 mt-2 font-medium">{now.toDateString()}</p>
            </div>

            {/* Rules Card */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl shadow-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                <AlertTriangle className="text-yellow-400" /> Exam Guidelines
              </h2>
              <ul className="space-y-4 text-gray-200">
                <li className="flex gap-3">
                  <span className="bg-white/10 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mt-0.5 shrink-0">1</span>
                  <span>The portal for each exam opens exactly at <strong>8:00 PM</strong> and closes at <strong>9:00 PM</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-white/10 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mt-0.5 shrink-0">2</span>
                  <span>Once started, you have strictly <strong>20 minutes</strong> to complete the test.</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-white/10 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mt-0.5 shrink-0">3</span>
                  <span className="text-red-300"><strong>Anti-Cheat Active:</strong> Tab switching is monitored. 3 violations will auto-submit your test.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Exam Cards */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-200 mb-4">Your Scheduled Exams</h3>

            {exams.length === 0 && <p className="text-gray-400 text-sm">No active exams found.</p>}

            {exams.map((exam) => {
              const start = new Date(exam.liveFrom); // Use DB field names
              const end = new Date(exam.liveUntil);
              const isLive = now >= start && now < end;
              const isPast = now >= end;

              // Check if user is registered for this specific exam
              // Logic: does eventsRegistered array include the exam Title or Slug?
              // NOTE: Adjust 'exam.title' if your array stores IDs or Slugs instead
              const isRegistered = user?.eventsRegistered?.includes(exam.title); 

              return (
                <div
                  key={exam.slug}
                  className={`p-6 rounded-xl border transition-all duration-300 relative overflow-hidden backdrop-blur-xl shadow-lg
                    ${isLive && isRegistered
                      ? "bg-blue-600/20 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                      : "bg-white/5 border-white/10"
                    }
                  `}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg text-white">{exam.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        {start.toLocaleDateString()} <br />
                        {start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    {/* Status Badge */}
                    {isPast ? (
                      <span className="bg-red-900/50 text-red-200 text-xs font-bold px-2 py-1 rounded">CLOSED</span>
                    ) : !isRegistered ? (
                      <span className="bg-gray-700 text-gray-300 text-xs font-bold px-2 py-1 rounded">NOT REG</span>
                    ) : isLive ? (
                      <span className="bg-green-500 text-black text-xs font-bold px-2 py-1 rounded animate-pulse">LIVE</span>
                    ) : (
                      <span className="bg-blue-900/50 text-blue-200 text-xs font-bold px-2 py-1 rounded">UPCOMING</span>
                    )}
                  </div>

                  {/* Main Action Button */}
                  {isRegistered ? (
                    <button
                      onClick={() => router.push(`/prelims/${exam.slug}`)}
                      disabled={!isLive}
                      className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all
                        ${isLive
                          ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg scale-100 hover:scale-[1.02] cursor-pointer"
                          : "bg-white/5 text-gray-500 cursor-not-allowed"
                        }
                      `}
                    >
                      {isLive ? <><PlayCircle size={18} /> Start Exam</> : isPast ? "Exam Ended" : "Wait for Start"}
                    </button>
                  ) : (
                    <div className="w-full py-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 text-center text-sm font-semibold">
                      You are not registered
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
