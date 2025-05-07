// src/components/owner/OwnerRideMap.tsx
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import { onValue, ref, off } from "firebase/database";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

export default function OwnerRideMap({ rideJourneyId }: { rideJourneyId: number }) {
    const [pos, setPos] = useState<[number, number] | null>(null);

    useEffect(() => {
        const node = ref(db, `tracking/${rideJourneyId}`);
        const offFn = onValue(node, snap => {
            if (snap.exists()) {
                const { lat, lng, timestamp } = snap.val();
                setPos([lat, lng]);
            }
        });
        return () => off(node);
    }, [rideJourneyId]);

    return (
        <MapContainer center={pos || [0, 0]} zoom={pos ? 16 : 2} style={{ height: 400 }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {pos && (
                <Marker position={pos}>
                    <Tooltip permanent>{new Date().toLocaleTimeString()}</Tooltip>
                </Marker>
            )}
        </MapContainer>
    );
}
