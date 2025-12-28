'use client';

import React, { useState } from 'react';
import { Download, Users, Table as TableIcon, Search } from 'lucide-react';

// Define the events list
const EVENTS = ['PitchGenix', 'Corporate Devs', 'Technokraft', 'Data Binge'];

export default function AdminDashboard({ allUsers }: { allUsers: any[] }) {
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter users based on active tab AND search query
    const filteredUsers = allUsers.filter(user => {
        // 1. Check Tab
        const matchesTab = activeTab === 'All' || user.eventsRegistered?.includes(activeTab);
        
        // 2. Check Search (Case insensitive)
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
            (user.name || '').toLowerCase().includes(query) ||
            (user.email || '').toLowerCase().includes(query) ||
            (user.rollNumber || '').toLowerCase().includes(query) ||
            (user.department || '').toLowerCase().includes(query);

        return matchesTab && matchesSearch;
    });

    // Function to download CSV
    const downloadCSV = () => {
        const headers = ['Name,Email,Roll Number,Department,Events Registered'];

        const rows = filteredUsers.map(user => {
            // Escape commas in fields to prevent CSV breakage
            const events = `"${user.eventsRegistered?.join(', ') || ''}"`;
            return [
                user.name,
                user.email,
                user.rollNumber,
                user.department,
                events
            ].join(',');
        });

        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${activeTab.replace(' ', '_')}_Registrations.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div
            className="min-h-screen p-4 md:p-0 relative"
            style={{
                backgroundImage: "url('/bg/board.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            <div className="min-h-screen bg-transparent/50 backdrop-blur-lg p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-6 mt-20">
                    {/* Header with Search and Download */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Users className="text-purple-600" />
                                Admin Dashboard
                            </h1>
                            <p className="text-gray-500 mt-1">Manage registrations and view student data</p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                            {/* Search Bar */}
                            <div className="relative w-full md:w-64">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by name, roll..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition duration-150 ease-in-out"
                                />
                            </div>

                            {/* Download Button */}
                            <button
                                onClick={downloadCSV}
                                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                <Download size={18} />
                                <span className="md:hidden lg:inline">Download CSV</span>
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
                        <button
                            onClick={() => setActiveTab('All')}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${activeTab === 'All'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            All Students
                        </button>
                        {EVENTS.map(event => (
                            <button
                                key={event}
                                onClick={() => setActiveTab(event)}
                                className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${activeTab === event
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {event}
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <TableIcon size={16} className="text-gray-500" />
                                <span className="font-semibold text-gray-700">
                                    {activeTab === 'All' ? 'All Registrations' : `${activeTab} Participants`}
                                    <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs">
                                        {filteredUsers.length}
                                    </span>
                                </span>
                            </div>
                            {searchQuery && (
                                <span className="text-xs text-gray-500">
                                    Filtering by "{searchQuery}"
                                </span>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Roll Number</th>
                                        <th className="px-6 py-4">Department</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Registered Events</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user, i) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                                <td className="px-6 py-4 font-mono text-gray-600">{user.rollNumber}</td>
                                                <td className="px-6 py-4 text-gray-600">{user.department}</td>
                                                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.eventsRegistered?.map((ev: string) => (
                                                            <span
                                                                key={ev}
                                                                className={`px-2 py-0.5 rounded text-xs border ${ev === activeTab
                                                                        ? 'bg-purple-100 text-purple-700 border-purple-200 font-semibold'
                                                                        : 'bg-gray-100 text-gray-600 border-gray-200'
                                                                    }`}
                                                            >
                                                                {ev}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                                {searchQuery 
                                                    ? `No results found for "${searchQuery}"`
                                                    : "No registrations found for this category."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
