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
import { BikeImage } from "@prisma/client";
import Image from "next/image";


type BikeWithImages = Bike & {
    images?: BikeImage[];
};

type BikeCardProps = {
    bike: BikeWithImages;
}

const BikeCard = ({ bike }: BikeCardProps) => {

    return (
        <Card className="w-full max-w-md mx-auto my-4 shadow">
            <CardHeader className="p-4">
                <CardTitle className="text-xl font-semibold">{bike.bikeName}</CardTitle>
                <CardDescription>{bike.bikeDescription}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
                {bike.images?.length ? (
                    <div className="relative w-full h-48 sm:h-64 md:h-72">
                        <Image
                            src={bike.images[0].url}
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
                <div className="mt-4 space-y-1">
                    <p className="text-sm">
                        <span className="font-semibold">Location:</span> {bike.bikeLocation}
                    </p>
                    <p className="text-sm">
                        <span className="font-semibold">Price/Hour:</span> ${bike.pricePerHour.toString()}
                    </p>
                </div>
            </CardContent>
            <CardFooter className="p-4 flex justify-end">
                <Button variant="outline" className="text-sm">
                    View Details
                </Button>
            </CardFooter>
        </Card>
    );
};

export default BikeCard;
