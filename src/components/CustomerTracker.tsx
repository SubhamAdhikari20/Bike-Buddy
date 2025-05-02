// src/components/CustomerTracker.tsx
"use client";
import { useEffect, useRef } from "react";
import { ref, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface Props {
    rideJourneyId: string;
    customerId?: string;
    isActive: boolean;
}

export default function CustomerTracker({ rideJourneyId, customerId, isActive }: Props) {
    const watcherIdRef = useRef<number | null>(null);
    useEffect(() => {
        if (!navigator.geolocation || !customerId) return;

        // Helper to write a position to Firebase
        const writePos = (lat: number, lng: number, ts: number) =>
            set(ref(db, `tracking/${rideJourneyId}`), { lat, lng, customerId, timestamp: ts });

        // 1) Try a quick, one-time position grab
        navigator.geolocation.getCurrentPosition(
            (pos) => writePos(pos.coords.latitude, pos.coords.longitude, pos.timestamp),
            (err) => {
                console.warn("Initial GPS failed:", err);
                // We’ll still try watchPosition below
            },
            { enableHighAccuracy: true, timeout: 20000 } // give it more time for the first lock
        );

        // 2) Then start watchPosition
        if (isActive) {
            watcherIdRef.current = navigator.geolocation.watchPosition(
                (pos) => writePos(pos.coords.latitude, pos.coords.longitude, pos.timestamp),
                (err) => {
                    toast.error(`GPS error (${err.code}): ${err.message}`);
                    // Stop watching on fatal errors
                    if (watcherIdRef.current !== null) {
                        navigator.geolocation.clearWatch(watcherIdRef.current);
                        watcherIdRef.current = null;
                    }
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,      
                    timeout: 30000,  
                }
            );
        }

        return () => {
            if (watcherIdRef.current !== null) {
                navigator.geolocation.clearWatch(watcherIdRef.current);
                watcherIdRef.current = null;
            }
        };
    }, [rideJourneyId, customerId, isActive]);

    return null;
}



// useEffect(() => {
//     if (!navigator.geolocation || !customerId || !isActive) return;

//     const watcher = navigator.geolocation.watchPosition(
//         (pos) => {
//             const { latitude: lat, longitude: lng } = pos.coords;
//             set(ref(db, `tracking/${rideJourneyId}`), { lat, lng, customerId, timestamp: pos.timestamp });
//         },
//         (err) => console.error("GPS error:", err),
//         {
//             enableHighAccuracy: true, maximumAge: 500, timeout: 10000,
//         }
//     );

//     return () => navigator.geolocation.clearWatch(watcher);
// }, [rideJourneyId, customerId, isActive]);