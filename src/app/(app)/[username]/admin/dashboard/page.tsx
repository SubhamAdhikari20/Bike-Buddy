// src/app/(app)/[username]/admin/dashboard/page.tsx
"use client";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import axios, { AxiosError } from "axios";
import { Bike, Booking, User } from "@prisma/client"
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import BookedBikeCard from "@/components/admin/BookedBikeCard";
import { useRouter } from "next/navigation";


type RentalWithBikeAndCustomerAndOwner = Booking & {
    bike: Bike & {
        owner: User;
    };
    customer: User;
    rideJourneyId: number | null;
};

const AdminDashboard = () => {
    const { data: session, status } = useSession();
    const [rentals, setRentals] = useState<RentalWithBikeAndCustomerAndOwner[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!session || session.user.role !== "admin") {
            signIn("credentials", { redirect: false });
            router.replace("/sign-in");
            return;
        }
    }, [session]);

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

    return (
        <section className="px-4 py-2 md:px-6 md:py-2 mx-auto">
            <div className="sticky md:top-0 top-16 inset-x-0 z-25 py-4 md:py-4 bg-white dark:bg-gray-800 flex flex-col gap-3 sm:flex-row items-center justify-between border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="overflow-x-auto py-4 rounded-md">
                    {rentals.length === 0 ? (
                        <p className="p-4 text-gray-600">You have no active customer rentals.</p>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                            {rentals.map(rental => (
                                <BookedBikeCard key={rental.id} booking={rental} currentUser={currentUser} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default AdminDashboard;
