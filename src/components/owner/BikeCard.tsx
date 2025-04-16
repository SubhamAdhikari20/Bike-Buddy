// src/components/owner/BikeCard.tsx
"use client";
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import Image from "next/image";
import { Bike } from "@prisma/client";
import { BikeImage } from "@prisma/client";

export type BikeWithImages = Bike & {
    images?: BikeImage[];
};

interface BikeCardProps {
    bike: BikeWithImages;
    onEdit: (bike: BikeWithImages) => void;
    onDelete: (bikeId: number) => void;
}

const BikeCard = ({ bike, onEdit, onDelete }: BikeCardProps) => {
    return (
        <Card className="w-full max-w-md mx-auto my-4 shadow">
            <CardHeader className="p-4">
                <CardTitle className="text-xl font-semibold">{bike.bikeName}</CardTitle>
                <CardDescription>{bike.bikeDescription}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
                {bike.images && bike.images.length > 0 ? (
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
                    <p className="text-sm"><span className="font-semibold">Location:</span> {bike.bikeLocation}</p>
                    <p className="text-sm"><span className="font-semibold">Price/Hour:</span> ${bike.pricePerHour.toString()}</p>
                </div>
            </CardContent>
            <CardFooter className="p-4 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(bike)}>
                    <Edit className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(bike.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /><span className="hidden sm:inline">Delete</span>
                </Button>
            </CardFooter>
        </Card>
    );
};

export default BikeCard;
