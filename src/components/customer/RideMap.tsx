// src/components/customer/RideMap.tsx
"use client";
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { onValue, off, ref } from 'firebase/database';
import { db } from '@/lib/firebase';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';

import L from 'leaflet';

// const bikeIcon = new L.Icon({
//     iconUrl: '/icons/moterbike.svg',
//     iconRetinaUrl: '/icons/moterbike.svg',
//     iconSize: [40, 40],
//     iconAnchor: [20, 20]
// });

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
                        <Marker position={position} ref={markerRef}/>
                        <Polyline positions={path} weight={4} />
                        <FlyTo position={position} />
                    </>
                )}
            </MapContainer>
            {!position && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                    <p className="text-gray-700">Awaiting GPS…</p>
                </div>
            )}
        </div>

        // <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
        //     <MapContainer center={position || [27.7, 85.3]} zoom={12} scrollWheelZoom={false} className="w-full h-full">
        //         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        //         {position && (
        //             <>
        //                 <Marker position={position} icon={bikeIcon} ref={markerRef} />
        //                 <Polyline positions={path} weight={4} />
        //                 <FlyTo position={position} />
        //             </>
        //         )}
        //     </MapContainer>
        //     {!position && (
        //         <div className="absolute inset-0 flex items-center justify-center bg-white/80">
        //             <p className="text-gray-700 font-medium">Awaiting GPS…</p>
        //         </div>
        //     )}
        // </div>
    );
}












// "use client";
// import { useState, useEffect } from "react";
// import { MapContainer, TileLayer, Marker, useMap, Tooltip } from "react-leaflet";
// import { off, onValue, ref } from "firebase/database";
// import { db } from "@/lib/firebase";
// import "leaflet/dist/leaflet.css";
// import "leaflet-defaulticon-compatibility";
// import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
// // import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
// import L from "leaflet";

// const geoIcon = new L.Icon({
//     iconUrl: "/icons/marker-geolocate.svg",
//     iconRetinaUrl: "/icons/marker-geolocate@2x.svg",
//     iconSize: [30, 30],
//     iconAnchor: [15, 30],
// });


// interface RideMapProps {
//     rideJourneyId: string;
// }

// function FlyTo({ position }: { position: [number, number] | null }) {
//     const map = useMap();
//     useEffect(() => {
//         if (position) map.flyTo(position, 16, { duration: 1 });
//     }, [position, map]);
//     return null;
// }


// export default function RideMap({ rideJourneyId }: RideMapProps) {
//     const [position, setPosition] = useState<[number, number] | null>(null);
//     const [timestamp, setTimestamp] = useState<number | null>(null);
//     const [active, setActive] = useState(false);

//     useEffect(() => {
//         const node = ref(db, `tracking/${rideJourneyId}`);
//         onValue(node, (snap) => {
//             if (snap.exists()) {
//                 const { lat, lng, timestamp } = snap.val();
//                 setPosition([lat, lng]);
//                 setTimestamp(timestamp);
//                 setActive(true);
//             } else {
//                 // ride ended or no data yet
//                 setPosition(null);
//                 setTimestamp(null);
//                 setActive(false);
//             }
//         });
//         return () => off(node);
//     }, [rideJourneyId]);

//     return (
//         <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
//             <MapContainer
//                 center={position || [27.7, 85.3]}  // fallback to Kathmandu
//                 zoom={position ? 16 : 12}
//                 scrollWheelZoom={false}
//                 className="w-full h-full"
//             >
//                 <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

//                 {position && (
//                     <>
//                         <Marker position={position} icon={geoIcon}>
//                             <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
//                                 {new Date(timestamp!).toLocaleTimeString()}
//                             </Tooltip>
//                         </Marker>
//                         <FlyTo position={position} />
//                     </>
//                 )}
//             </MapContainer>

//             {!active && (
//                 <div className="absolute inset-0 flex items-center justify-center bg-white/80">
//                     <p className="text-gray-700 font-medium">
//                         {position ? "Tracking has ended." : "Awaiting GPS…"}
//                     </p>
//                 </div>
//             )}
//         </div>
//     );
// }
