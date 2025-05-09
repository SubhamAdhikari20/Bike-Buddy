// src/components/LiveTrackingMap.tsx
"use client";
import { useEffect, useState } from "react";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";

type TrackingData = {
    latitude: number;
    longitude: number;
    accuracy: number;
    speed: number;
    heading: number | null;
    timestamp: number;
};

const BikeIcon = L.icon({
    iconUrl: "/bike-icon.png", // Add a bike icon to your public folder
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const MapUpdater = ({ rideJourneyId }: { rideJourneyId: string }) => {
    const map = useMap();
    const [position, setPosition] = useState<LatLngExpression | null>(null);
    const [path, setPath] = useState<LatLngExpression[]>([]);

    useEffect(() => {
        const trackingRef = ref(db, `tracking/${rideJourneyId}`);
        const unsubscribe = onValue(trackingRef, (snapshot) => {
            const data: TrackingData = snapshot.val();
            if (data) {
                const newPos: LatLngExpression = [data.latitude, data.longitude];
                setPosition(newPos);
                setPath((prev) => [...prev, newPos]); // Add to path
                map.setView(newPos, map.getZoom()); // Center map on new position
            }
        });

        return () => unsubscribe();
    }, [rideJourneyId, map]);

    return position ? (
        <>
            <Marker position={position} icon={BikeIcon}>
                <Popup>
                    Speed: {(path[path.length - 1] as any)?.speed?.toFixed(2) || 0} m/s<br />
                    Time: {new Date().toLocaleTimeString()}
                </Popup>
            </Marker>
            <Polyline positions={path} color="blue" />
        </>
    ) : null;
};

type LiveTrackingMapProps = {
    rideJourneyId: string;
};

const LiveTrackingMap = ({ rideJourneyId }: LiveTrackingMapProps) => {
    return (
        <MapContainer
            center={[51.505, -0.09]} // Default center, updated by MapUpdater
            zoom={13}
            style={{ height: "400px", width: "100%" }}
            className="rounded-lg shadow-md"
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapUpdater rideJourneyId={rideJourneyId} />
        </MapContainer>
    );
};

export default LiveTrackingMap;