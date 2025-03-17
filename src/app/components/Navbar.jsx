"use client";
import React, { useState } from "react";

const Navbar = () => {
  return (
    <nav className="bg-black flex items-center justify-between px-5 h-16 w-full">
      <div>
        <a href="#" className="flex items-center">
          <img src="/api/placeholder/120/50" alt="Logo" className="h-12" />
        </a>
      </div>
      <ul className="flex items-center space-x-6">
        <li>
          <a
            href="#"
            className="text-white font-bold uppercase text-sm tracking-wide"
          >
            Home
          </a>
        </li>
        <li>
          <a
            href="#"
            className="text-white font-bold uppercase text-sm tracking-wide"
          >
            Events
          </a>
        </li>
        <li>
          <a
            href="#"
            className="text-white font-bold uppercase text-sm tracking-wide"
          >
            Fighters
          </a>
        </li>
        <li>
          <a
            href="#"
            className="text-white font-bold uppercase text-sm tracking-wide"
          >
            Rankings
          </a>
        </li>
        <li className="relative">
          <button className="text-white font-bold uppercase text-sm tracking-wide flex items-center">
            More <span className="ml-1">▾</span>
          </button>
        </li>
      </ul>
      <div>
        <button className="bg-red-600 text-white font-bold px-4 py-2 uppercase text-sm">
          Login / Sign Up
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
