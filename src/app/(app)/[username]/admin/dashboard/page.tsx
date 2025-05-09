// src/app/(app)/[username]/admin/dashboard/page.tsx
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
import BookedBikeCard from "@/components/admin/BookedBikeCard";

type RentalWithBikeAndCustomerAndOwner = Booking & {
    bike: Bike & {
        owner: User;
    };
    customer: User;
};

const AdminDashboard = () => {
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
            const response = await axios.get<{ success: boolean, rentals: RentalWithBikeAndCustomerAndOwner[] }>("/api/bookings/customer-rentals/admin");
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

    // return (
    //     <section className="space-y-4">
    //         <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
    //         <p className="text-gray-600">
    //             Welcome to the admin dashboard. Use the sidebar to navigate through the different sections.
    //         </p>
    //     </section>
    // );
};

export default AdminDashboard;
