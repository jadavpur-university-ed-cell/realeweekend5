'use client';

import React, { useState, useEffect } from 'react';
import { Download, Users, Table as TableIcon, Search, ShieldCheck } from 'lucide-react';

// Define the events list
const EVENTS = ['PitchGenix', 'Corporate Devs', 'Technokraft', 'Data Binge'];

interface AdminDashboardProps {
    allUsers: any[];
    allTeams: any[]; // New prop for teams
}

export default function AdminDashboard({ allUsers, allTeams = [] }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // View Mode: 'users' or 'teams'. Only applicable for PitchGenix
    const [viewMode, setViewMode] = useState<'users' | 'teams'>('users');

    // Reset view mode when changing tabs
    useEffect(() => {
        if (activeTab !== 'PitchGenix') {
            setViewMode('users');
        }
    }, [activeTab]);

    // --- FILTERING LOGIC ---

    // 1. Filter Users
    const filteredUsers = allUsers.filter(user => {
        const matchesTab = activeTab === 'All' || user.eventsRegistered?.includes(activeTab);
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            (user.name || '').toLowerCase().includes(query) ||
            (user.email || '').toLowerCase().includes(query) ||
            (user.rollNumber || '').toLowerCase().includes(query) ||
            (user.department || '').toLowerCase().includes(query);

        return matchesTab && matchesSearch;
    });

    // 2. Filter Teams (Only for PitchGenix)
    const filteredTeams = allTeams.filter(team => {
        if (activeTab !== 'PitchGenix') return false; // Safety check

        const query = searchQuery.toLowerCase();

        // Check Team Name or Code
        const matchesTeamDetails =
            (team.name || '').toLowerCase().includes(query) ||
            (team.teamCode || '').toLowerCase().includes(query);

        // Check Leader details
        const matchesLeader =
            (team.leader?.name || '').toLowerCase().includes(query) ||
            (team.leader?.email || '').toLowerCase().includes(query);

        return matchesTeamDetails || matchesLeader;
    });

    // --- CSV DOWNLOAD LOGIC ---

    const downloadCSV = () => {
        let headers: string[] = [];
        let rows: string[] = [];
        let fileName = '';

        if (viewMode === 'teams' && activeTab === 'PitchGenix') {
            // TEAM EXPORT
            headers = ['Team Name,Team Code,Leader Name,Leader Email,Leader Roll,Member 1,Member 2,Member 3'];

            rows = filteredTeams.map(team => {
                // Format members as a string "Name (Email)"
                const member1 = team.members[0] ? `${team.members[0].name} (${team.members[0].email})` : '';
                const member2 = team.members[1] ? `${team.members[1].name} (${team.members[1].email})` : '';
                const member3 = team.members[2] ? `${team.members[2].name} (${team.members[2].email})` : '';

                return [
                    `"${team.name}"`,
                    team.teamCode,
                    `"${team.leader?.name || 'N/A'}"`,
                    team.leader?.email || 'N/A',
                    team.leader?.rollNumber || 'N/A',
                    `"${member1}"`,
                    `"${member2}"`,
                    `"${member3}"`
                ].join(',');
            });
            fileName = 'PitchGenix_Teams.csv';

        } else {
            // USER EXPORT (Original logic)
            headers = ['Name,Email,Roll Number,Department,Events Registered'];
            rows = filteredUsers.map(user => {
                const events = `"${user.eventsRegistered?.join(', ') || ''}"`;
                return [
                    `"${user.name}"`,
                    user.email,
                    user.rollNumber,
                    user.department,
                    events
                ].join(',');
            });
            fileName = `${activeTab.replace(' ', '_')}_Registrations.csv`;
        }

        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
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
                    {/* Header */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Users className="text-purple-600" />
                                Admin Dashboard
                            </h1>
                            <p className="text-gray-500 mt-1">Manage registrations and view student data</p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder={viewMode === 'teams' ? "Search team or leader..." : "Search by name, roll..."}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition duration-150 ease-in-out"
                                />
                            </div>

                            <button
                                onClick={downloadCSV}
                                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                <Download size={18} />
                                <span className="md:hidden lg:inline">Download CSV</span>
                            </button>
                        </div>
                    </div>

                    {/* Tabs & Toggles */}
                    <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                        <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar w-full">
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

                        {/* View Toggle only for PitchGenix */}
                        {activeTab === 'PitchGenix' && (
                            <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm shrink-0">
                                <button
                                    onClick={() => setViewMode('users')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'users' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Participants
                                </button>
                                <button
                                    onClick={() => setViewMode('teams')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'teams' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Teams View
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <TableIcon size={16} className="text-gray-500" />
                                <span className="font-semibold text-gray-700">
                                    {activeTab === 'PitchGenix' && viewMode === 'teams'
                                        ? 'PitchGenix Teams'
                                        : (activeTab === 'All' ? 'All Registrations' : `${activeTab} Participants`)}
                                    <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs">
                                        {viewMode === 'teams' ? filteredTeams.length : filteredUsers.length}
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
                            {viewMode === 'teams' && activeTab === 'PitchGenix' ? (
                                // --- TEAM TABLE ---
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
                                        <tr>
                                            <th className="px-6 py-4">Team Name</th>
                                            <th className="px-6 py-4">Code</th>
                                            <th className="px-6 py-4">Leader</th>
                                            <th className="px-6 py-4">Members</th>
                                            <th className="px-6 py-4">Size</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredTeams.length > 0 ? (
                                            filteredTeams.map((team, i) => {
                                                // Calculate Size correctly
                                                const memberIds = team.members?.map((m: any) => m._id || m.id) || [];
                                                const leaderId = team.leader?._id || team.leader?.id;
                                                const isLeaderInMembers = memberIds.includes(leaderId);
                                                const teamSize = (team.members?.length || 0) + (isLeaderInMembers ? 0 : 1);

                                                return (
                                                    <tr key={team._id || i} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-gray-900">{team.name}</td>
                                                        <td className="px-6 py-4 font-mono text-xs text-purple-600 bg-purple-50 rounded w-fit px-2">
                                                            {team.teamCode}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-gray-900 flex items-center gap-1">
                                                                    <ShieldCheck size={14} className="text-green-600" />
                                                                    {team.leader?.name || 'Unknown'}
                                                                </span>
                                                                <span className="text-xs text-gray-500">{team.leader?.email}</span>
                                                                <span className="text-xs text-gray-400">{team.leader?.rollNumber}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col gap-2">
                                                                {team.members?.length > 0 ? team.members.map((m: any, idx: number) => (
                                                                    <div key={idx} className="flex flex-col text-xs">
                                                                        <span className="text-gray-700 font-medium">{m.name}</span>
                                                                        <span className="text-gray-500">{m.email}</span>
                                                                    </div>
                                                                )) : <span className="text-gray-400 italic">No members</span>}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-500">
                                                            {teamSize} / 4
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                                    No teams found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                // --- USER TABLE (Original) ---
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
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
