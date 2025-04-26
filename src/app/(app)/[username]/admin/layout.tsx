// src/app/(app)/[username]/dashboard/admin/layout.tsx
"use client"

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import SideBar from "@/components/admin/SideBar";
import { fetcher } from "@/lib/fetcher";
import useSWR from "swr"
import { User } from "next-auth";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
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

    useEffect(() => {
        // Check if session exists and user is admin
        if (status === "unauthenticated" || !session || session.user.role !== "admin") {
            toast.error("Access denied. Admins only.");
            router.replace("/");
        }
    }, [session, status, router]);

    return (
        <>
            <div className="flex gap-3 flex-col md:flex-row">
                <SideBar session={session} currentUser={dbUser} />
                <main className="min-h-screen p-2 md:p-2 w-full">{children}</main>
            </div>
        </>
    );
}
