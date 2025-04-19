// src/app/(app)/layout.tsx
"use client"

import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <NavBar />
            <main className="min-h-screen bg-[size:20px_20px]">
                {children}
            </main>
            <Footer />
        </>
    );
};
