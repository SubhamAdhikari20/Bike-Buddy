// src/components/CustomerTracker.tsx
"use client";
import { useEffect } from "react";
import { ref, set } from "firebase/database";
import { db } from "@/lib/firebase";

interface Props { 
    bookingId: string; 
    customerId?: string;
    isActive:  boolean; 
}

export default function CustomerTracker({ bookingId, customerId, isActive }: Props) {
    useEffect(() => {
        if (!navigator.geolocation || !customerId || !isActive) return;

        const watcher = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                set(ref(db, `tracking/${bookingId}`), { lat, lng, customerId, timestamp: pos.timestamp });
            },
            (err) => console.error("GPS error:", err),
            { enableHighAccuracy: true, maximumAge: 1000 }
        );

        return () => navigator.geolocation.clearWatch(watcher);
    }, [bookingId, customerId, isActive]);

    return null;
}
