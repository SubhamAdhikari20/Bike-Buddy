// src/app/(customer)/rentals/[bookingId]/in-progress/page.tsx
"use client";

import CustomerTracker from "@/components/CustomerTracker";
import RideControls from "@/components/customer/RideControls";
import RideMap from "@/components/customer/RideMap";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface RideInProgressPageParams {
    bookingId: string;
}

export default function RideInProgressPage({ params }: { params: RideInProgressPageParams }) {
    const { bookingId } = params;
    const { data: session } = useSession(); // NextAuth
    const [isActive, setIsActive] = useState(true);

    return (
        <section className="p-4 space-y-6">
            <h1 className="text-2xl mb-4">Your Ride Is Live</h1>

            {/* This kicks off geolocation → Firebase and then disappears */}
            <CustomerTracker
                bookingId={bookingId}
                customerId={session?.user.id}
                isActive={isActive}
            />

            {/* Live map view */}
            <RideMap bookingId={bookingId} />

            {/* Pause/Resume & End ride controls */}
            <RideControls bookingId={bookingId} />
        </section>
    );
}
