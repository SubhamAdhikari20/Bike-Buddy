// src/app/(app)/layout.tsx -> Main Layout for app.
"use client"

import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { signOut, useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import useSWR from "swr"
import { User } from "next-auth";

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
    const userId = session?.user?.id;

    const { data: dbUser, error, isLoading: userLoading } = useSWR<User | null>(
        userId ? `/api/auth/edit-profile/${userId}` : null,
        fetcher,
        {
            refreshInterval: 3_000,
            revalidateOnFocus: true,
        }
    );

    if (status === "loading" || (session && userLoading)) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
        );
    }

    if (session && error) {
        signOut();
        return null;
    }

    return (
        <>
            {!isDashboardRoute && <NavBar session={session} currentUser={dbUser} />}

            <main className="min-h-screen bg-[size:20px_20px]">
                {children}
            </main>

            {!isDashboardRoute && <Footer currentUser={dbUser} />}
        </>
    );
};
