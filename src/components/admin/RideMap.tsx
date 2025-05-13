// src/components/admin/RideMap.tsx
"use client";
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { onValue, off, ref, onChildAdded } from 'firebase/database';
import { db } from '@/lib/firebase';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import L, { Tooltip } from 'leaflet';
import 'leaflet-rotatedmarker';

// Define the custom marker icon
const customMarkerIcon = new L.Icon({
    iconUrl: '/icons/motorbike.png',
    iconSize: [35, 35],
    iconAnchor: [7, 14],
    popupAnchor: [0, -64],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [30, 30],
    shadowAnchor: [8, 16],
});

function FlyTo({ position }: { position: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        if (position) map.flyTo(position, 16, { duration: 0.5 });
    }, [position, map]);
    return null;
}

export default function RideMap({ rideJourneyId }: { rideJourneyId: string }) {
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [path, setPath] = useState<[number, number][]>([]);
    const markerRef = useRef<L.Marker>(null!);

    useEffect(() => {
        const pointsRef = ref(db, `tracking/${rideJourneyId}/points`);
        onChildAdded(pointsRef, (snap) => {
            const { lat, lng } = snap.val();
            setPath((prev) => [...prev, [lat, lng]]);
        });
        return () => off(pointsRef);
    }, [rideJourneyId]);

    useEffect(() => {
        const latestRef = ref(db, `tracking/${rideJourneyId}/latest`);
        onValue(latestRef, (snap) => {
            if (snap.exists()) {
                const { lat, lng } = snap.val();
                setPosition([lat, lng]);
                setPath((prev) => [...prev, [lat, lng]]);
            }
        });
        return () => off(latestRef);
    }, [rideJourneyId]);

    return (
        <div className="w-full h-150 rounded-lg overflow-hidden shadow-lg">
            <MapContainer
                center={position || [27.7, 85.3]}
                zoom={12}

                scrollWheelZoom={false}
                className="w-full h-full"
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {position && (
                    <>
                        <Marker
                            position={position}
                            ref={markerRef}
                            icon={customMarkerIcon}
                        />
                        <Polyline positions={path} weight={4} />
                        <FlyTo position={position} />
                    </>
                )}
            </MapContainer>
        </div>
    );
}