"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User } from "next-auth"
import Image from "next/image";
import { Button } from "./ui/button";
import { FaBars, FaTimes } from "react-icons/fa";

const NavBar = () => {
    const { data: session } = useSession();
    const user: User = session?.user as User;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMobileMenuOpen((prev) => !prev);
    };

    return (
        <header className="sticky top-0 inset-x-0 z-50 bg-white shadow-md transition-all">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                {/* Branding */}
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/bike-buddy-logo.png"
                        alt="Bike Buddy Logo"
                        width={50}
                        height={50}
                        className="rounded-full"
                    />
                    <span className="text-xl sm:text-2xl font-bold text-gray-800">
                        Bike Buddy
                    </span>
                </Link>
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <ul className="flex gap-6 text-gray-700">
                        <li>
                            <Link href="/dashboard" className="hover:text-gray-900 text-sm">
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link href="/bikes" className="hover:text-gray-900 text-sm">
                                Rent a Bike
                            </Link>
                        </li>
                        <li>
                            <Link href="/contact" className="hover:text-gray-900 text-sm">
                                Contact Us
                            </Link>
                        </li>
                    </ul>
                    {session ? (
                        <div className="flex items-center gap-4">
                            <span className="text-gray-800 text-sm">
                                Welcome, {user?.fullName || user?.username || user?.email}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => signOut()}
                                className="text-sm"
                            >
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <Link href="/sign-in">
                            <Button className="text-sm">Login</Button>
                        </Link>
                    )}
                </div>
                {/* Mobile Menu Toggle */}
                <div className="md:hidden">
                    <button onClick={toggleMenu} className="text-gray-800 focus:outline-none cursor-pointer" aria-label="Toggle menu">
                        {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Navigation Menu */}
            <nav className={`md:hidden bg-white shadow-md overflow-hidden transition-all duration-300 ${mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}>
                <div className="container mx-auto px-4 py-4 flex justify-center items-center flex-col ">
                    <ul className="flex flex-col gap-4 text-gray-700">
                        <li>
                            <Link
                                href="/dashboard"
                                onClick={() => setMobileMenuOpen(false)}
                                className="hover:text-gray-900 text-base"
                            >
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/bikes"
                                onClick={() => setMobileMenuOpen(false)}
                                className="hover:text-gray-900 text-base"
                            >
                                Rent a Bike
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/contact"
                                onClick={() => setMobileMenuOpen(false)}
                                className="hover:text-gray-900 text-base"
                            >
                                Contact Us
                            </Link>
                        </li>
                    </ul>
                    <div className="mt-4">
                        {session ? (
                            <div className="flex flex-col gap-2">
                                <span className="text-gray-800 text-base">
                                    Welcome, {user?.fullName || user?.username || user?.email}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        signOut();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="text-base"
                                >
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                                <Button className="text-base">Login</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default NavBar;
