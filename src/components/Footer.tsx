"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center md:justify-between space-y-6 md:space-y-0  py-7">
                <div className="flex items-center space-x-4">
                    <Link href="/">
                        <Image
                            src="/bike-buddy-logo.png"
                            alt="Bike Buddy Logo"
                            width={75}
                            height={75}
                        />
                    </Link>
                    <div className="text-center md:text-left">
                        <Link href="/" className="text-white text-2xl font-bold">
                            Bike Buddy
                        </Link>
                        <p className="text-sm mt-1">Your premium bike rental solution</p>
                    </div>
                </div>
                {/* Navigation Links */}
                <div className="flex flex-wrap justify-center space-x-6">
                    <Link href="/privacy" className="hover:text-white text-sm">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="hover:text-white text-sm">
                        Terms of Service
                    </Link>
                    <Link href="/contact" className="hover:text-white text-sm">
                        Contact Us
                    </Link>
                </div>
                {/* Social Media Icons */}
                <div className="flex space-x-4">
                    <a
                        href="https://facebook.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white"
                    >
                        <FaFacebook size={20} />
                    </a>
                    <a
                        href="https://twitter.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white"
                    >
                        <FaTwitter size={20} />
                    </a>
                    <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white"
                    >
                        <FaInstagram size={20} />
                    </a>
                </div>
            </div>
            <div className="border-t border-gray-700 py-7">
                <p className="text-center text-xs sm:text-sm">
                    &copy; {currentYear} Bike Buddy. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
