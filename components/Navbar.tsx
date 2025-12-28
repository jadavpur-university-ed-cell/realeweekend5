"use client";

import Link from "next/link";
import React from "react";

const Navbar = () => {
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "Timeline", href: "/timeline" },
    { name: "Gallery", href: "/gallery" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <nav className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-3 shadow-2xl min-w-[700px] flex justify-center">
        <ul className="flex items-center gap-6">
          {navItems.map((item) => {
            const isDashboard = item.name === "Dashboard";
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    block px-8 py-3 rounded-full border transition-all duration-300 font-semibold text-sm tracking-wide
                    ${isDashboard
                      ? "bg-white/20 backdrop-blur-xl border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:bg-white/30 hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] hover:scale-105"
                      : "bg-white/5 border-white/10 text-white/90 hover:bg-white/10 hover:border-white/30 hover:text-white hover:scale-105"
                    }
                  `}
                >
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
