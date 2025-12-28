'use client';

import Link from 'next/link';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4 relative"
      style={{ backgroundImage: "url('/bg/board.png')" }}
    >
      {/* Dark Overlay matching Login */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-0"></div>

      <div className="w-full max-w-md bg-[#026b6d]/80 backdrop-blur-xl rounded-lg shadow-2xl p-10 relative z-10 border border-white/20 text-center animate-in fade-in zoom-in duration-300">
        
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="bg-red-500/20 p-4 rounded-full border border-red-400/30">
             <AlertTriangle className="w-16 h-16 text-red-200" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-md">404</h1>
        <h2 className="text-xl font-semibold text-teal-100 mb-6">Page Not Found</h2>

        <p className="text-gray-200 mb-8 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        {/* Action Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 w-full justify-center py-3 px-4 rounded-md font-bold text-white bg-blue-600 hover:bg-blue-500 hover:scale-[1.02] transition-all duration-200 shadow-lg"
        >
          <Home size={20} />
          Back to Home
        </Link>

        {/* <div className="mt-6 text-sm text-teal-200/60">
          Error Code: 404_RESOURCE_NOT_FOUND
        </div> */}
      </div>
    </div>
  );
}
