// src/components/customer/NavBar.tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User } from "next-auth"
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
} from "@/components/ui/menubar";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { FaBars, FaSignOutAlt, FaTimes } from "react-icons/fa";

interface CurrentUser {
    id?: string,
    fullName?: string;
    username?: string;
    email?: string;
    role?: string;
    profilePictureUrl?: string;
}

interface NavBarProps {
    currentUser: CurrentUser | null;
}

const NavBar: React.FC<NavBarProps> = ({ currentUser }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);

    return (
        <header className="sticky top-0 inset-x-0 z-50 bg-white shadow transition-all">
            <nav className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4">
                {/* Branding */}
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/bike-buddy-logo.png" alt="Logo" width={40} height={40} className="rounded-full" />
                    <span className="text-xl font-bold text-gray-800">Bike Buddy</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center space-x-6">
                    <Link href="/bikes" className="text-gray-700 hover:text-gray-900">Browse Bikes</Link>
                    <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">Dashboard</Link>
                    <Link href="/contact" className="text-gray-700 hover:text-gray-900">Contact</Link>

                    {currentUser ? (
                        <Menubar>
                            <MenubarMenu>
                                <MenubarTrigger className="focus:outline-none">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={currentUser.profilePictureUrl ?? undefined} alt={currentUser.fullName ?? currentUser.email ?? "User"} />
                                        <AvatarFallback>
                                            {(currentUser.fullName ?? currentUser.username ?? "U")
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </MenubarTrigger>
                                <MenubarContent align="end" className="w-40">
                                    <MenubarItem asChild>
                                        <Link href={`/${currentUser.username}/customer/my-profile`}>My Profile</Link>
                                    </MenubarItem>
                                    <MenubarItem onSelect={() => setLogoutOpen(true)}>Logout</MenubarItem>
                                </MenubarContent>
                            </MenubarMenu>
                        </Menubar>
                    ) : (
                        <Link href="/sign-in">
                            <Button size="sm">Login</Button>
                        </Link>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-gray-800"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
            </nav>

            {/* Mobile Menu */}
            <div
                className={`md:hidden bg-white overflow-hidden transition-[max-height,opacity] duration-300 ${mobileOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="px-4 pb-4 space-y-3">
                    <Link href="/bikes" onClick={() => setMobileOpen(false)} className="block">Browse Bikes</Link>
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block">Dashboard</Link>
                    <Link href="/contact" onClick={() => setMobileOpen(false)} className="block">Contact</Link>
                    {currentUser ? (
                        <Menubar>
                            <MenubarMenu>
                                <MenubarTrigger asChild>
                                    <button className="flex items-center space-x-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={currentUser.profilePictureUrl ?? undefined} alt={currentUser.fullName ?? "User"} />
                                            <AvatarFallback>
                                                {(currentUser.fullName ?? "U")
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span>{currentUser.fullName ?? currentUser.username}</span>
                                    </button>
                                </MenubarTrigger>
                                <MenubarContent className="w-40">
                                    <MenubarItem asChild>
                                        <Link href={`/${currentUser.username}/customer/dashboard`}>My Profile</Link>
                                    </MenubarItem>
                                    <MenubarItem onSelect={() => { setLogoutOpen(true); setMobileOpen(false); }}>Logout</MenubarItem>
                                </MenubarContent>
                            </MenubarMenu>
                        </Menubar>
                    ) : (
                        <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                            <Button className="w-full">Login</Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Confirm Logout */}
            <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
                <AlertDialogTrigger asChild>
                    {/* trigger is handled above */}
                    <div className="flex items-center px-4 py-2 hover:bg-gray-600 w-full text-left cursor-pointer">
                        <FaSignOutAlt className="mr-2" /> Logout
                    </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => signOut()}>Logout</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </header>
    );
};

export default NavBar;
