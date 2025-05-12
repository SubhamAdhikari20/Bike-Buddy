// src/components/customer/RideControls.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";

interface RideControlsProps {
    bookingId: string;
    rideJourneyId: string;
    onToggleActive?: (active: boolean) => void;
}

export default function RideControls({ bookingId, rideJourneyId, onToggleActive }: RideControlsProps) {
    const [isActive, setIsActive] = useState(true);
    const [isEnding, setIsEnding] = useState(false);
    const router = useRouter();

    const toggleTracking = () => {
        const next = !isActive;
        setIsActive((prev) => !prev);
        onToggleActive?.(next);
    };

    const endRide = async () => {
        setIsEnding(true);
        try {
            const response = await axios.post(`/api/bookings/my-rentals/${bookingId}/${rideJourneyId}/complete`);
            if (!response.data.success) {
                toast.error(response.data.message || "Failed to end the ride");
            }
            router.replace(`/rentals/${bookingId}/${rideJourneyId}/complete`);
        }
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message);
        }
        finally {
            setIsEnding(false);
        }
    };

    return (
        <div className="flex gap-4 justify-center">
            <Button
                onClick={toggleTracking}
                disabled={isEnding}
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
        </div>
    );
}
