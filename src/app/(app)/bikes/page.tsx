// src/app/(app)/bikes/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import BikeCard from "@/components/customer/BikeCard";
import { Loader2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { bikeSchema } from "@/schemas/bikeSchema";
import { bookingSchema } from "@/schemas/bookingSchema";
import { Bike } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

// type Bike = {
//     id: number;
//     bikeName: string;
//     bikeDescription: string;
//     bikeLocation: string;
//     pricePerDay: number;
//     bikeImageUrl?: string[];
// };

const RentBike = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [bookingLoading, setBookingLoading] = useState(false);

    const [location, setLocation] = useState("");
    const [type, setType] = useState("");
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
    const [sortBy, setSortBy] = useState<"newest" | "priceAsc" | "priceDesc">(
        "newest"
    );
    const [page, setPage] = useState(1);
    const pageSize = 12;

    const [bikes, setBikes] = useState<Bike[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    // Booking modal state
    const [selectedBike, setSelectedBike] = useState<Bike | null>(null);

    // whenever any filter/sort/page changes, re-fetch
    useEffect(() => {
        const fetchBikes = async () => {
            setLoading(true);
            const qp = new URLSearchParams();
            if (location) qp.set("location", location);
            if (type) qp.set("type", type);
            qp.set("minPrice", priceRange[0].toString());
            qp.set("maxPrice", priceRange[1].toString());
            qp.set("sortBy", sortBy);
            qp.set("page", page.toString());
            qp.set("pageSize", pageSize.toString());

            const res = await fetch(`/api/bikes?${qp.toString()}`);
            const json = await res.json();
            setBikes(json.bikes || []);
            setTotal(json.total || 0);
            setLoading(false);
        };

        fetchBikes();
    }, [location, type, priceRange, sortBy, page]);

    const totalPages = Math.ceil(total / pageSize);

    const resetFilters = () => {
        setLocation("");
        setType("");
        setPriceRange([0, 10000]);
        setSortBy("newest");
        setPage(1);
    };

    // form for booking
    const form = useForm<z.infer<typeof bookingSchema>>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            customerId: session?.user?.id ? Number(session.user.id) : undefined,
            bikeId: selectedBike?.id,
            startTime: "",
            endTime: "",
            totalPrice: 0,
        },
    });

    // update totalPrice when start/end change
    const { watch, setValue } = form;
    const [st, et] = [watch("startTime"), watch("endTime")];
    useEffect(() => {
        if (st && et) {
            const s = new Date(st).getTime(),
                e = new Date(et).getTime();
            if (e > s && selectedBike) {
                const msPerDay = 1000 * 60 * 60 * 24;
                const rawDays = (e - s) / msPerDay;
                const days = Math.max(1, Math.ceil(rawDays));
                const dailyRate = Number(selectedBike.pricePerDay);
                setValue("totalPrice", Number((days * dailyRate).toFixed(2)));

                // const hrs = (e - s) / (1000 * 60 * 60);
                // const hourlyRate = Number(selectedBike.pricePerDay);
                // setValue("totalPrice", Number((hrs * hourlyRate).toFixed(2)));
            }
        }
    }, [st, et, setValue, selectedBike]);

    // when user clicks “Rent Now”
    const handleRentClick = (bike: Bike) => {
        if (status === "unauthenticated" || !session || session?.user.role !== "customer") {
            // kick to sign-in
            toast.error("Booking Failed!", { description: "You need to sign in for renting a bike" });
            signIn("credentials", { redirect: false });
            router.replace("/sign-in");
            return;
        }
        // prefill bikeId & customer
        const hourlyRate = Number(bike.pricePerDay);
        form.reset({
            customerId: Number(session.user.id),
            bikeId: bike.id,
            startTime: "",
            endTime: "",
            totalPrice: Number(hourlyRate.toFixed(2)),
        });
        setSelectedBike(bike);
    }

    // on booking submit
    const onSubmit = async (data: z.infer<typeof bookingSchema>) => {
        // client-side date checks
        if (!data.startTime || !data.endTime) {
            return toast.error("Please select both start and end dates");
        }
        if (new Date(data.endTime) <= new Date(data.startTime)) {
            return toast.error("End date must be after start date");
        }

        setBookingLoading(true);

        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const payload = await res.json() as {
                success: boolean;
                message?: string;
                booking?: { id: number; totalPrice: number };
            };

            if (!res.ok || !payload.success || !payload.booking) {
                toast.error(
                    payload.message || "Unable to create booking. Please try again."
                );
                // throw new Error(payload.message || "Unable to create booking. Please try again.");
            }

            if (payload.booking) {
                router.push(`/payment/checkout?bookingId=${payload.booking.id}&totalPrice=${payload.booking.totalPrice}`);
            }
            setSelectedBike(null);
        }
        catch (err: any) {
            toast.error(err.message || "Booking failed");
        }
        finally {
            setBookingLoading(false);
        }
    }


    return (
        <section className="container mx-auto px-4 py-8">
            {/* ───── Filters ───── */}
            <div className="mb-8 bg-[#f8f2f2] shadow-lg rounded-lg p-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {/* Location */}
                <div>
                    <Label className="block text-sm font-semibold mb-1">
                        Pick-up Location
                    </Label>
                    <Input
                        placeholder="e.g. Kathmandu"
                        value={location}
                        onChange={(e) => {
                            setLocation(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                {/* Type */}
                <div>
                    <Label className="block text-sm font-semibold mb-1">Bike Type</Label>
                    <Select
                        value={type}
                        onValueChange={(v) => {
                            setType(v);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* <SelectItem value="">Any</SelectItem> */}
                            <SelectItem value="city">City</SelectItem>
                            <SelectItem value="mountain">Mountain</SelectItem>
                            <SelectItem value="electric">Electric</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Price */}
                <div className="sm:col-span-2">
                    <Label className="block text-sm font-semibold mb-1">
                        Price / Day (₹)
                    </Label>
                    <Slider
                        min={0}
                        max={10000}
                        step={1}
                        value={priceRange}
                        onValueChange={(v) => {
                            setPriceRange(v as [number, number]);
                            setPage(1);
                        }}
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>₹ {priceRange[0]}</span>
                        <span>₹ {priceRange[1]}</span>
                    </div>
                </div>

                {/* Sort */}
                <div>
                    <Label className="block text-sm font-semibold mb-1">Sort By</Label>
                    <Select
                        value={sortBy}
                        onValueChange={(v: any) => {
                            setSortBy(v);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Newest" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="priceAsc">Price: Low → High</SelectItem>
                            <SelectItem value="priceDesc">Price: High → Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Reset */}
                <div className="lg:col-span-2 flex justify-end items-center">
                    <Button variant="outline" onClick={resetFilters}>
                        Reset Filters
                    </Button>
                </div>
            </div>

            {/* ───── Results ───── */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin h-8 w-8 text-green-600" />
                </div>
            ) : bikes.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bikes.map((bike) => (
                        <BikeCard key={bike.id} bike={bike as any} onRent={() => handleRentClick(bike)} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-20">
                    No bikes match your filters.
                </p>
            )}

            {/* ─── Pagination ─── */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                    {Array.from({ length: totalPages }).map((_, idx) => (
                        <Button
                            key={idx}
                            variant={page === idx + 1 ? "default" : "outline"}
                            onClick={() => setPage(idx + 1)}
                        >
                            {idx + 1}
                        </Button>
                    ))}
                </div>
            )}

            {/* ───── Inline Booking Dialog ───── */}
            <Dialog
                open={!!selectedBike}
                onOpenChange={(o) => {
                    if (!o) setSelectedBike(null);
                }}
            >
                <DialogContent className="max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
                    <DialogHeader className="pb-4">
                        <DialogTitle className="text-lg font-semibold">
                            Book “{selectedBike?.bikeName}”
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left: Bike Image */}
                        <div className="w-full h-48 md:h-64 relative rounded-lg overflow-hidden bg-gray-100">
                            <Image
                                src={selectedBike?.bikeImageUrl || "/placeholder.jpg"}
                                alt={selectedBike?.bikeName || "Bike Image"}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Right: Booking Form */}
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
                                                    ₹{selectedBike?.pricePerDay.toString()}/day
                                                </div>
                                            </div>
                                            <FormControl>
                                                <Input {...field} disabled className="bg-gray-50" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter className="pt-4">
                                    <Button type="submit" className="w-full">
                                        {bookingLoading ? (
                                            <>
                                                Booking… <Loader2 className="animate-spin ml-2 h-4 w-4" />
                                            </>
                                        ) : (
                                            "Book"
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    );
}

export default RentBike;
