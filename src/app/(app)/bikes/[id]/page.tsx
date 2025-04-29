// src/app/(app)/bikes/[id]/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    DollarSign,
    Star,
    CalendarDays,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import { Bike } from "@prisma/client";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner";
import { signIn, useSession } from "next-auth/react";
import { bookingSchema } from "@/schemas/bookingSchema";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";


type BookingForm = z.infer<typeof bookingSchema>;

const BikeDetails = () => {
    const { id } = useParams();
    const bikeId = Number(id);
    const router = useRouter();
    const { data: session, status } = useSession();

    const [bike, setBike] = useState<Bike | null>(null);
    // const [loading, setLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);

    const fetchBike = async () => {
        try {
            const { data } = await axios.get<{ success: boolean; bike: Bike }>(`/api/bikes/${bikeId}`);

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

    useEffect(() => {
        if (bikeId) {
            fetchBike();
        }
    }, [bikeId]);

    // 2) Booking form setup
    const form = useForm<BookingForm>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            customerId: session?.user.id ? Number(session.user.id) : 0,
            bikeId,
            startTime: "",
            endTime: "",
            totalPrice: 0,
        },
    });
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

    // 3) Handle booking
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


    // if (loading) {
    //     return <div className="p-6 text-center">Loading…</div>;
    // }

    if (!bike) {
        return <div className="p-6 text-center">Bike not found.</div>;
    }

    return (
        <section className="container mx-auto p-6">
            {/* Hero */}
            <div className="grid gap-6 lg:grid-cols-2">
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
                                <DollarSign className="h-5 w-5" />
                                <span>₹ {bike?.pricePerDay.toString()} / day</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                                <CalendarDays className="h-5 w-5" />
                                <span>Type: {bike?.bikeType.toUpperCase()}</span>
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

                    {bike.available &&
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
                    }
                </div>

                {/* <Card className="p-6 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl">{bike?.bikeName}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <MapPin className="h-5 w-5" />
                            <span>{bike?.bikeLocation}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <DollarSign className="h-5 w-5" />
                            <span>₹ {bike?.pricePerDay.toString()} / day</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <CalendarDays className="h-5 w-5" />
                            <span>Type: {bike?.bikeType.toUpperCase()}</span>
                        </div>
                        <Link href="/bikes">
                            <Button
                                className="mt-4 w-full"
                            >
                                Back to Browse
                            </Button>
                        </Link>
                    </CardContent>
                </Card> */}
            </div>

            {/* Tabs: Overview & Reviews */}
            <Tabs defaultValue="overview" className="mt-8">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    {/* <TabsTrigger value="reviews">Reviews ({bike?.reviews.length})</TabsTrigger> */}
                </TabsList>

                <TabsContent value="overview" className="mt-4">
                    <p className="prose max-w-none text-gray-600 font-semibold">
                        {bike?.bikeDescription}
                    </p>
                </TabsContent>

                <TabsContent value="reviews" className="mt-4 space-y-6">
                    {/* {bike?.reviews.length === 0 ? (
                        <p className="text-center text-gray-500">No reviews yet.</p>
                    ) : (
                        bike.reviews.map((r) => (
                            <Card key={r.id} className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold">{r.customer?.fullName || "Anonymous"}</h4>
                                    <div className="flex items-center space-x-1 text-yellow-500">
                                        {[...Array(parseInt(r.rating as any))].map((_, i) => (
                                            <Star key={i} className="h-4 w-4" />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-700">{r.comment}</p>
                                <p className="mt-2 text-xs text-gray-500">
                                    {new Date(r.createdAt).toLocaleDateString()}
                                </p>
                            </Card>
                        ))
                    )} */}
                </TabsContent>
            </Tabs>
        </section>
    );
};

export default BikeDetails;










// return (
//     <section className="container mx-auto p-6">
//         {/* Hero */}
//         <div className="grid gap-6 md:grid-cols-2">
//             <div className="relative w-full h-64 md:h-[400px] rounded-lg overflow-hidden">
//                 {bike?.bikeImageUrl ? (
//                     <Image
//                         src={bike.bikeImageUrl}
//                         alt={bike.bikeName}
//                         fill
//                         className="object-cover"
//                     />
//                 ) : (
//                     <div className="flex h-full items-center justify-center bg-gray-100">
//                         <span className="text-gray-500">No Image Available</span>
//                     </div>
//                 )}
//             </div>
//             <Card className="p-6 shadow-lg">
//                 <CardHeader>
//                     <CardTitle className="text-2xl">{bike?.bikeName}</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="flex items-center space-x-2 text-gray-600">
//                         <MapPin className="h-5 w-5" />
//                         <span>{bike?.bikeLocation}</span>
//                     </div>
//                     <div className="flex items-center space-x-2 text-gray-600">
//                         <DollarSign className="h-5 w-5" />
//                         <span>₹ {bike?.pricePerDay.toString()} / day</span>
//                     </div>
//                     <div className="flex items-center space-x-2 text-gray-600">
//                         <CalendarDays className="h-5 w-5" />
//                         <span>Type: {bike?.bikeType.toUpperCase()}</span>
//                     </div>
//                     <Link href="/bikes">
//                         <Button
//                             className="mt-4 w-full"
//                         >
//                             Back to Browse
//                         </Button>
//                     </Link>
//                 </CardContent>
//             </Card>
//         </div>

//         {/* Tabs: Overview & Reviews */}
//         <Tabs defaultValue="overview" className="mt-8">
//             <TabsList>
//                 <TabsTrigger value="overview">Overview</TabsTrigger>
//                 {/* <TabsTrigger value="reviews">Reviews ({bike?.reviews.length})</TabsTrigger> */}
//             </TabsList>

//             <TabsContent value="overview" className="mt-4">
//                 <p className="prose max-w-none text-gray-800">
//                     {bike?.bikeDescription}
//                 </p>
//             </TabsContent>

//             <TabsContent value="reviews" className="mt-4 space-y-6">
//                 {/* {bike?.reviews.length === 0 ? (
//                     <p className="text-center text-gray-500">No reviews yet.</p>
//                 ) : (
//                     bike.reviews.map((r) => (
//                         <Card key={r.id} className="p-4">
//                             <div className="flex items-center justify-between mb-2">
//                                 <h4 className="font-semibold">{r.customer?.fullName || "Anonymous"}</h4>
//                                 <div className="flex items-center space-x-1 text-yellow-500">
//                                     {[...Array(parseInt(r.rating as any))].map((_, i) => (
//                                         <Star key={i} className="h-4 w-4" />
//                                     ))}
//                                 </div>
//                             </div>
//                             <p className="text-gray-700">{r.comment}</p>
//                             <p className="mt-2 text-xs text-gray-500">
//                                 {new Date(r.createdAt).toLocaleDateString()}
//                             </p>
//                         </Card>
//                     ))
//                 )} */}
//             </TabsContent>
//         </Tabs>
//     </section>
// );