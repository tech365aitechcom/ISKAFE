"use client";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import useStore from "../../../stores/useStore";
import Image from "next/image";
import { API_BASE_URL, roles } from "../../../constants";
import axios from "axios";
import Loader from "../../_components/Loader";

const Navbar = () => {
  const user = useStore((state) => state.user);
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const isLoggedIn = user ? true : false;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNavbarConfig = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/home-config/navbar`);
        setData(response.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNavbarConfig();
  }, []);

  const filteredMenuItems = (data?.menuItems || [])
    .filter((item) => {
      if (!item.status) return false;
      if (item.visibilityRole === "everyone") return true;
      if (item.visibilityRole === "loggedIn") return isLoggedIn;
      if (item.visibilityRole === "admin")
        return user?.role === roles.superAdmin;
      return false;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const mainMenuItems = filteredMenuItems.slice(0, 4);
  let moreMenuItems = filteredMenuItems.slice(4);

  if (isLoggedIn) {
    moreMenuItems = [...moreMenuItems, { label: "Logout", action: "logout" }];
  }

  const isMoreMenuActive = moreMenuItems.some((item) =>
    pathname.startsWith(item.destination)
  );

  const getMenuItemClass = (destination) => {
    return pathname === destination || pathname.startsWith(`${destination}/`)
      ? "text-yellow-500"
      : "text-white";
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[#07091D]">
        <Loader />
      </div>
    );
  }

  return (
    <nav className="flex items-center justify-between container mx-auto px-4 h-fit w-full py-4 relative">
      {/* Logo */}
      <Link href="/" className="flex">
        <div className="hidden lg:block relative w-30 h-30">
          <Image
            src={data.logo}
            alt="Global Sports Federation Logo"
            layout="fill"
            className="rounded-full"
          />
        </div>
        <div className="md:hidden relative w-18 h-18">
          <Image
            src={data.logo}
            alt="Global Sports Federation Logo"
            layout="fill"
            className="rounded-full"
          />
        </div>
      </Link>

      {/* Desktop Navigation */}
      <ul className="hidden lg:flex items-center space-x-6">
        {mainMenuItems.map((item) => (
          <li key={item.destination}>
            <Link
              href={item.destination}
              className={`font-bold uppercase text-2xl tracking-wide ${getMenuItemClass(
                item.destination
              )}`}
            >
              {item.label}
            </Link>
          </li>
        ))}

        <li className="relative" ref={dropdownRef}>
          <button
            className={`${
              isMoreMenuActive ? "text-yellow-500" : "text-white"
            } font-bold uppercase text-2xl tracking-wide flex items-center`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            More <span className="ml-1">▾</span>
          </button>
          {dropdownOpen && (
            <ul className="absolute left-0 mt-2 bg-black shadow-lg rounded-md w-44 py-2 z-50">
              {moreMenuItems.map((item, index, array) => (
                <li key={index}>
                  {item.action === "logout" ? (
                    <button
                      onClick={() => {
                        useStore.getState().clearUser();
                        setDropdownOpen(false);
                        window.location.href = "/";
                      }}
                      className={`block w-full text-left py-2 text-white uppercase font-semibold mx-2 ${
                        index !== array.length - 1
                          ? "border-b border-[#6C6C6C]"
                          : ""
                      }`}
                    >
                      Logout
                    </button>
                  ) : (
                    <Link
                      href={item.destination}
                      onClick={() => setDropdownOpen(false)}
                      className={`block py-2 ${getMenuItemClass(
                        item.destination
                      )} hover:bg-gray-900 uppercase text-left font-semibold ${
                        index !== array.length - 1
                          ? "border-b border-[#6C6C6C] mx-2"
                          : "mx-2"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </li>
      </ul>

      {/* Desktop Login/Signup */}
      {!isLoggedIn &&
      pathname !== "/login" &&
      pathname !== "/signup" &&
      pathname !== "/forgot-password" ? (
        <div className="hidden lg:block">
          <Link
            href={"/login"}
            className="bg-red-600 text-white font-bold px-2 py-4 uppercase text-2xl"
          >
            Login / Sign Up
          </Link>
        </div>
      ) : (
        <div></div>
      )}

      {/* Mobile Menu Toggle */}
      <div className="lg:hidden">
        <button
          onClick={toggleMobileMenu}
          className="text-white focus:outline-none"
        >
          {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black z-50 lg:hidden">
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex justify-end items-center px-5 py-4">
              <button
                onClick={closeMobileMenu}
                className="text-white focus:outline-none"
              >
                <X size={32} />
              </button>
            </div>

            {/* Mobile Menu Items */}
            <div className="overflow-y-auto z-50">
              <ul className="py-4">
                <ul className="py-4">
                  {[...mainMenuItems, ...moreMenuItems].map(
                    (item, index, array) => (
                      <li key={index}>
                        {item.action === "logout" ? (
                          <button
                            onClick={() => {
                              useStore.getState().clearUser();
                              setDropdownOpen(false);
                              window.location.href = "/";
                            }}
                            className="block px-4 py-3 text-white uppercase font-semibold text-xl"
                          >
                            Logout
                          </button>
                        ) : (
                          <Link
                            href={item.destination}
                            onClick={closeMobileMenu}
                            className={`block px-2 py-3 text-xl border-b border-[#6C6C6C] mx-2 ${getMenuItemClass(
                              item.destination
                            )} uppercase font-semibold`}
                          >
                            {item.label}
                          </Link>
                        )}
                      </li>
                    )
                  )}
                </ul>
              </ul>
            </div>

            {/* Mobile Login/Signup */}
            {!isLoggedIn &&
            pathname !== "/login" &&
            pathname !== "/signup" &&
            pathname !== "/forgot-password" ? (
              <div className="px-3 py-4">
                <Link
                  href={"/login"}
                  onClick={closeMobileMenu}
                  className=" bg-red-600 text-white font-bold text-center px-4 py-3 uppercase text-xl"
                >
                  Login / Sign Up
                </Link>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
