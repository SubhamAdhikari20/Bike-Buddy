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

type BookedBikeCardProps = {
    booking: Booking & {
        bike: Bike & { owner: User };
        customer: User;
    };
};

const BookedBikeCard = ({ booking }: BookedBikeCardProps) => {

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
            <CardFooter className="p-4! flex gap-2 justify-end border-t">
                <Link href={`/rentals/${booking.id}/in-progress`} key={booking.id}>
                    <Button className="text-sm bg-amber-500 hover:bg-amber-600">
                        Start Journey
                    </Button>
                </Link>
                <Link href={`/bikes/${booking.bike.id}`}>
                    <Button >View Details</Button>
                </Link>
            </CardFooter>
        </Card>
    );
};

export default BookedBikeCard;
