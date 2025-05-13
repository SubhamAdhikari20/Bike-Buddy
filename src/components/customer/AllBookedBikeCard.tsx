// src/components/customer/BookedBookedBikeCard.tsx
"use client";
import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Button } from "../ui/button";
import { X } from "lucide-react";
import { Bike, Booking, User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import StarRatings from "react-star-ratings";

type BookedBikeCardProps = {
    booking: Booking & {
        bike: Bike & {
            owner: User;
            avgRating?: number | null;
            reviewCount?: number | null;
        };
        customer: User;
    };
};

const AllBookedBikeCard = ({ booking }: BookedBikeCardProps) => {
    const router = useRouter();
    const ratingValue = booking.bike.avgRating ?? 0;
    const reviewCount = booking.bike.reviewCount ?? 0;

    const startJourney = async () => {
        try {
            const response = await axios.post(`/api/bookings/my-rentals/${booking.id}/start`);
            if (!response.data.success) {
                toast.error(response.data.message || "Failed to start ride");
            }
            router.replace(`/rentals/${booking.id}/${response.data.rideData.id}/in-progress/${response.data.rideData.bikeId}`);
        }
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message);
        }
    };


    return (
        <Card className="w-full max-w-md mx-auto shadow-lg overflow-hidden transition-shadow hover:shadow-xl py-0 gap-3">
            <CardHeader className="p-0">
                <div className="relative h-55 w-full overflow-hidden">
                    {booking.bike.bikeImageUrl ? (
                        <Image
                            src={booking.bike.bikeImageUrl}
                            alt={booking.bike.bikeName}
                            fill
                            className="object-cover rounded"
                        />
                    ) : (
                        <div className="w-full h-48 sm:h-64 md:h-72 bg-gray-200 flex items-center justify-center rounded">
                            <span className="text-gray-500 text-sm">No Image Available</span>
                        </div>
                    )}
                </div>
                <CardTitle className="px-4 pt-2 text-xl font-semibold">{booking.bike.bikeName}</CardTitle>
            </CardHeader>

            <CardContent className="text-gray-800 text-sm px-4">
                <CardDescription className="line-clamp-2">{booking.bike.bikeDescription}</CardDescription>
                <div className="mt-4 space-y-1 flex justify-between items-center">
                    {/* <span className="font-bold text-2xl"> ₹ {bike.pricePerDay.toString()}/day</span> */}
                    <div className="flex flex-col gap-1">
                        <div>
                            <span className="font-semibold">Started: </span>
                            <span>{new Date(booking.startTime).toDateString()}</span>
                        </div>
                        <div>
                            <span className="font-semibold">Total Price: </span>
                            <span>₹ {booking.totalPrice}</span>
                        </div>
                        <div>
                            <span className="font-semibold">Owner: </span>
                            <span>{booking.bike.owner.fullName}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <div>
                            <span className="font-semibold">End Date: </span>
                            <span>{new Date(booking.endTime).toDateString()}</span>
                        </div>
                        <div>
                            <span className="font-semibold">Location: </span>
                            <span>{booking.bike.bikeLocation}</span>
                        </div>
                        <div>
                            <span className="font-semibold">Status: </span>
                            <span>{booking.status}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4! flex gap-2 justify-between border-t">
                <div title={`${ratingValue.toFixed(1)} / 5`} className="text-center flex sm:flex-row flex-col gap-2 items-center">
                    <div className="cursor-pointer">
                        <StarRatings
                            rating={ratingValue}
                            starRatedColor="#FBBF24"
                            numberOfStars={5}
                            starDimension="23px"
                            starSpacing="2px"
                            starEmptyColor="#E5E7EB"
                            starHoverColor="#FBBF24"
                            name="bike-rating"
                        />
                    </div>
                    <p className="text-sm text-gray-600">
                        {ratingValue.toFixed(1)} ({reviewCount})
                    </p>
                </div>

                <div className="flex gap-2">
                    <Link href={`/rentals/${booking.id}/bikes/${booking.bike.id}`}>
                        <Button size="sm">View Details</Button>
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
};

export default AllBookedBikeCard;
