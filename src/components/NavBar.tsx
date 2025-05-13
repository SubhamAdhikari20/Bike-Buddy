// src/components/NavBar.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaSignOutAlt, FaBars, FaTimes, FaUserCircle, FaCog, FaUser } from 'react-icons/fa';
import { signOut } from "next-auth/react";
import { Session, User } from "next-auth";
import {
    NotificationFeedPopover,
    NotificationIconButton,
} from "@knocklabs/react";
import PortalWrapper from "@/components/PortalWrapper";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner";


interface NavBarProps {
    session: Session | null;
    currentUser?: User | null;
}

const NavBar: React.FC<NavBarProps> = ({ session, currentUser }) => {
    // const [user, setUser] = useState<User | null>(null);
    // const userId = Number(currentUser?.id);

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const [feedOpen, setFeedOpen] = useState(false);
    const notifButtonRef = useRef<HTMLButtonElement>(null);

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

    //     if (currentUser && (currentUser?.role !== "customer")) {
    //         signOut();
    //     }

    // }, []);

    // Close desktop popover on outside click
    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (
                !logoutDialogOpen &&
                menuRef.current &&
                !menuRef.current.contains(e.target as Node)
            ) {
                setDesktopMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, [logoutDialogOpen]);

    const toggleMenu = () => {
        setMobileMenuOpen((prev) => !prev);
    };

    return (
        <header className="sticky top-0 inset-x-0 z-500 bg-white shadow-md transition-all">
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
                            <Link href="/" className="hover:text-gray-900 text-sm">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/bikes" className="hover:text-gray-900 text-sm">
                                Rent a Bike
                            </Link>
                        </li>
                        {currentUser ? (
                            <li>
                                <Link href="/rentals" className="hover:text-gray-900 text-sm">
                                    My Rentals
                                </Link>
                            </li>
                        ) : null}
                        <li>
                            <Link href="/about" className="hover:text-gray-900 text-sm">
                                About
                            </Link>
                        </li>
                        <li>
                            <Link href="/contact" className="hover:text-gray-900 text-sm">
                                Contact
                            </Link>
                        </li>
                        {currentUser ? (
                            <div className="flex items-center gap-4">
                                <NotificationIconButton
                                    ref={notifButtonRef}
                                    onClick={() => setFeedOpen((v) => !v)}
                                />
                                {feedOpen && (
                                    <PortalWrapper>
                                        <NotificationFeedPopover
                                            buttonRef={notifButtonRef as React.RefObject<HTMLElement>}
                                            isVisible={feedOpen}
                                            onClose={() => setFeedOpen(false)}

                                        />
                                    </PortalWrapper>
                                )}
                            </div>
                        ) : null}
                    </ul>
                    {currentUser ? (
                        <div className="relative" ref={menuRef}>
                            <Avatar className="h-10 w-10 cursor-pointer border-1 border-gray-900" onClick={() => setDesktopMenuOpen((v) => !v)}>
                                {(currentUser?.profilePictureUrl) ? (
                                    <AvatarImage src={currentUser?.profilePictureUrl} alt={currentUser?.fullName} />
                                ) : (
                                    <AvatarFallback>
                                        {((currentUser?.fullName ?? currentUser?.username ?? "U")
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase())}
                                    </AvatarFallback>
                                )}
                            </Avatar>

                            {/* popover */}
                            {desktopMenuOpen && (
                                <div className="absolute right-0 mt-2 w-70 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden z-50">
                                    <div className="px-4 py-3 text-center">
                                        <Avatar className="mx-auto h-12 w-12 border-1 border-gray-900">
                                            {currentUser.profilePictureUrl ? (
                                                <AvatarImage
                                                    src={currentUser.profilePictureUrl}
                                                    alt={currentUser.fullName}
                                                />
                                            ) : (
                                                <AvatarFallback>
                                                    {((currentUser.fullName ?? currentUser.username ?? "U")
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .toUpperCase())}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                        <h1 className="mt-2 font-bold text-gray-900">
                                            {currentUser.fullName}
                                        </h1>
                                        <h2 className="mt-2 font-semibold text-gray-800">
                                            {currentUser.username}
                                        </h2>
                                        <p className="text-sm text-gray-500 truncate">
                                            {currentUser.email}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-1 px-3 pb-3">
                                        <Link
                                            href="/my-profile"
                                            className="flex items-center justify-center gap-2 px-2 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded hover:bg-gray-100"
                                            onClick={() => {
                                                setDesktopMenuOpen(false);
                                                setMobileMenuOpen(false);
                                            }}
                                        >
                                            <FaUser /> My Profile
                                        </Link>
                                        <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    className="flex items-center justify-center gap-2 px-2 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded hover:bg-gray-100"
                                                    onClick={() => setLogoutDialogOpen(true)}
                                                >
                                                    <FaSignOutAlt /> Logout
                                                </Button>
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
                                                            setDesktopMenuOpen(false);
                                                            setMobileMenuOpen(false);
                                                        }}
                                                    >
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                        onClick={() => {
                                                            signOut();
                                                            setLogoutDialogOpen(false);
                                                            setDesktopMenuOpen(false);
                                                            setMobileMenuOpen(false);
                                                        }}
                                                    >
                                                        Logout
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>

                                    <div className="border-t px-4 py-2 text-center text-xs text-gray-400">
                                        Secured by <strong>Bike Buddy</strong>
                                    </div>
                                </div>
                            )}

                            {/* <Button variant="outline" size="sm" onClick={() => signOut()}>
                                <FaSignOutAlt className="inline mr-1" /> Logout
                            </Button> */}
                        </div>
                    ) : (
                        <Link href="/sign-in">
                            <Button size="sm">Login</Button>
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
                <div className="container mx-auto px-4 py-4 flex justify-center items-center flex-col gap-4">
                    <ul className="flex flex-col gap-4 text-gray-700">
                        <li>
                            <Link
                                href="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className="hover:text-gray-900 text-base"
                            >
                                Home
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
                        {currentUser ? (
                            <li>
                                <Link href="/rentals" className="hover:text-gray-900 text-sm">
                                    My Rentals
                                </Link>
                            </li>
                        ) : null}
                        <li>
                            <Link
                                href="/about"
                                onClick={() => setMobileMenuOpen(false)}
                                className="hover:text-gray-900 text-sm">
                                About
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/contact"
                                onClick={() => setMobileMenuOpen(false)}
                                className="hover:text-gray-900 text-base"
                            >
                                Contact
                            </Link>
                        </li>
                    </ul>

                    {currentUser ? (
                        <>
                            <Link href="/my-profile" onClick={toggleMenu} className="flex items-center gap-2">
                                <Avatar className="h-8 w-8 cursor-pointer border-1 border-gray-900">
                                    {(currentUser?.profilePictureUrl) ? (
                                        <AvatarImage src={currentUser?.profilePictureUrl} alt={currentUser?.fullName} />
                                    ) : (
                                        <AvatarFallback>
                                            {((currentUser?.fullName ?? currentUser?.username ?? "U")
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .toUpperCase())}
                                        </AvatarFallback>
                                    )}
                                </Avatar> My profile
                            </Link>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="flex items-center gap-2">
                                        <FaSignOutAlt /> Logout
                                    </Button>
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
                                                toggleMenu();
                                            }}
                                        >
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                            onClick={() => { signOut(); toggleMenu(); }}
                                        >
                                            Logout
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>


                        </>
                    ) : (
                        <Link href="/sign-in" onClick={toggleMenu}>
                            <Button className="w-full">Login</Button>
                        </Link>
                    )}

                    {/* <div className="mt-4">
                        <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                            <Button className="text-base">Login</Button>
                        </Link>
                    </div> */}
                </div>
            </nav>
        </header>
    );
};

export default NavBar;
