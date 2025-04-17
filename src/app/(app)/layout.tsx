// src/app/(app)/layout.tsx
"use client"

import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname() || ""

    const isDashboardRoute = /^\/[A-Za-z0-9]+\/(?:admin|owner|customer)(?:\/|$)/.test(
        pathname
    );

    return (
        <>
            {!isDashboardRoute && <NavBar />}

            <main className="min-h-screen bg-[size:20px_20px]">
                {children}
            </main>

            {!isDashboardRoute && <Footer />}
        </>
    );
};
