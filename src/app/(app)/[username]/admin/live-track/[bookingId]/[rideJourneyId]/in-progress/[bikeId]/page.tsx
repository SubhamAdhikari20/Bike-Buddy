// src/app/(app)/[username/owner]/live-track/[bookingId]/[rideJourneyId]/in-progress/[bikeId]/page.tsx
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
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Loader2,
} from "lucide-react";
import Link from "next/link";
import { Bike, Booking, DamageReport, DamageReportImages, Review, User } from "@prisma/client";
import RideMap from "@/components/admin/RideMap";
import { signIn, useSession } from "next-auth/react";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner";
import { damageReportSchema } from "@/schemas/damageReportSchema";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";


interface RideInProgressPageParams {
    bookingId: string;
    rideJourneyId: string;
    bikeId: string;
}

type DamageReportForm = z.infer<typeof damageReportSchema>;

type DamageReportProps = DamageReport & {
    images: DamageReportImages[];
    customer: User;
    bike: Bike & {
        owner: User;
        bookings: Booking[]
    };
}

const LiveTrack = () => {
    const { bookingId, rideJourneyId, bikeId } = useParams() as unknown as RideInProgressPageParams;
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!session || session.user.role !== "admin") {
            signIn("credentials", { redirect: false });
            router.replace("/sign-in");
            return;
        }
    }, [session]);

    // Damage Report
    const bookingID = Number(bookingId);
    const bikeID = Number(bikeId);

    const [openImage, setOpenImage] = useState<string | null>(null);

    // fetch this customer’s past damage reports on this bike ===
    const [damageReports, setDamageReports] = useState<DamageReportProps[]>([]);
    const [damageReportsLoading, setDamageReportsLoading] = useState(false);

    const fetchDamageReports = async () => {
        if (!session) return;
        setDamageReportsLoading(true);
        try {
            const res = await axios.get<ApiResponse & { success: boolean; reports: DamageReportProps[] }>(
                `/api/bikes/${bikeID}/damages/admin/${session?.user.id}`
            );
            if (res.data.success) {
                setDamageReports(res.data.reports);
            }
            else toast.error("Failed to load your reports");
        }
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message || "Error loading reports");
        }
        finally {
            setDamageReportsLoading(false);
        }
    };

    useEffect(() => {
        if (session && session.user.role === "admin") {
            fetchDamageReports();
        }
    }, [session]);

    return (
        <section className="p-4 space-y-6">
            <h1 className="text-2xl mb-4">Ride is Live</h1>
            <RideMap rideJourneyId={rideJourneyId} />

            <div className="flex justify-center">
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => router.replace("/")}
                >
                    Back to Dashboard
                </Button>
            </div>

            {/* Damage Report Tab */}
            <Tabs defaultValue="damages" className="space-y-4  mt-8">
                <TabsList className="flex gap-2">
                    <TabsTrigger value="damages">
                        Damages Report ({damageReports.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="damages">
                    {damageReportsLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
                        </div>
                    ) : damageReports.length === 0 ? (
                        <p className="text-center text-gray-500">No damage reports yet.</p>
                    ) : (
                        <div className="space-y-6">
                            {damageReports.map((damageReport) => (
                                <Card key={damageReport.id} className="p-5 flex gap-4 items-start">
                                    <CardHeader className="w-full flex flex-col gap-2 p-0">
                                        <div className="flex gap-2 items-center">
                                            {/* Avatar */}
                                            <Avatar className="h-10 w-10 cursor-pointer border-1 border-gray-900">
                                                {(damageReport.customer.profilePictureUrl) ? (
                                                    <AvatarImage src={damageReport.customer.profilePictureUrl} alt={damageReport.customer.fullName} />
                                                ) : (
                                                    <AvatarFallback>
                                                        {((damageReport.customer.fullName ?? damageReport.customer.username ?? "U")
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")
                                                            .toUpperCase())}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            <CardTitle className="font-semibold">{damageReport.customer.fullName}</CardTitle>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="w-full flex-1 p-0">
                                        <div className="flex overflow-x-auto space-x-4 py-2">
                                            {damageReport.images.map(img => (
                                                <Dialog key={img.id} open={openImage === img.imageUrl} onOpenChange={val => setOpenImage(val ? img.imageUrl : null)}>
                                                    <DialogTrigger asChild>
                                                        <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-lg overflow-hidden cursor-pointer">
                                                            <Image src={img.imageUrl} width={160} height={160} className="object-cover w-full h-full" alt="damage" />
                                                        </div>
                                                    </DialogTrigger>
                                                    <DialogContent className="p-5 lg:max-w-fit! max-h-200 overflow-y-auto z-1000" >
                                                        <DialogHeader>
                                                            <DialogTitle>Preview</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="w-full">
                                                            <Image src={img.imageUrl} width={600} height={400} className="object-contain" alt="damage-large" />
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            ))}
                                        </div>
                                        <CardDescription className="mt-2 text-gray-800">{damageReport.description}</CardDescription>
                                    </CardContent>

                                    <CardFooter className="p-0 w-full flex items-center justify-between">
                                        <p className="mt-1 text-xs text-gray-500">
                                            {new Date(damageReport.createdAt).toLocaleDateString()}
                                        </p>

                                        <span className={`
                                            px-2 py-1 rounded-full text-sm font-medium
                                            ${damageReport.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
                                            ${damageReport.status === "reviewed" ? "bg-blue-100   text-blue-800" : ""}
                                            ${damageReport.status === "resolved" ? "bg-green-100  text-green-800" : ""}
                                            `}>
                                            {damageReport.status.toUpperCase()}
                                        </span>
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

export default LiveTrack;
