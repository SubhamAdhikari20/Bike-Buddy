// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import './globals.css';
import AuthProvider from "./context/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import KnockClientWrapper from "./../components/KnockClientWrapper";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Bike Buddy",
    description: "Bike Buddy is a premium, state-of-the-art bike rental platform designed for urban explorers and cycling enthusiasts. This repository contains the complete source code for our dynamic, feature-packed website that transforms the way you rent bikes—making it fast, secure, and stylish.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <AuthProvider>
                <KnockClientWrapper>
                    <body
                        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
                    >
                        {children}
                        <Toaster />
                    </body>
                </KnockClientWrapper>
            </AuthProvider>
        </html>
    );
}
