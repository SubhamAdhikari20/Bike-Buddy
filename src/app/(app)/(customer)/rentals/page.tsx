// src/app/(customer)/rentals/page.tsx
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import RideMap from '@/components/customer/RideMap';
import axios, { AxiosError } from "axios";
import { Bike, Booking, User } from "@prisma/client"
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner";
import Image from "next/image";
import BookedBikeCard from "@/components/customer/BookedBikeCard";

type RentalWithBikeAndCustomerAndOwner = Booking & {
    bike: Bike & { owner: User };
    customer: User;
};


export default function MyRentalsPage() {
    const { data: session, status } = useSession();
    const [rentals, setRentals] = useState<RentalWithBikeAndCustomerAndOwner[]>([]);
    const [loading, setLoading] = useState(false);

    const userId = session?.user.id;
    const fetchRentals = async () => {
        setLoading(true);
        try {
            const response = await axios.get<{ success: boolean, rentals: RentalWithBikeAndCustomerAndOwner[] }>(`api/bookings/my-rentals?customerId=${userId}`);
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
        return <p className="p-4 text-center">Please <Link href="/sign-in" className="text-blue-600 underline">sign in</Link> to view your rentals.</p>;
    }

    return (
        <section className="container mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-4">My Rentals</h1>
            {rentals.length === 0 ? (
                <p>You have no active rentals.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rentals.map(rental => (
                        <BookedBikeCard key={rental.id} booking={rental} />
                    ))}
                </div>
            )}
        </section>
    );
}
