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
} from "@/components/ui/card";
import { Button } from "../ui/button";
import { Bike } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import StarRatings from "react-star-ratings";


type BikeCardProps = {
    bike: Bike & {
        avgRating?: number | null;
        reviewCount?: number | null;
    };
    onRent: () => void;
}

const BikeCard = ({ bike, onRent }: BikeCardProps) => {
    const ratingValue = bike.avgRating ?? 0;

    return (
        <Card className="w-full max-w-md mx-auto shadow-lg overflow-hidden transition-shadow hover:shadow-xl py-0 gap-3">
            <CardHeader className="p-0">
                <div className="relative h-55 w-full overflow-hidden">
                    {bike.bikeImageUrl ? (
                        <Image
                            src={bike.bikeImageUrl}
                            alt={bike.bikeName}
                            fill
                            className="object-cover rounded"
                        />
                    ) : (
                        <div className="w-full h-48 sm:h-64 md:h-72 bg-gray-200 flex items-center justify-center rounded">
                            <span className="text-gray-500 text-sm">No Image Available</span>
                        </div>
                    )}
                </div>
                <CardTitle className="px-4 pt-2 text-xl font-semibold">{bike.bikeName}</CardTitle>
            </CardHeader>

            <CardContent className="text-gray-800 text-sm px-4">
                <CardDescription className="line-clamp-2">{bike.bikeDescription}</CardDescription>
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
            <CardFooter className="p-4! flex flex-col sm:flex-row gap-2 sm:justify-between items-center border-t">
                {/* ★★★★★ */}
                {/* <div className="flex items-center space-x-1">
                    {stars.map((s, idx) =>
                        s === "full" ? (
                            <Star key={idx} className="w-5 h-5 text-amber-500" />
                        ) : s === "half" ? (
                            <StarHalf key={idx} className="w-5 h-5 text-amber-500" />
                        ) : (
                            <StarOutline key={idx} className="w-5 h-5 text-amber-300" />
                        )
                    )}
                    <span className="ml-2 text-sm text-gray-600">
                        {ratingValue.toFixed(1)} ({bike.reviewCount})
                    </span>
                </div> */}

                <div title={`${ratingValue.toFixed(1)} / 5`} className="text-center flex flex-col gap-2 sm:flex-row items-center space-x-1">
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
                    <p className="text-sm text-gray-600 mt-1">
                        {ratingValue.toFixed(1)} ({bike.reviewCount ?? 0})
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" className="text-sm" onClick={onRent}>
                        Rent Now
                    </Button>
                    <Link href={`/bikes/${bike.id}`}>
                        <Button size="sm">View Details</Button>
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
};

export default BikeCard;
