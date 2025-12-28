'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function QuizLogin() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        const { email, password } = formData;
        setIsValid(email.trim() !== '' && password !== '' && !isSubmitted);
    }, [formData, isSubmitted]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setErrorMessage('');
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        try {
            // Calls our custom API route
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                setIsSubmitted(true);
                // Redirect specifically to the QUIZ DASHBOARD
                setTimeout(() => {
                    router.push('/prelims/dashboard');
                    router.refresh();
                }, 1500);
            } else {
                setErrorMessage(data.error || 'Login failed');
            }
        } catch (error) {
            setErrorMessage('Something went wrong. Please try again.');
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4 relative"
            style={{ backgroundImage: "url('/bg/board.png')" }}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-0"></div>

            <div className="w-full max-w-md bg-[#026b6d]/80 backdrop-blur-xl rounded-lg shadow-2xl p-8 relative z-10 border border-white/20">
                <h2 className="text-2xl font-bold text-center mb-6 text-white drop-shadow-md">
                    Prelims Portal Login
                <div className="text-teal-100 text-sm">Access Restricted to Registered Candidates</div>
                </h2>

                {isSubmitted ? (
                    <div className="text-center py-10 space-y-4 animate-in fade-in zoom-in duration-300">
                        <CheckCircle className="w-16 h-16 text-green-300 mx-auto" />
                        <p className="text-xl font-semibold text-white">Login Successful!</p>
                        <p className="text-gray-200">Entering Exam Environment...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {errorMessage && (
                            <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded text-sm text-center">
                                {errorMessage}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-100 mb-1 shadow-sm">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white/95 text-black"
                                placeholder="student@college.edu"
                            />
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-100 mb-1 shadow-sm">Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-300 pr-10 bg-white/95 text-black"
                                placeholder="Enter password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={!isValid}
                            className={`w-full py-2.5 px-4 rounded-md font-bold text-white transition-all duration-200 shadow-lg ${isValid
                                ? 'bg-blue-600 hover:bg-blue-500 hover:scale-[1.02]'
                                : 'bg-gray-500/50 cursor-not-allowed text-gray-300'
                                }`}
                        >
                            Login
                        </button>

                        <div className="text-center mt-4">
                            <div className="text-teal-100 text-sm">Please Join From Desktop/Laptop for Better Experience</div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
