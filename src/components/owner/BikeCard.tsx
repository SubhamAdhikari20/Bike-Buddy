// src/components/owner/BikeCard.tsx
"use client";
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import Image from "next/image";
import { Bike, User } from "@prisma/client";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

interface BikeCardProps {
    bike: Bike;
    currentUser: User;
    onEdit: () => void;
    onDelete: () => void;
}

const BikeCard = ({ bike, currentUser, onEdit, onDelete }: BikeCardProps) => {
    return (
        <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow py-0 gap-3">
            <CardHeader className="p-0">
                <div className="relative h-55 w-full overflow-hidden">
                    {bike.bikeImageUrl ? (
                        <Image
                            src={bike.bikeImageUrl}
                            alt={bike.bikeName}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground">No Image</span>
                        </div>
                    )}
                </div>
                <CardTitle className="px-4 pt-2 text-xl font-semibold">{bike.bikeName}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 text-sm">
                {/* <h3 className="font-semibold text-lg">{bike.bikeName}</h3> */}
                <CardDescription className="line-clamp-2">{bike.bikeDescription}</CardDescription>
                <div className="flex justify-between mt-3 items-center">
                    <span className="font-bold text-2xl">₹ {bike.pricePerDay.toString()}/day</span>
                    <div className="flex flex-col gap-1">
                        <div>
                            <span className="font-semibold">Bike Type:</span>
                            <span className="text-muted-foreground"> {bike.bikeType}</span>
                        </div>
                        <div>
                            <span className="font-semibold">Location:</span>
                            <span className="text-muted-foreground"> {bike.bikeLocation}</span>
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4! flex justify-between border-t">
                <Link href={`/${currentUser?.username}/owner/bikes/${bike.id}`}>
                    <Button size="sm">View Details</Button>
                </Link>
                <div className="flex gap-4">
                    <Button variant="outline" size="sm" onClick={onEdit}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the bike
                                    <strong> "{bike.bikeName}"</strong> and remove their data from the system.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={onDelete}>
                                    Confirm Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardFooter>
        </Card>
    );
};

export default BikeCard;
