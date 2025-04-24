// src/components/customer/BikeCard.tsx
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
import { Bike } from "@prisma/client";
import Image from "next/image";

type BikeCardProps = {
    bike: Bike;
    onRent: () => void;
}

const BikeCard = ({ bike, onRent }: BikeCardProps) => {

    return (
        <Card className="w-full max-w-md mx-auto shadow-lg overflow-hidden transition-shadow hover:shadow-xl py-0 gap-4">
            <CardHeader className="p-0">
                <div className="relative h-55 w-full overflow-hidden">
                    {bike.bikeImageUrl ? (
                        <div className="relative w-full h-48 sm:h-64 md:h-72">
                            <Image
                                src={bike.bikeImageUrl}
                                alt={bike.bikeName}
                                fill
                                className="object-cover rounded"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-48 sm:h-64 md:h-72 bg-gray-200 flex items-center justify-center rounded">
                            <span className="text-gray-500 text-sm">No Image Available</span>
                        </div>
                    )}
                </div>
                <CardTitle className="px-4 pt-2 text-xl font-semibold">{bike.bikeName}</CardTitle>
            </CardHeader>

            <CardContent className="text-gray-800 text-sm px-4">
                <CardDescription>{bike.bikeDescription}</CardDescription>
                <div className="mt-4 space-y-1 flex justify-between items-center">
                    <span className="font-bold text-2xl"> ₹ {bike.pricePerDay.toString()}/day</span>
                    <div className="flex flex-col gap-1">
                        <div>
                            <span className="font-semibold">Bike Type:</span>
                            <span> {bike.bikeType}</span>

                        </div>
                        <div>

                            <span className="font-semibold">Location:</span>
                            <span> {bike.bikeLocation}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4! flex gap-2 justify-end border-t">
                <Button variant="outline" className="text-sm" onClick={onRent}>
                    Rent Now
                </Button>
            </CardFooter>
        </Card>
    );
};

export default BikeCard;
