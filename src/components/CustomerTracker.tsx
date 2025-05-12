// src/components/CustomerTracker.tsx
"use client";
import { useEffect, useRef } from 'react';
import { ref, push, set } from 'firebase/database';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

interface Props {
    rideJourneyId: string;
    customerId?: string;
    isActive: boolean;
}

export default function CustomerTracker({ rideJourneyId, customerId, isActive }: Props) {
    const watcherIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isActive || !navigator.geolocation || !customerId) {
            // stop if paused or unmounted
            if (watcherIdRef.current !== null) {
                navigator.geolocation.clearWatch(watcherIdRef.current);
                watcherIdRef.current = null;
            }
            return;
        }

        let lastWrite = 0;

        const writePos = (lat: number, lng: number, timestamp: number) => {
            const now = Date.now();
            if (now - lastWrite < 1000) return; // throttle to 1 write/sec
            lastWrite = now;

            // Write latest
            set(ref(db, `tracking/${rideJourneyId}/latest`), { lat, lng, timestamp, customerId });
            // Append point
            push(ref(db, `tracking/${rideJourneyId}/points`), { lat, lng, timestamp, customerId });
        };

        // Watch position
        watcherIdRef.current = navigator.geolocation.watchPosition(
            (pos) => writePos(pos.coords.latitude, pos.coords.longitude, pos.timestamp),
            (err) => {
                toast.error(`GPS error (${err.code}): ${err.message}`);
                if (watcherIdRef.current !== null) {
                    navigator.geolocation.clearWatch(watcherIdRef.current);
                    watcherIdRef.current = null;
                }
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 }
        );

        return () => {
            if (watcherIdRef.current !== null) {
                navigator.geolocation.clearWatch(watcherIdRef.current);
                watcherIdRef.current = null;
            }
        };
    }, [rideJourneyId, customerId, isActive]);

    return null;
}