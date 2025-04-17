// src/app/(app)/[username]/dashboard/admin/layout.tsx
"use client"

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import SideBar from "@/components/admin/SideBar";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;
        // Check if session exists and user is admin
        if (!session || session.user.role !== "admin") {
            toast.error("Access denied. Admins only.");
            router.replace("/sign-in");
        }
    }, [session, status, router]);

    if (status === "loading" || !session) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
        );
    }

    return (
        <>
            <div className="flex gap-3 flex-col md:flex-row">
                <SideBar currentUser={session.user} />
                <main className="min-h-screen p-2 md:p-2 w-full">{children}</main>
            </div>
        </>
    );
}
