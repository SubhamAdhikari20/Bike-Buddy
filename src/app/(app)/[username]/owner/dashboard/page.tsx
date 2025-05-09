// src/app/(app)/[username]/owner/dashboard/page.tsx
"use client";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import axios, { AxiosError } from "axios";
import { Bike, Booking, User } from "@prisma/client"
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import BookedBikeCard from "@/components/owner/BookedBikeCard";


type RentalWithBikeAndCustomerAndOwner = Booking & {
    bike: Bike & { owner: User };
    customer: User;
};

export default function OwnerDashboard() {
    const { data: session, status } = useSession();
    const [rentals, setRentals] = useState<RentalWithBikeAndCustomerAndOwner[]>([]);
    const [loading, setLoading] = useState(false);

    let currentUser: any;
    if (session?.user) {
        currentUser = session.user;
    }
    const userId = session?.user.id;
    const fetchRentals = async () => {
        setLoading(true);
        try {
            const response = await axios.get<{ success: boolean, rentals: RentalWithBikeAndCustomerAndOwner[] }>(`/api/bookings/customer-rentals/owner?ownerId=${userId}`);
            if (response.data.success) {
                setRentals(response.data.rentals);
            }
        }
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message);
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (userId) {
            fetchRentals();
        }
    }, [userId]);

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-gray-600" />
            </div>
        );
    }

    if (!session) {
        return (
            <p className="p-4 text-center">
                Please <Link href="/sign-in" className="text-blue-600 underline">sign in</Link> to view your customer who have rented your bikes.
            </p>
        );
    }

    return (
        <section className="container mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-3">Dashboard</h1>
            {rentals.length === 0 ? (
                <p>You have no active customer rentals.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rentals.map(rental => (
                        <BookedBikeCard key={rental.id} booking={rental} currentUser={currentUser} />
                    ))}
                </div>
            )}
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
