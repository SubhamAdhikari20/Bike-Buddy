// src/app/(app)/(customer)/layout.tsx
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated" || !session || session.user.role !== "customer") {
            router.replace("/");
        }
    }, [status, router]);

    if (status === "loading" || !session) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin h-10 w-10" />
            </div>
        );
    }

    return <>{children}</>;
}
