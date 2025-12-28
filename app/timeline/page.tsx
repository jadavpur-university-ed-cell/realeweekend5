import React from 'react';

export default function TimelinePage() {
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
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-0 fixed">
                <div className="flex min-h-screen flex-col items-center justify-center p-24">
                    <h1 className="text-4xl font-bold">Timeline Page</h1>
                    <p className="mt-4 text-xl">Coming Soon</p>
                </div>
            </div>
        </div>
    );
}
