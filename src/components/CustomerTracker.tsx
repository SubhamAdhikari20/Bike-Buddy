// src/components/CustomerTracker.tsx
"use client";
import { useEffect } from "react";
import { ref, set } from "firebase/database";
import { db } from "@/lib/firebase";

interface Props {
    rideJourneyId: string;
    customerId?: string;
    isActive: boolean;
}

export default function CustomerTracker({ rideJourneyId, customerId, isActive }: Props) {
    useEffect(() => {
        if (!navigator.geolocation || !customerId || !isActive) return;

        const watcher = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                set(ref(db, `tracking/${rideJourneyId}`), { lat, lng, customerId, timestamp: pos.timestamp });
            },
            (err) => console.error("GPS error:", err),
            { enableHighAccuracy: true, maximumAge: 1000 }
        );

        return () => navigator.geolocation.clearWatch(watcher);
    }, [rideJourneyId, customerId, isActive]);

    return null;
}
