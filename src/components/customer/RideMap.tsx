// src/components/customer/RideMap.tsx
"use client";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icon paths (Leaflet)
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/images/marker-icon-2x.png",
    iconUrl: "/leaflet/images/marker-icon.png",
    shadowUrl: "/leaflet/images/marker-shadow.png",
});

interface RideMapProps {
    bookingId: string;
}

export default function RideMap({ bookingId }: RideMapProps) {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) return;

        const watcher = navigator.geolocation.watchPosition(
            (pos) => {
                setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            console.error,
            { enableHighAccuracy: true, maximumAge: 1000 }
        );
        return () => navigator.geolocation.clearWatch(watcher);
    }, []);

    return (
        <div className="w-full h-60 md:h-96 rounded-lg overflow-hidden shadow-lg">
            <MapContainer
                center={position ? [position.lat, position.lng] : [0, 0]}
                zoom={15}
                scrollWheelZoom={false}
                className="w-full h-full"
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {position && <Marker position={[position.lat, position.lng]} />}
            </MapContainer>
        </div>
    );
}
