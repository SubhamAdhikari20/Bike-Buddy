"use client";
import React, { useEffect } from "react";
import { KnockFeedProvider, KnockProvider } from "@knocklabs/react";
import "@knocklabs/react/dist/index.css";
import { useSession } from "next-auth/react";

export default function KnockClientWrapper({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();

    // Validate environment variables at runtime
    const apiKey = process.env.NEXT_PUBLIC_KNOCK_API_KEY;
    const feedId = process.env.NEXT_PUBLIC_KNOCK_FEED_ID;

    if (!apiKey) {
        console.error("NEXT_PUBLIC_KNOCK_API_KEY is missing. Please set it in your .env file.");
        return <>{children}</>;
    }
    if (!feedId) {
        console.error("NEXT_PUBLIC_KNOCK_FEED_ID is missing. Please set it in your .env file.");
        return <>{children}</>;
    }

    useEffect(() => {
        if (status === "authenticated" && session?.user?.id) {
            // Call the API route to update the Knock user
            fetch("/api/notifications/knock/update-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: session.user.id,
                    fullName: session.user.fullName || session.user.username || "User",
                    email: session.user.email,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (!data.success) {
                        console.error("Failed to update Knock user:", data.message);
                    }
                })
                .catch((err) => console.error("Error updating Knock user:", err));
        }
    }, [status, session]);

    if (status !== "authenticated" || !session?.user?.id) {
        return <>{children}</>;
    }

    return (
        <KnockProvider apiKey={apiKey} userId={session.user.id}>
            <KnockFeedProvider feedId={feedId}>
                {children}
            </KnockFeedProvider>
        </KnockProvider>
    );
}