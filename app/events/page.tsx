'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Phone, CheckCircle, AlertCircle, Users, Plus, ArrowRight, Copy, User as UserIcon, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { EVENTS_DATA } from '@/assets/eventData';

type EventName = keyof typeof EVENTS_DATA;

interface TeamDetails {
    name: string;
    teamCode: string;
    members: { _id: string; name: string }[];
}

export default function EventsPage() {
    const router = useRouter();
    
    const [activeTab, setActiveTab] = useState<EventName>('PitchGenix');
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const [teamDetails, setTeamDetails] = useState<TeamDetails | null>(null);
    const [teamMode, setTeamMode] = useState<'create' | 'join' | null>(null);
    const [teamName, setTeamName] = useState('');
    const [teamCodeInput, setTeamCodeInput] = useState('');

    useEffect(() => {
        setTeamMode(null);
        setTeamName('');
        setTeamCodeInput('');
        setOpenFaq(null);
    }, [activeTab]);

    const fetchTeamData = useCallback(async () => {
        try {
            const res = await fetch('/api/events/my-team');
            if (res.ok) {
                const data = await res.json();
                if (data.team) {
                    setTeamDetails(data.team);
                }
            }
        } catch (e) {
            console.error("Failed to fetch team details", e);
        }
    }, []);

    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch('/api/me');
            if (res.ok) {
                const data = await res.json();
                setIsLoggedIn(true);
                const regs = data.user.eventsRegistered || [];
                setRegisteredEvents(regs);

                if (regs.includes('PitchGenix')) {
                    fetchTeamData();
                }
            } else {
                setIsLoggedIn(false);
            }
        } catch (e) {
            setIsLoggedIn(false);
        }
    }, [fetchTeamData]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleRegister = async () => {
        if (!isLoggedIn) { router.push('/login'); return; }
        setLoading(true);
        try {
            const res = await fetch('/api/events/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventName: activeTab })
            });

            if (res.status === 401) { router.push('/login'); return; }

            if (res.ok) {
                await fetchUser();
                alert(`Successfully registered for ${activeTab}!`);
            }
        } catch (error) {
            alert("Registration failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleTeamSubmit = async () => {
        if (!isLoggedIn) { router.push('/login'); return; }
        if (teamMode === 'create' && !teamName.trim()) return alert("Please enter a team name");
        if (teamMode === 'join' && !teamCodeInput.trim()) return alert("Please enter a team code");

        setLoading(true);
        const endpoint = teamMode === 'create' ? '/api/events/create-team' : '/api/events/join-team';
        
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    eventName: activeTab,
                    teamName: teamMode === 'create' ? teamName : undefined,
                    joinCode: teamMode === 'join' ? teamCodeInput : undefined
                })
            });

            if (res.status === 401) { router.push('/login'); return; }

            if (res.ok) {
                await fetchUser();
                await fetchTeamData();
                setTeamMode(null);
            } else {
                const err = await res.json();
                alert(err.message || "Action failed");
            }
        } catch (error) {
            alert("Request failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Team Code copied!");
    };

    const currentEvent = EVENTS_DATA[activeTab];
    const isRegistered = registeredEvents.includes(activeTab);

    return (
        <div 
            className="min-h-screen relative font-sans text-slate-200"
            style={{
                backgroundImage: "url('/bg/board.png')", 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="absolute inset-0 bg-[#0f2e2e]/90 pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">

                <div className="mt-20 text-center mb-8">
                    {/* Softer White Title */}
                    <h1 className="text-4xl font-bold text-slate-100 mb-2">Events Arena</h1>
                    {/* Soothing Slate-400 for subtitles */}
                    <p className="text-slate-400">Select an event to register and view details</p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {(Object.keys(EVENTS_DATA) as EventName[]).map((name) => (
                        <button
                            key={name}
                            onClick={() => setActiveTab(name)}
                            className={`px-5 py-2 rounded-lg font-semibold text-sm transition-colors ${
                                activeTab === name
                                ? 'bg-teal-600 text-slate-50 shadow-md'
                                : 'bg-[#1e293b] text-slate-400 hover:bg-[#2d3b52] hover:text-slate-200'
                            }`}
                        >
                            {name}
                        </button>
                    ))}
                </div>

                <div className="bg-[#1e293b] rounded-xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-700">
                    
                    {/* Left: Content */}
                    <div className="md:w-2/3 p-6 md:p-8">
                        
                        <div className="flex items-center gap-5 mb-6">
                            <Image 
                                src={currentEvent.logo || '/logo/placeholder.png'} 
                                height={100}
                                width={300}
                                className="object-cover rounded-lg" 
                                alt={`${activeTab} logo`} 
                            />
                            <div>
                                <h2 className="text-2xl font-bold text-slate-100 mb-1">{activeTab}</h2>
                                <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-700 text-slate-300">
                                    Main Event
                                </span>
                            </div>
                        </div>

                        <div className="mb-8">
                            {/* Soothing Slate-300 for main body text (easier to read than gray) */}
                            <p className="text-slate-300 text-base leading-relaxed">
                                {currentEvent.description}
                            </p>
                        </div>

                        {/* --- REGISTRATION AREA --- */}
                        <div className="mb-8 p-6 bg-[#0f172a] rounded-lg border border-gray-700">
                            {!isLoggedIn ? (
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="text-amber-500" size={20} />
                                        <span className="text-slate-400 text-sm">Please login to register.</span>
                                    </div>
                                    <button
                                        onClick={() => router.push('/login')}
                                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold rounded transition-colors"
                                    >
                                        Login
                                    </button>
                                </div>
                            ) : isRegistered ? (
                                <div>
                                    <div className="flex items-center gap-3 text-green-400 font-medium mb-4">
                                        <CheckCircle size={20} />
                                        <span>Registration Confirmed</span>
                                    </div>

                                    {activeTab === 'PitchGenix' && (
                                        <div className="bg-gray-800 rounded-lg p-5 border border-gray-600 animate-in fade-in slide-in-from-bottom-2">
                                            {teamDetails ? (
                                                <>
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 border-b border-gray-700 pb-4 gap-4">
                                                        <div>
                                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Your Team</p>
                                                            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                                                                {teamDetails.name}
                                                            </h3>
                                                        </div>
                                                        
                                                        <div className="w-full sm:w-auto bg-[#0f172a] p-2 rounded border border-teal-900/50 flex items-center justify-between gap-3">
                                                            <div>
                                                                <p className="text-[10px] text-teal-500 uppercase font-bold">Team Code</p>
                                                                <p className="text-lg font-mono font-bold text-slate-200 tracking-widest select-all">{teamDetails.teamCode}</p>
                                                            </div>
                                                            <button 
                                                                onClick={() => copyToClipboard(teamDetails.teamCode)}
                                                                className="p-2 hover:bg-gray-700 rounded text-slate-400 hover:text-white transition-colors"
                                                                title="Copy Code"
                                                            >
                                                                <Copy size={16}/>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-3">Team Members</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {teamDetails.members.map((member, i) => (
                                                                <div key={i} className="flex items-center gap-3 bg-gray-900/50 p-2 rounded border border-gray-700/50">
                                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-white shadow-sm">
                                                                        <UserIcon size={14} />
                                                                    </div>
                                                                    <span className="text-slate-300 text-sm font-medium">{member.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                                    <p className="text-slate-400 text-sm mb-3">Loading team details...</p>
                                                    <button 
                                                        onClick={fetchTeamData} 
                                                        className="flex items-center gap-2 text-teal-400 text-xs hover:underline"
                                                    >
                                                        <RefreshCw size={12} /> Reload
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : activeTab === 'PitchGenix' ? (
                                <div>
                                    <h4 className="flex items-center gap-2 text-slate-200 font-bold mb-4 text-sm uppercase tracking-wide">
                                        <Users className="text-teal-500" size={18}/> 
                                        Team Registration
                                    </h4>
                                    
                                    {!teamMode ? (
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => setTeamMode('create')}
                                                className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-slate-300 text-sm font-medium transition-colors flex flex-col items-center gap-1"
                                            >
                                                <Plus size={18} className="text-teal-500"/>
                                                Create Team
                                            </button>
                                            <button 
                                                onClick={() => setTeamMode('join')}
                                                className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-slate-300 text-sm font-medium transition-colors flex flex-col items-center gap-1"
                                            >
                                                <Users size={18} className="text-blue-500"/>
                                                Join Team
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                                                {teamMode === 'create' ? "Team Name" : "Team Code"}
                                            </label>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded focus:border-teal-500 focus:outline-none text-slate-200 placeholder-slate-500 text-sm"
                                                    placeholder={teamMode === 'create' ? "Name..." : "Code..."}
                                                    value={teamMode === 'create' ? teamName : teamCodeInput}
                                                    onChange={(e) => teamMode === 'create' ? setTeamName(e.target.value) : setTeamCodeInput(e.target.value)}
                                                />
                                                <button 
                                                    onClick={handleTeamSubmit}
                                                    disabled={loading}
                                                    className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded text-sm font-bold disabled:opacity-50"
                                                >
                                                    {loading ? '...' : <ArrowRight size={18} />}
                                                </button>
                                            </div>
                                            <button 
                                                onClick={() => setTeamMode(null)}
                                                className="text-xs text-slate-500 hover:text-slate-300 mt-2 underline"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={handleRegister}
                                    disabled={loading}
                                    className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg transition-colors shadow-lg"
                                >
                                    {loading ? 'Processing...' : 'Register Now'}
                                </button>
                            )}
                        </div>

                        {/* FAQs */}
                        <div>
                            <h3 className="font-bold text-slate-200 mb-3 text-lg">FAQs</h3>
                            <div className="space-y-2">
                                {currentEvent.faqs.map((faq, i) => (
                                    <div key={i} className="border-b border-gray-700 last:border-0">
                                        <button
                                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                            className="w-full flex justify-between items-center py-3 text-left hover:text-teal-400 transition-colors"
                                        >
                                            <span className="font-medium text-slate-300 text-sm">{faq.q}</span>
                                            <div className={`text-slate-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>
                                                <ChevronDown size={16} />
                                            </div>
                                        </button>
                                        {openFaq === i && (
                                            <div className="pb-3 text-slate-400 text-sm leading-relaxed">
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Sidebar */}
                    <div className="md:w-1/3 bg-[#152030] p-6 md:p-8 border-t md:border-t-0 md:border-l border-gray-700">
                        <h3 className="font-bold text-slate-200 mb-5 text-lg">Contact POCs</h3>
                        <div className="space-y-3">
                            {currentEvent.pocs.map((poc, i) => (
                                <div key={i} className="p-4 bg-[#1e293b] rounded-lg border border-gray-700">
                                    <p className="font-bold text-slate-200 text-sm mb-1">{poc.name}</p>
                                    <a
                                        href={`https://api.whatsapp.com/send?phone=${poc.phone}`}
                                        className="flex items-center gap-2 text-xs text-teal-400 hover:underline"
                                        target='_blank'
                                    >
                                        <Phone size={12} /> {poc.phone}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
