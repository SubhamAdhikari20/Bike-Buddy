// src/app/(app)/[username]/owner/dashboard/page.tsx
"use client";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { ref, onValue, off } from "firebase/database";
import { db } from "@/lib/firebase";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icon paths (adjust if needed)
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/images/marker-icon-2x.png",
    iconUrl: "/leaflet/images/marker-icon.png",
    shadowUrl: "/leaflet/images/marker-shadow.png",
});

type Position = { lat: number; lng: number; timestamp: number };

function FlyTo({ pos }: { pos: Position | null }) {
    const map = useMap();
    useEffect(() => {
        if (pos) map.flyTo([pos.lat, pos.lng], 15, { animate: true });
    }, [pos, map]);
    return null;
}

export default function OwnerDashboard({ params }: { params: { username: string } }) {
    // TODO: derive the active bookingId (e.g. from your API or dashboard state)
    const bookingId = "<current-booking-id>";

    const [position, setPosition] = useState<Position | null>(null);

    useEffect(() => {
        const trackRef = ref(db, `tracking/${bookingId}`);
        onValue(trackRef, snap => {
            const data = snap.val();
            if (data?.lat && data?.lng) {
                setPosition({ lat: data.lat, lng: data.lng, timestamp: data.timestamp });
            }
        });
        return () => off(trackRef);
    }, [bookingId]);

    return (
        <section className="p-4">
            <h2 className="text-xl font-semibold mb-2">Live GPS Tracking</h2>
            <div className="w-full h-80 md:h-[600px] rounded-lg overflow-hidden shadow">
                <MapContainer
                    center={position ? [position.lat, position.lng] : [0, 0]}
                    zoom={13}
                    style={{ height: "400px", width: "100%" }}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {position && (
                        <>
                            <Marker position={[position.lat, position.lng]} />
                            <FlyTo pos={position} />
                        </>
                    )}
                </MapContainer>
            </div>
        </section>
    );
}




























// "use client";
// import React, { useCallback, useState } from 'react';
// import { GoogleMap, useJsApiLoader, LoadScript } from '@react-google-maps/api'


// const containerStyle = {
//     width: '400px',
//     height: '400px',
// }

// const center = {
//     lat: -3.745,
//     lng: -38.523,
// }

// const OwnerDashboard = () => {
//     const { isLoaded } = useJsApiLoader({
//         id: 'google-map-script',
//         googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'MY_API_KEY',
//     })

//     const [map, setMap] = useState<google.maps.Map | null>(null);

//     const onLoad = useCallback(function callback(map: google.maps.Map) {
//         // This is just an example of getting and using the map instance!!! don't just blindly copy!
//         const bounds = new window.google.maps.LatLngBounds(center)
//         map.fitBounds(bounds)

//         setMap(map)
//     }, [])

//     const onUnmount = React.useCallback(function callback(map: google.maps.Map) {
//         setMap(null)
//     }, [])

//     return isLoaded ? (
//         <GoogleMap
//             mapContainerStyle={containerStyle}
//             center={center}
//             zoom={10}
//             onLoad={onLoad}
//             onUnmount={onUnmount}
//         >
//             {/* Child components, such as markers, info windows, etc. */}
//             <></>
//         </GoogleMap>
//     ) : (
//         <></>
//     )
// };

// export default OwnerDashboard;


/**
 * Instructions:
 * 1. Install the Google Maps package:
 *    npm install @react-google-maps/api
 *
 * 2. Create a file at src/app/(app)/[username]/owner/dashboard/demoData.ts
 *    and paste the demoPath array above.
 *
 * 3. Replace your existing OwnerDashboard component with the code above
 *    (save it as page.tsx in the same folder).
 *
 * 4. Add your Google Maps API key to an environment variable:
 *    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY
 *
 * 5. Run your app. The map will display a demo route with a marker
 *    that moves along the path every second.
 *
 * 6. (Optional) Customize the demoPath array for different routes,
 *    adjust the interval timing in useEffect, or add info windows
 *    to display speed/timestamp if needed.
 */
