// src/app/(app)/layout.tsx -> Main Layout for app.
"use client"

import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname() || ""

    const isDashboardRoute = /^\/[A-Za-z0-9]+\/(?:admin|owner)(?:\/|$)/.test(
        pathname
    );

    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
        );
    }

    return (
        <>
            {!isDashboardRoute && <NavBar currentUser={session?.user ?? null} />}

            <main className="min-h-screen bg-[size:20px_20px]">
                {children}
            </main>

            {!isDashboardRoute && <Footer />}
        </>
    );
};
