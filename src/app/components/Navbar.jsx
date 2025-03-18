"use client";
import Link from "next/link";
import React, { useState } from "react";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-5 h-fit w-full lg:px-40 py-4">
      <div>
        <a href="#" className="flex items-center">
          <img src="/logo.png" alt="Logo" className="h-[111px] w-[132px]" />
        </a>
      </div>
      <ul className="flex items-center space-x-6">
        <li>
          <Link
            href={"/"}
            className="text-white font-bold uppercase text-sm tracking-wide"
          >
            Home
          </Link>
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
        <Link
          href={"/login"}
          className="bg-red-600 text-white font-bold px-2 py-4 uppercase text-sm"
        >
          Login / Sign Up
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
