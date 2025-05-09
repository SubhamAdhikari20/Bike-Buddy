// src/components/live-track.tsx
"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LiveTrackingMap from "@/components/LiveTrackingMap";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";

type LiveTrackPageProps = {
    params: { bookingId: string; rideJourneyId: string };
};

const LiveTrackPage = ({ params }: LiveTrackPageProps) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAuthorization = async () => {
            try {
                const response = await axios.get(`/api/bookings/my-rentals/${params.bookingId}/${params.rideJourneyId}/verify`);
                if (response.data.success) {
                    setIsAuthorized(true);
                } else {
                    toast.error("You are not authorized to view this tracking.");
                    router.push("/"); // Redirect to home or dashboard
                }
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>;
                toast.error(axiosError.response?.data.message || "Error verifying access");
                router.push("/");
            } finally {
                setLoading(false);
            }
        };

        if (session) checkAuthorization();
    }, [session, params.bookingId, params.rideJourneyId, router]);

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin h-8 w-8 text-gray-600" />
            </div>
        );
    }

    if (!session || !isAuthorized) {
        return <p className="text-center p-4">Access denied. Please sign in or check your permissions.</p>;
    }

    return (
        <section className="container mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-4">Live Tracking</h1>
            <LiveTrackingMap rideJourneyId={params.rideJourneyId} />
        </section>
    );
};

export default LiveTrackPage;