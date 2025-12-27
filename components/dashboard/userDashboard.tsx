import React from 'react';
import { User as UserIcon, Mail, Hash, BookOpen, Calendar, Shield } from 'lucide-react';
import Link from 'next/link';

export default function UserDashboard({ userData }: { userData: any }) {
  return (
    <div
      className="min-h-screen p-4 md:p-8 relative"
      style={{
        backgroundImage: "url('/bg/board.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-0 fixed"></div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="mt-30 bg-[#026b6d]/80 backdrop-blur-xl border border-white/20 rounded-xl p-6 shadow-2xl text-white flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {userData.name.split(' ')[0]}!</h1>
            <p className="text-teal-100 mt-1">Student Dashboard</p>
          </div>
          <div className="hidden md:block bg-white/10 p-3 rounded-full">
            <UserIcon size={32} className="text-teal-200" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="text-blue-500" size={20} />
              Profile Details
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-blue-50 rounded-lg">
                  <UserIcon size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Full Name</p>
                  <p className="text-gray-800 font-medium">{userData.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-blue-50 rounded-lg">
                  <Mail size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Email Address</p>
                  <p className="text-gray-800 font-medium">{userData.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-blue-50 rounded-lg">
                  <Hash size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Roll Number</p>
                  <p className="text-gray-800 font-medium font-mono bg-gray-100 px-2 py-0.5 rounded text-sm">
                    {userData.rollNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-blue-50 rounded-lg">
                  <BookOpen size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Department</p>
                  <p className="text-gray-800 font-medium">{userData.department}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Events Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-6 border-l-4 border-teal-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="text-teal-600" size={20} />
              Registered Events
            </h2>

            {userData.eventsRegistered && userData.eventsRegistered.length > 0 ? (
              <div className="space-y-3">
                {userData.eventsRegistered.map((event: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-100 hover:shadow-sm transition-shadow"
                  >
                    <div className="h-2 w-2 rounded-full bg-teal-500"></div>
                    <span className="text-teal-900 font-medium">{event}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500 text-sm">No events registered yet.</p>
                <Link href="/events">
                  <button className="mt-4 px-4 py-2 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 transition-colors">
                    Browse Events
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
