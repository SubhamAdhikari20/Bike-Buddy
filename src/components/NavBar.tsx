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
        <nav className="bg-white shadow-md px-4 md:px-8 py-4 flex justify-between items-center">
            {/* Branding */}
            <Link href="/" className="flex items-center gap-2">
                <Image
                    src="/next.svg"
                    alt="Bike Buddy Logo"
                    width={100}
                    height={100}
                />
                <span className="text-2xl font-bold text-gray-800">Bike Buddy</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
                <ul className="flex gap-6 text-gray-700">
                    <li>
                        <Link href="/dashboard" className="hover:text-gray-900">
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link href="/bikes" className="hover:text-gray-900">
                            Rent a Bike
                        </Link>
                    </li>
                    <li>
                        <Link href="/contact" className="hover:text-gray-900">
                            Contact Us
                        </Link>
                    </li>
                </ul>
                {
                    session ? (
                        <div className="flex items-center gap-4">
                            <span className="text-gray-800">
                                Welcome, {user?.fullName || user?.username || user?.email}
                            </span>
                            <Button variant="outline" onClick={() => signOut()} className="text-sm">
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <Link href="/sign-in">
                            <Button className="text-sm">Login</Button>
                        </Link>
                    )
                }
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
                <button onClick={toggleMenu} className="text-gray-800 focus:outline-none">
                    {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-white shadow-md z-10 md:hidden">
                    <ul className="flex flex-col gap-4 p-4 text-gray-700">
                        <li>
                            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="hover:text-gray-900">
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link href="/bikes" onClick={() => setMobileMenuOpen(false)} className="hover:text-gray-900">
                                Rent a Bike
                            </Link>
                        </li>
                        <li>
                            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-gray-900">
                                Contact Us
                            </Link>
                        </li>
                    </ul>
                    {session ? (
                        <div className="flex flex-col gap-2">
                            <span className="text-gray-800">
                                Welcome, {user?.fullName || user?.username || user?.email}
                            </span>
                            <Button variant="outline" onClick={() => { signOut(); setMobileMenuOpen(false); }} className="text-sm">
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                            <Button className="text-sm cursor-pointer">Login</Button>
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
};

export default NavBar;
