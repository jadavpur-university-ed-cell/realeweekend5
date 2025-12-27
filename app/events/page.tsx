// app/events/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { EVENTS_DATA } from '@/assets/eventData';

type EventName = keyof typeof EVENTS_DATA;

export default function EventsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<EventName>('PitchGenix');
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Check login status & fetch user's registered events on mount
    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch('/api/me');
                if (res.ok) {
                    const data = await res.json();
                    setIsLoggedIn(true);
                    // This makes the green "Registered" buttons persistent!
                    setRegisteredEvents(data.user.eventsRegistered || []);
                } else {
                    setIsLoggedIn(false);
                }
            } catch (e) {
                setIsLoggedIn(false);
            }
        }
        fetchUser();
    }, []);


    const handleRegister = async () => {
        if (!isLoggedIn) {
            router.push('/login');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/events/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventName: activeTab })
            });

            if (res.status === 401) {
                router.push('/login');
                return;
            }

            if (res.ok) {
                setRegisteredEvents(prev => [...prev, activeTab]);
                alert(`Successfully registered for ${activeTab}!`);
            }
        } catch (error) {
            alert("Registration failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const currentEvent = EVENTS_DATA[activeTab];
    const isRegistered = registeredEvents.includes(activeTab);

    return (
        <div
            className="min-h-screen relative font-sans text-gray-800"
            style={{
                backgroundImage: "url('/bg/board.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm fixed z-0"></div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">

                {/* HEADER */}
                <div className="mt-30 text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-2">Event Registration</h1>
                    <p className="text-teal-100">Select an event below to view details</p>
                </div>

                {/* TABS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
                    {(Object.keys(EVENTS_DATA) as EventName[]).map((name) => (
                        <button
                            key={name}
                            onClick={() => { setActiveTab(name); setOpenFaq(null); }}
                            className={`py-3 px-4 rounded-lg font-bold text-sm md:text-base transition-all ${activeTab === name
                                ? 'bg-teal-600 text-white shadow-lg scale-105 mx-4'
                                : 'bg-white/20 text-gray-200 hover:bg-white/30'
                                }`}
                        >
                            {name}
                        </button>
                    ))}
                </div>

                {/* MAIN CARD */}
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden min-h-[500px] flex flex-col md:flex-row">

                    {/* Left: Info & Register */}
                    <div className="md:w-2/3 p-8 border-b md:border-b-0 md:border-r border-gray-200">
                        <div className="flex items-center gap-4 mb-6">
                            <Image src = {currentEvent.logo} height={100} width={300} alt = {`${activeTab} logo`} className='rounded-xl' />
                            <div className="text-3xl font-bold text-gray-800">{activeTab}</div>
                        </div>

                        <p className="text-gray-600 text-lg leading-relaxed mb-8">
                            {currentEvent.description}
                        </p>

                        {/* REGISTER ACTION */}
                        <div className="mb-8">
                            {!isLoggedIn ? (
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-center gap-3">
                                    <AlertCircle className="text-amber-500" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-800">Login Required</p>
                                        <p className="text-xs text-amber-700">Please login to register for events.</p>
                                    </div>
                                    <button
                                        onClick={() => router.push('/login')}
                                        className="ml-auto bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded text-sm font-bold"
                                    >
                                        Login
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleRegister}
                                    disabled={isRegistered || loading}
                                    className={`w-full py-3 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${isRegistered
                                        ? 'bg-green-100 text-green-700 cursor-default'
                                        : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl'
                                        }`}
                                >
                                    {loading ? 'Processing...' : isRegistered ? (
                                        <>
                                            <CheckCircle size={20} /> Registered
                                        </>
                                    ) : (
                                        'Register Now'
                                    )}
                                </button>
                            )}
                        </div>

                        {/* FAQs */}
                        <div>
                            <h3 className="font-bold text-gray-800 mb-4 text-xl">FAQs</h3>
                            <div className="space-y-2">
                                {currentEvent.faqs.map((faq, i) => (
                                    <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                            className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 text-left"
                                        >
                                            <span className="font-medium text-gray-700 text-sm">{faq.q}</span>
                                            {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                        {openFaq === i && (
                                            <div className="p-3 bg-white text-gray-600 text-sm border-t border-gray-100">
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: POCs */}
                    <div className="md:w-1/3 bg-gray-50 p-8">
                        <h3 className="font-bold text-gray-800 mb-6 text-xl">Contact POCs</h3>
                        <div className="space-y-4">
                            {currentEvent.pocs.map((poc, i) => (
                                <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                    <p className="font-bold text-gray-900">{poc.name}</p>
                                    <p className="text-xs text-teal-600 font-bold uppercase tracking-wide mb-2">{poc.role}</p>
                                    <a
                                        href={`tel:${poc.phone}`}
                                        className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-2"
                                    >
                                        <Phone size={14} /> {poc.phone}
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
