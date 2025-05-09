// src/app/(customer)/rentals/[bookingId]/[rideJourneyId]/in-progress/page.tsx
"use client";

import CustomerTracker from "@/components/CustomerTracker";
import RideControls from "@/components/customer/RideControls";
import RideMap from "@/components/customer/RideMap";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { ApiResponse } from "@/types/ApiResponse";

interface RideInProgressPageParams {
    bookingId: string;
    rideJourneyId: string;
}

export default function RideInProgressPage() {
    const { bookingId, rideJourneyId } = useParams() as {
        bookingId: string;
        rideJourneyId: string;
    };

    const { data: session } = useSession();
    const [isActive, setIsActive] = useState(true);

    return (
        <section className="p-4 space-y-6">
            <h1 className="text-2xl mb-4">Your Ride Is Live</h1>

            {/* This kicks off geolocation → Firebase and then disappears */}
            <CustomerTracker
                rideJourneyId={rideJourneyId}
                customerId={session?.user.id}
                isActive={isActive}
            />

            {/* Live map view */}
            <RideMap rideJourneyId={rideJourneyId} />

            {/* Pause/Resume & End ride controls */}
            <RideControls bookingId={bookingId} rideJourneyId={rideJourneyId} onToggleActive={setIsActive} />
        </section>
    );
}
