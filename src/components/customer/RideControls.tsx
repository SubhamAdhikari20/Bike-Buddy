// src/components/customer/RideControls.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RideControlsProps {
    bookingId: string;
    rideJourneyId: string;
}

export default function RideControls({ bookingId, rideJourneyId }: RideControlsProps) {
    const [isActive, setIsActive] = useState(true);
    const [isEnding, setIsEnding] = useState(false);
    const router = useRouter();

    const toggleTracking = () => {
        setIsActive((prev) => !prev);
    };

    const endRide = async () => {
        setIsEnding(true);
        try {
            const res = await fetch(`/api/bookings/my-rentals/${bookingId}/${rideJourneyId}/complete`, { method: "POST" });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            router.replace(`/my-rentals/${bookingId}/complete`);
        } catch (e: any) {
            toast.error(e.message);
        }
        finally {

            setIsEnding(false);
        }
    };

    return (
        <div className="flex gap-4 justify-center">
            <Button
                onClick={toggleTracking}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                {isActive ? 'Pause Tracking' : 'Resume Tracking'}
            </Button>
            <Button
                onClick={endRide}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={isEnding}
            >
                {isEnding ? 'Ending...' : 'End Ride'}
            </Button>
            <div>
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. Suscipit, nam!
            </div>
        </div>
    );
}
