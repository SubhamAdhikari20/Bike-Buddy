// src/app/(app)/[username]/admin/bikes/[id]/page.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    IndianRupeeIcon,
    Star,
    CalendarDays,
    Loader2,
    Trash2,
} from "lucide-react";
import Link from "next/link";
import { Bike, Review, User } from "@prisma/client";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { bikeSchema } from "@/schemas/bikeSchema";
import StarRatings from "react-star-ratings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


type ReviewWithUser = Review & {
    customer: User;
};

type BikeWithReviewsProps = Bike & User & {
    avgRating?: number | null;
    reviewCount?: number | null;
};


const BikeDetails = () => {
    const { id } = useParams();
    const bikeId = Number(id);
    const { data: session, status } = useSession();

    const [bike, setBike] = useState<BikeWithReviewsProps | null>(null);
    const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);

    const fetchBike = async () => {
        try {
            const { data } = await axios.get<{ success: boolean; bike: BikeWithReviewsProps }>(`/api/bikes/${bikeId}`);
            if (data.success) {
                setBike(data.bike);
            }
            else {
                toast.error("Bike not found");
            }
        }
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message);
        }
    };

    const fetchReview = async () => {
        try {
            const { data } = await axios.get<{ success: boolean; reviews: ReviewWithUser[] }>(`/api/reviews?bikeId=${bikeId}`);

            if (data.success) {
                setReviews(data.reviews);
            }
            else {
                toast.error("Bike reviews not found");
            }
        }
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message);
        }
        finally {
            setReviewsLoading(false);
        }
    }

    useEffect(() => {
        if (bikeId) {
            fetchBike();
            fetchReview();
        }
    }, [bikeId]);

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
        );
    }

    if (!bike) {
        return <div className="p-6 text-center">Bike not found.</div>;
    }

    return (
        <section className="container mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Bikes Details</h1>
            {/* Hero */}
            <div className="grid gap-6 xl:grid-cols-2 grid-cols-1">
                <div className="relative w-full h-64 md:h-[400px] rounded-lg overflow-hidden">
                    {bike?.bikeImageUrl ? (
                        <Image
                            src={bike.bikeImageUrl}
                            alt={"Preview"}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-gray-100">
                            <span className="text-gray-500">No Image Available</span>
                        </div>
                    )}
                </div>

                <div className="grid gap-2 2xl:grid-cols-2">
                    <Card className="p-6 shadow-lg xl:block hidden">
                        <CardHeader>
                            <CardTitle className="text-xl xl:text-2xl">{bike?.bikeName}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 mt-5">
                            <div className="flex items-center space-x-2 text-gray-600">
                                <MapPin className="h-5 w-5" />
                                <span className="text-sm md:text-[17px]">{bike?.bikeLocation}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                                <IndianRupeeIcon className="h-5 w-5" />
                                <span className="font-bold text-[17px] md:text-xl">{bike?.pricePerDay.toString()} / day</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                                <CalendarDays className="h-5 w-5" />
                                <span className="text-sm md:text-[17px]">Type: {bike?.bikeType.toUpperCase()}</span>
                            </div>
                            <div title={`${Number(bike?.avgRating).toFixed(1)} / 5`} className="text-center flex flex-col gap-2 sm:flex-row items-center space-x-1">
                                <div className="cursor-pointer">
                                    <StarRatings
                                        rating={Number(bike?.avgRating)}
                                        starRatedColor="#FBBF24"
                                        numberOfStars={5}
                                        starDimension="25px"
                                        starSpacing="2px"
                                        starEmptyColor="#E5E7EB"
                                        starHoverColor="#FBBF24"
                                        name="bike-rating"
                                    />
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    {Number(bike?.avgRating).toFixed(1)} ({bike.reviewCount ?? 0})
                                </p>
                            </div>

                            <Link href={`/${session?.user.username}/admin/dashboard`}>
                                <Button
                                    className="mt-4 w-full"
                                >
                                    ← Back to Browse
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                <Card className="p-4 shadow-lg gap-2 xl:hidden">
                    <CardHeader className="flex justify-between">
                        <CardTitle className="text-xl md:text-2xl">{bike?.bikeName}</CardTitle>
                        <div title={`${Number(bike?.avgRating).toFixed(1)} / 5`} className="text-center flex flex-col gap-2 sm:flex-row items-center space-x-1">
                            <div className="cursor-pointer md:block hidden">
                                <StarRatings
                                    rating={Number(bike?.avgRating)}
                                    starRatedColor="#FBBF24"
                                    numberOfStars={5}
                                    starDimension="25px"
                                    starSpacing="2px"
                                    starEmptyColor="#E5E7EB"
                                    starHoverColor="#FBBF24"
                                    name="bike-rating"
                                />
                            </div>
                            <p className="text-sm text-gray-600 mt-1 md:block hidden">
                                {Number(bike?.avgRating).toFixed(1)} ({bike.reviewCount ?? 0})
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col lg:flex-row justify-between gap-2">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <MapPin className="h-5 w-5" />
                            <span className="text-sm md:text-[17px]">{bike?.bikeLocation}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <IndianRupeeIcon className="h-5 w-5" />
                            <span className="font-bold text-[17px] md:text-xl">{bike?.pricePerDay.toString()} / day</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <CalendarDays className="h-5 w-5" />
                            <span className="text-sm md:text-[17px]">Type: {bike?.bikeType.toUpperCase()}</span>
                        </div>
                        <div title={`${Number(bike?.avgRating).toFixed(1)} / 5`} className="text-center flex flex-col gap-2 sm:flex-row space-x-1 ">
                            <div className="cursor-pointer md:hidden">
                                <StarRatings
                                    rating={Number(bike?.avgRating)}
                                    starRatedColor="#FBBF24"
                                    numberOfStars={5}
                                    starDimension="25px"
                                    starSpacing="2px"
                                    starEmptyColor="#E5E7EB"
                                    starHoverColor="#FBBF24"
                                    name="bike-rating"
                                />
                            </div>
                            <p className="text-sm text-gray-600 mt-1 md:hidden">
                                {Number(bike?.avgRating).toFixed(1)} ({bike.reviewCount ?? 0})
                            </p>
                        </div>
                        <Link href={`/${session?.user.username}/admin/dashboard`}>
                            <Button
                                className="w-full"
                                size="sm"
                            >
                                ← Back to Browse
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

            </div>
            {/* Overview / Reviews Tabs */}
            <Tabs defaultValue="overview" className="space-y-4 mt-8">
                <TabsList className="flex gap-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="reviews">
                        Reviews ({reviews.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <p className="prose max-w-none text-gray-700">
                        {bike.bikeDescription}
                    </p>
                </TabsContent>

                <TabsContent value="reviews">
                    {reviewsLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
                        </div>
                    ) : reviews.length === 0 ? (
                        <p className="text-center text-gray-500">No reviews yet.</p>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((r) => (
                                <Card key={r.id} className="p-5 flex gap-4 items-start">
                                    <CardHeader className="w-full flex flex-col gap-2 p-0">
                                        <div className="flex gap-2 items-center">
                                            {/* Avatar */}
                                            <Avatar className="h-10 w-10 cursor-pointer border-1 border-gray-900">
                                                {(r.customer.profilePictureUrl) ? (
                                                    <AvatarImage src={r.customer.profilePictureUrl} alt={r.customer.fullName} />
                                                ) : (
                                                    <AvatarFallback>
                                                        {((r.customer.fullName ?? r.customer.username ?? "U")
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")
                                                            .toUpperCase())}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            <CardTitle className="font-semibold">{r.customer.fullName}</CardTitle>
                                        </div>

                                        <div title={`${Number(r.rating).toFixed(1)} / 5`} className="text-center flex flex-col gap-2 sm:flex-row items-center space-x-1">
                                            <div className="cursor-pointer">
                                                <StarRatings
                                                    rating={Number(r.rating)}
                                                    starRatedColor="#FBBF24"
                                                    numberOfStars={5}
                                                    starDimension="23px"
                                                    starSpacing="2px"
                                                    starEmptyColor="#E5E7EB"
                                                    starHoverColor="#FBBF24"
                                                    name={`review-${r.id}`}
                                                />
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {Number(r.rating).toFixed(1)}
                                            </p>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="w-full flex-1 p-0">
                                        {/* Review Body */}
                                        {r.reviewBikeImageUrl && (
                                            <div className="relative lg:w-175 w-full md:h-100 sm:h-65 h-55 mb-4 rounded overflow-hidden">
                                                <Image
                                                    src={r.reviewBikeImageUrl!}
                                                    alt="Review image"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <CardDescription className="mt-2 text-gray-800">{r.comment}</CardDescription>
                                    </CardContent>

                                    <CardFooter className="p-0 w-full flex items-center">
                                        <p className="mt-1 text-xs text-gray-500">
                                            {new Date(r.createdAt).toLocaleDateString()}
                                        </p>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </section>
    );
};

export default BikeDetails;
