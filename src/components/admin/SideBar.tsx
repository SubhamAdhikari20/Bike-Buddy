// src/components/admin/SideBar.tsx
"use client"
import React, { useEffect, useRef, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { FaUserCircle, FaSignOutAlt, FaClipboardList, FaLocationArrow, FaUserPlus, FaBars, FaTimes, FaHome } from 'react-icons/fa';
import { signOut } from "next-auth/react";
import { Session, User } from "next-auth";
import {
    NotificationFeedPopover,
    NotificationIconButton,
} from "@knocklabs/react";
import PortalWrapper from "../PortalWrapper";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner";


interface SideBarProps {
    session: Session | null;
    currentUser?: User | null;
}

const SideBar: React.FC<SideBarProps> = ({ session, currentUser }) => {
    // const [user, setUser] = useState<User | null>(null);
    // const userId = Number(currentUser?.id);

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [popupPosition, setPopupPosition] = useState<'top' | 'bottom'>('bottom');
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

    const popupRef = useRef<HTMLDivElement>(null);
    const [feedOpen, setFeedOpen] = useState(false);
    const notifButtonRef = useRef<HTMLButtonElement>(null);

    const handleToggleProfile = () => setIsProfileOpen((prev) => !prev);
    const handleMobileToggle = () => setIsMobileOpen((prev) => !prev);

    if (session && !currentUser) {
        signOut();
        return null;
    }


    // const fetchUser = async () => {
    //     try {
    //         const { data } = await axios.get<{ success: boolean; user: User }>(`/api/auth/edit-profile/${userId}`);
    //         setUser(data.user);
    //     }
    //     catch (error) {
    //         const axiosError = error as AxiosError<ApiResponse>;
    //         toast.error(axiosError.response?.data.message);
    //     }
    // };

    // useEffect(() => {
    //     if (userId) {
    //         fetchUser();
    //     }
    // }, [userId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                !logoutDialogOpen && popupRef.current && !popupRef.current.contains(event.target as Node)
            ) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [logoutDialogOpen]);

    useEffect(() => {
        if (popupRef.current && isProfileOpen) {
            const rect = popupRef.current.getBoundingClientRect();
            const sidebarHeight = window.innerHeight;
            const spaceBelow = sidebarHeight - rect.bottom;
            const spaceAbove = rect.top;

            if (spaceBelow < 150 && spaceAbove > 150) {
                setPopupPosition('top');
            } else {
                setPopupPosition('bottom');
            }
        }
    }, [isProfileOpen]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileOpen(false); // Close mobile sidebar on desktop
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <>
            {/* Mobile Header */}
            <header className="sticky top-0 inset-x-0 z-500 md:hidden flex items-center justify-between bg-gray-800 text-gray-200 p-4 shadow-md">
                <Button onClick={handleMobileToggle} className="focus:outline-none">
                    {isMobileOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </Button>
            </header>

            {/* Sidebar - Visible on Desktop or Mobile when toggled */}
            <div className="flex bg-gray-800">
                <aside
                    // className={`${isMobileOpen ? "fixed top-0 inset-y-0 left-0 z-40" : "hidden"
                    //     } md:static md:flex flex-col w-64 bg-gray-800 text-gray-200 p-4 shadow-md transition-transform duration-300 ease-in-out`}

                    className={`
                        ${isMobileOpen ? "fixed top-0 inset-y-0 left-0 z-500" : "hidden"}
                        md:sticky md:top-0 md:h-screen md:overflow-y-auto md:flex
                        flex-col w-64 bg-gray-800 text-gray-200 p-4 shadow-md
                        transition-transform duration-300 ease-in-out
                        `}
                >
                    <div
                        className="flex items-center justify-center w-full focus:outline-none mb-5"
                    >
                        <Link href="/">
                            <Image
                                src="/bike-buddy-logo.png"
                                alt="Bike Buddy Logo"
                                width={75}
                                height={75}
                                className="rounded-full"
                            />
                        </Link>
                        {isMobileOpen && (
                            <Button
                                onClick={handleMobileToggle}
                                className="md:hidden absolute top-4 right-4 p-2 rounded bg-gray-700 hover:bg-gray-600 text-white z-50"
                            >
                                <FaTimes size={20} />
                            </Button>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-grow">
                        <ul className="space-y-4">
                            <li>
                                <Link
                                    href="/"
                                    className="flex items-center px-4 py-2 hover:bg-gray-700 rounded"
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <FaHome className="mr-3" /> Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${currentUser?.username}/admin/owners`}
                                    className="flex items-center px-4 py-2 hover:bg-gray-700 rounded"
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <FaUserPlus className="mr-3" /> Owners
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${currentUser?.username}/admin/live-tracking`}
                                    className="flex items-center px-4 py-2 hover:bg-gray-700 rounded"
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <FaLocationArrow className="mr-3" /> Track Live Bike
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${currentUser?.username}/admin/rental-report`}
                                    className="flex items-center px-4 py-2 hover:bg-gray-700 rounded"
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <FaClipboardList className="mr-3" /> Rental Report
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${currentUser?.username}/admin/transaction-report`}
                                    className="flex items-center px-4 py-2 hover:bg-gray-700 rounded"
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <FaClipboardList className="mr-3" /> Transaction Report
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Profile Section */}
                    <div className="relative mb-7">
                        {isProfileOpen && (
                            <div
                                ref={popupRef}
                                className="absolute bottom-13 left-0 w-full bg-gray-700 rounded-xl shadow-lg z-50"
                            >
                                <ul>
                                    <li>
                                        <Link
                                            href={`/${currentUser?.username}/admin/my-profile`}
                                            className="flex items-center px-4 py-2 hover:bg-gray-600 hover:rounded-t-xl w-full"
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                setIsMobileOpen(false);
                                            }}
                                        >
                                            <FaUserCircle className="mr-2" /> My Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                                            <AlertDialogTrigger asChild>
                                                <div className="flex items-center px-4 py-2 hover:bg-gray-600 hover:rounded-b-xl w-full text-left cursor-pointer" onClick={() => setLogoutDialogOpen(true)}>
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
                                                    <AlertDialogCancel
                                                        onClick={() => {
                                                            setLogoutDialogOpen(false);
                                                            setIsProfileOpen(false);
                                                            setIsMobileOpen(false);
                                                        }}
                                                    >
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                        onClick={() => {
                                                            signOut();
                                                            setLogoutDialogOpen(false);
                                                            setIsProfileOpen(false);
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

                        <div onClick={handleToggleProfile} className="flex items-center gap-3 cursor-pointer">
                            <Avatar className="h-10 w-10 border-1 border-amber-50">
                                <AvatarImage
                                    src={currentUser?.profilePictureUrl || undefined}
                                    alt={currentUser?.fullName || currentUser?.username || "Owner"}
                                />
                                <AvatarFallback>
                                    {(currentUser?.fullName || currentUser?.username || "O")
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .slice(0, 2)
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-sm sm:text-base">
                                {currentUser?.fullName || currentUser?.username || currentUser?.email || "Admin"}
                            </span>
                        </div>
                    </div>

                    {currentUser ? (
                        <div className="flex items-center gap-4 justify-center">
                            <NotificationIconButton
                                ref={notifButtonRef}
                                onClick={() => setFeedOpen((v) => !v)}
                            />
                            {feedOpen && (
                                <PortalWrapper>
                                    <NotificationFeedPopover
                                        buttonRef={notifButtonRef as React.RefObject<HTMLElement>}
                                        isVisible={true}
                                        onClose={() => setFeedOpen(false)}
                                    />
                                </PortalWrapper>
                            )}
                        </div>
                    ) : null}
                </aside>

                {/* Mobile Sidebar Overlay */}
                {isMobileOpen && (
                    <div
                        className="md:hidden inset-0 bg-black opacity-50 z-30"
                        onClick={handleMobileToggle}
                    />
                )}
            </div>
        </>
    );
};

export default SideBar;
