// src/app/(app)/bikes/[id]/page.tsx
import { notFound } from "next/navigation";
import { getBikeById } from "@/model/Bike";

import Image from "next/image";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    DollarSign,
    Star,
    CalendarDays,
} from "lucide-react";
import Link from "next/link";

// Props type for Next.js routing
type PageProps = {
    params: { id: string };
};

const BikeDetails = async ({ params }: PageProps) => {
    const bikeId = Number(params.id);
    const bike = await getBikeById(bikeId);

    if (!bike) return notFound();
    return (
        <section className="container mx-auto p-6">
            {/* Hero */}
            <div className="grid gap-6 md:grid-cols-2">
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
                <Card className="p-6 shadow-lg">
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
                            <span>₹ {bike?.pricePerDay.toFixed(2)} / day</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <CalendarDays className="h-5 w-5" />
                            <span>Type: {bike?.bikeType.charAt(0).toUpperCase() + bike?.bikeType.slice(1)}</span>
                        </div>
                        <Link href="/bikes">
                            <Button
                                className="mt-4 w-full"

                            >
                                Back to Browse
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs: Overview & Reviews */}
            <Tabs defaultValue="overview" className="mt-8">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    {/* <TabsTrigger value="reviews">Reviews ({bike?.reviews.length})</TabsTrigger> */}
                </TabsList>

                <TabsContent value="overview" className="mt-4">
                    <p className="prose max-w-none text-gray-800">
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
