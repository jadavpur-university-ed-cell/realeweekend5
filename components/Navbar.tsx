"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/me');
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (e) {
        setIsLoggedIn(false);
      }
    }
    fetchUser();
  }, []);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "Timeline", href: "/timeline" },
    { name: "Gallery", href: "/gallery" },
    { name: isLoggedIn ? "Dashboard" : "Register", href: isLoggedIn ? "/dashboard" : "/register" },
  ];

  // Helper for consistent link styling
  const getLinkStyles = (isDashboard: boolean) => `
    block px-6 py-2 md:px-8 md:py-3 rounded-full border transition-all duration-300 font-semibold text-sm tracking-wide text-center whitespace-nowrap
    ${isDashboard
      ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_4px_15px_rgba(16,185,129,0.4)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.6)] hover:scale-105 border-none"
      : "bg-white/5 backdrop-blur-sm border-white/5 text-white/90 hover:bg-white/10 hover:border-white/20 hover:text-white hover:scale-105"
    }
  `;

  // Filter items for mobile logic
  const homeItem = navItems.find(i => i.name === "Home");
  const authItem = navItems[navItems.length - 1]; // Always the last item (Register/Dashboard)
  const middleItems = navItems.filter(i => i.name !== "Home" && i.name !== authItem.name);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] md:w-auto z-500">
      <nav className={`
        bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-3 
        shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]
 
        transition-all duration-300
        ${isMobileMenuOpen ? "rounded-3xl" : "rounded-full"}
        md:min-w-[700px] md:rounded-full md:px-4
      `}>

        {/* --- MOBILE LAYOUT (Visible < md) --- */}
        <div className="md:hidden flex flex-col w-full">

          {/* Top Row: Home | Toggle | Auth */}
          <div className="flex justify-between items-center w-full gap-2">

            {/* 1. Home (Always Visible) */}
            {homeItem && (
              <Link href={homeItem.href} className={`flex-1 ${getLinkStyles(false)}`}>
                {homeItem.name}
              </Link>
            )}

            {/* 2. Dropdown Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-colors"
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              )}
            </button>

            {/* 3. Auth (Always Visible) */}
            <Link href={authItem.href} className={`flex-1 ${getLinkStyles(true)}`}>
              {authItem.name}
            </Link>
          </div>

          {/* Collapsible Section (Middle Items) */}
          <div className={`
            flex-col gap-3 mt-4 overflow-hidden transition-all duration-300
            ${isMobileMenuOpen ? "flex max-h-[500px] opacity-100 pb-2" : "max-h-0 opacity-0 hidden"}
          `}>
            {middleItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={getLinkStyles(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* --- DESKTOP LAYOUT (Visible >= md) --- */}
        <ul className="hidden md:flex items-center justify-center gap-6">
          {navItems.map((item) => {
            const isDashboard = item.name === "Dashboard" || item.name === "Register";
            return (
              <li key={item.name}>
                <Link href={item.href} className={getLinkStyles(isDashboard)}>
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>

      </nav>
    </div>
  );
};

export default Navbar;
