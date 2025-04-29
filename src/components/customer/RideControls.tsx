// src/components/customer/RideControls.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface RideControlsProps {
    bookingId: string;
}

export default function RideControls({ bookingId }: RideControlsProps) {
    const [isActive, setIsActive] = useState(true);
    const [isEnding, setIsEnding] = useState(false);
    const router = useRouter();

    const toggleTracking = () => {
        setIsActive((prev) => !prev);
    };

    const endRide = async () => {
        setIsEnding(true);
        // 1. Persist final path and cleanup RTDB
        await fetch('/api/tracking/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId }),
        });
        // 2. Update booking status in MySQL via your bookings API
        await fetch(`/api/bookings/${bookingId}/complete`, { method: 'POST' });
        // 3. Redirect to summary page
        router.push(`/rentals/${bookingId}/complete`);
    };

    return (
        <div className="flex gap-4 justify-center">
            <button
                onClick={toggleTracking}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                {isActive ? 'Pause Tracking' : 'Resume Tracking'}
            </button>
            <button
                onClick={endRide}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={isEnding}
            >
                {isEnding ? 'Ending...' : 'End Ride'}
            </button>
        </div>
    );
}
