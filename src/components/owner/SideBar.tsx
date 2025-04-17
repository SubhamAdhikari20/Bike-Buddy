// src/components/owner/SideBar.tsx
"use client"
import React, { useState } from 'react'
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaUserCircle, FaSignOutAlt, FaClipboardList, FaBiking, FaUserPlus, FaBars, FaTimes, FaLocationArrow } from 'react-icons/fa';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSession, signOut } from "next-auth/react";
import { User } from "next-auth";

interface CurrentUser {
    id?: string,
    fullName?: string;
    username?: string;
    email?: string;
    role?: string;
    profilePictureUrl?: string;
}

interface SideBarProps {
    currentUser: CurrentUser;
}

const SideBar: React.FC<SideBarProps> = ({ currentUser }) => {
    const { data: session } = useSession();
    const user = session?.user;

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleToggleProfile = () => setIsProfileOpen((prev) => !prev);
    const handleMobileToggle = () => setIsMobileOpen((prev) => !prev);

    return (
        <>
            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between bg-gray-800 text-gray-200 p-4 shadow-md">
                <Button onClick={handleMobileToggle} className="focus:outline-none">
                    {isMobileOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </Button>
                {/* <span className="font-bold">Dashboard</span> */}
                {/* <div></div> */}
            </header>

            {/* Sidebar - Visible on Desktop or Mobile when toggled */}
            <div className="flex">
                <aside
                    className={`${isMobileOpen ? "fixed inset-y-0 left-0 z-40" : "hidden"
                        } md:flex flex-col w-64 bg-gray-800 text-gray-200 p-4 shadow-md transition-transform duration-300 ease-in-out`}
                >
                    {/* Profile Section */}
                    <div className="relative mb-8">
                        <div
                            className="flex items-center w-full focus:outline-none "
                        >
                            <div onClick={handleToggleProfile} className="flex items-center gap-3 cursor-pointer">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage
                                        src={currentUser.profilePictureUrl || undefined}
                                        alt={currentUser.fullName || currentUser.username || "Admin"}
                                    />
                                    <AvatarFallback>
                                        {(currentUser.fullName || currentUser.username || "A")
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .slice(0, 2)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-sm sm:text-base">
                                    {currentUser.fullName || currentUser.username || currentUser.email || "Admin"}
                                </span>
                            </div>
                        </div>
                        {isProfileOpen && (
                            <div className="absolute top-14 left-0 w-full bg-gray-700 rounded shadow-lg z-50">
                                <ul>
                                    <li>
                                        <Link
                                            href="/owner/my-profile"
                                            className="flex items-center px-4 py-2 hover:bg-gray-600 w-full"
                                            onClick={() => setIsMobileOpen(false)}
                                        >
                                            <FaUserCircle className="mr-2" /> My Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <div className="flex items-center px-4 py-2 hover:bg-gray-600 w-full text-left cursor-pointer">
                                                    <FaSignOutAlt className="mr-2" /> Logout
                                                </div>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="rounded-lg">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will end your session and return you to the sign-in page.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                        onClick={() => {
                                                            signOut();
                                                            setIsMobileOpen(false);
                                                        }}
                                                    >
                                                        Logout
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-grow">
                        <ul className="space-y-4">
                            <li>
                                <Link
                                    href="/owner/bikes"
                                    className="flex items-center px-4 py-2 hover:bg-gray-700 rounded"
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <FaBiking className="mr-3" /> Bikes
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/owner/live-tracking"
                                    className="flex items-center px-4 py-2 hover:bg-gray-700 rounded"
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <FaLocationArrow className="mr-3" /> Track Live Bike
                                </Link>
                            </li>
                            {/* <li>
                                <Link
                                    href="/admin/rental-report"
                                    className="flex items-center px-4 py-2 hover:bg-gray-700 rounded"
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <FaClipboardList className="mr-3" /> Rental Report
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/admin/transactions"
                                    className="flex items-center px-4 py-2 hover:bg-gray-700 rounded"
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <FaClipboardList className="mr-3" /> Transaction Report
                                </Link>
                            </li> */}
                        </ul>
                    </nav>
                </aside >

                {/* Mobile Sidebar Overlay */}
                {
                    isMobileOpen && (
                        <div
                            className="fixed inset-0 bg-black opacity-50 z-30"
                            onClick={handleMobileToggle}
                        />
                    )
                }
            </div >
        </>
    );
};

export default SideBar;
