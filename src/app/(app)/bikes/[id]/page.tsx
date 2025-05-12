// src/app/(app)/bikes/[id]/page.tsx
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    CalendarDays,
    Loader2,
    IndianRupeeIcon,
} from "lucide-react";
import Link from "next/link";
import { Bike, DamageReport, DamageReportImages, Review, User } from "@prisma/client";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner";
import { signIn, useSession } from "next-auth/react";
import { bookingSchema } from "@/schemas/bookingSchema";
import { damageReportSchema } from "@/schemas/damageReportSchema";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import StarRatings from "react-star-ratings";


type BookingForm = z.infer<typeof bookingSchema>;
type DamageReportForm = z.infer<typeof damageReportSchema>;

type ReviewWithUser = Review & {
    customer: User;
};

type BikeWithReviewsProps = Bike & User & {
    avgRating?: number | null;
    reviewCount?: number | null;
};

type DamageReportProps = DamageReport & {
    images: DamageReportImages[];
    customer: User;
    bike: Bike;
    owner: User;
}

const BikeDetails = () => {
    const { id } = useParams();
    const bikeId = Number(id);
    const router = useRouter();
    const { data: session, status } = useSession();

    const [bike, setBike] = useState<BikeWithReviewsProps | null>(null);
    const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [openImage, setOpenImage] = useState<string | null>(null);

    useEffect(() => {
        if (!session || session.user.role !== "customer") {
            signIn("credentials", { redirect: false });
            router.replace("/sign-in");
            return;
        }
    }, [session]);

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

    // Booking form setup
    const form = useForm<BookingForm>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            customerId: session?.user.id ? Number(session.user.id) : 0,
            bikeId,
            ownerId: bike?.ownerId,
            startTime: "",
            endTime: "",
            totalPrice: 0,
        },
    });

    useEffect(() => {
        if (bike) {
            form.setValue("ownerId", bike.ownerId);
        }
    }, [bike, form]);

    const { watch, setValue, handleSubmit, control } = form;
    const [st, et] = [watch("startTime"), watch("endTime")];

    // recalc total price
    useEffect(() => {
        if (st && et && bike) {
            const s = new Date(st).getTime();
            const e = new Date(et).getTime();
            if (e > s) {
                const days = Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
                setValue("totalPrice", Number((days * Number(bike.pricePerDay)).toFixed(2)));
            }
        }
    }, [st, et, bike, setValue]);

    // Handle booking
    const onSubmit = async (data: BookingForm) => {
        if (status !== "authenticated" || session?.user.role !== "customer") {
            toast.error("You must be signed in as a customer to book");
            signIn("credentials", { redirect: false });
            router.replace("/sign-in");
            return;
        }
        if (new Date(data.endTime) <= new Date(data.startTime)) {
            return toast.error("End date must be after start date");
        }

        setBookingLoading(true);
        try {
            const res = await axios.post<ApiResponse & { booking?: { id: number; totalPrice: number } }>(
                "/api/bookings",
                data
            );
            if (!res.data.success || !res.data.booking) {
                throw new Error(res.data.message || "Booking failed");
            }
            router.push(
                `/payment/checkout?bookingId=${res.data.booking.id}&totalPrice=${res.data.booking.totalPrice}`
            );
        } catch (err: any) {
            toast.error(err.message || "Booking failed");
        } finally {
            setBookingLoading(false);
        }
    };

    const checkSignedIn = () => {
        if (status === "unauthenticated" || !session || session?.user.role !== "customer") {
            // kick to sign-in
            toast.error("Booking Failed!", { description: "You need to sign in for renting a bike" });
            signIn("credentials", { redirect: false });
            router.replace("/sign-in");
            return;
        }
    }

    if (!bike) {
        return <div className="p-6 text-center">Bike not found.</div>;
    }

    return (
        <section className="container mx-auto p-6">
            {/* Hero */}
            <div className="grid gap-6 lg:grid-cols-2">
                {bike.available &&
                    <>
                        <div className="relative w-full h-64 md:h-[400px] rounded-lg overflow-hidden">
                            {bike?.bikeImageUrl ? (
                                <Image
                                    src={bike.bikeImageUrl}
                                    alt={bike.bikeName}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center bg-gray-100">
                                    <span className="text-gray-500">No Image Available</span>
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2 md:grid-cols-2">
                            <Card className="p-6 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-xl xl:text-2xl">{bike?.bikeName}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <MapPin className="h-5 w-5" />
                                        <span>{bike?.bikeLocation}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <IndianRupeeIcon className="h-5 w-5" />
                                        <span>{bike?.pricePerDay.toString()} / day</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <CalendarDays className="h-5 w-5" />
                                        <span>Type: {bike?.bikeType.toUpperCase()}</span>
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

                                    <Link href="/bikes">
                                        <Button
                                            className="mt-4 w-full"
                                        >
                                            ← Back to Browse
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            <div className="w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(onSubmit)}
                                        className="space-y-4"
                                    >
                                        <FormField
                                            name="startTime"
                                            control={form.control}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Start Date &amp; Time</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            name="endTime"
                                            control={form.control}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>End Date &amp; Time</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            name="totalPrice"
                                            control={form.control}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex justify-between">
                                                        <FormLabel>Total Price (₹)</FormLabel>
                                                        <div className="text-sm">
                                                            ₹{bike?.pricePerDay.toString()}/day
                                                        </div>
                                                    </div>
                                                    <FormControl>
                                                        <Input {...field} disabled className="bg-gray-50" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full" onClick={() => checkSignedIn()}>
                                            {bookingLoading ? (
                                                <>
                                                    Booking… <Loader2 className="animate-spin ml-2 h-4 w-4" />
                                                </>
                                            ) : (
                                                "Book"
                                            )}
                                        </Button>
                                    </form>
                                </Form>
                            </div>
                        </div>
                    </>
                }

            </div>
            {/* Overview / Reviews Tabs */}
            <Tabs defaultValue="overview" className="space-y-4  mt-8">
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
                                        <div className="flex overflow-x-auto space-x-4 py-2">
                                            {r.reviewBikeImageUrl && (
                                                <Dialog open={openImage === r.reviewBikeImageUrl} onOpenChange={val => setOpenImage(val ? r.reviewBikeImageUrl : null)}>
                                                    <DialogTrigger asChild>
                                                        <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-lg overflow-hidden cursor-pointer">
                                                            <Image src={r.reviewBikeImageUrl!} width={160} height={160} className="object-cover w-full h-full" alt="damage" />
                                                        </div>
                                                    </DialogTrigger>
                                                    <DialogContent className="p-5 lg:max-w-fit! max-h-200 overflow-y-auto">
                                                        <DialogHeader>
                                                            <DialogTitle>Preview</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="w-full">
                                                            <Image src={r.reviewBikeImageUrl!} width={600} height={400} className="object-contain rounded" alt="damage-large" />
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                        </div>

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