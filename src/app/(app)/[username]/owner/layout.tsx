// src/app/(app)/[username]/owner/layout.tsx
"use client"

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import SideBar from "@/components/owner/SideBar";
import { fetcher } from "@/lib/fetcher";
import useSWR from "swr"
import { User } from "next-auth";

export default function OwnerLayout({
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
        if (status === "unauthenticated" || !session || session?.user.role !== "owner") {
            toast.error("Access denied. Owner only.");
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
