// src/app/(app)/[username]/owner/damages/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bike, User, DamageReport, DamageReportImages, Booking } from "@prisma/client";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { CheckIcon, EyeIcon, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";


type DamageReportProps = DamageReport & {
    images: DamageReportImages[];
    customer: User;
    bike: Bike & {
        owner: User;
        bookings: Booking[];
    };
}

const DamagesPage = () => {
    const { id } = useParams();
    // const bikeId = Number(id);
    const router = useRouter();
    const { data: session, status } = useSession();
    const ownerId = Number(session?.user.id);

    // Damage Report States
    const [loading, setLoading] = useState(false);
    const [openImage, setOpenImage] = useState<string | null>(null);
    const [damageReports, setDamageReports] = useState<DamageReportProps[]>([]);
    const [damageReportSubmitting, setDamageReportSubmitting] = useState(false);
    const [damageImagePreviews, setDamageImagePreviews] = useState<string[] | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[] | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!session || session.user.role !== "owner") {
            signIn("credentials", { redirect: false });
            router.replace("/sign-in");
            return;
        }
    }, [session]);

    const fetchDamageReports = async () => {
        if (!session) return;
        setLoading(true);
        try {
            const res = await axios.get<ApiResponse & { success: boolean; reports: DamageReportProps[] }>(
                `/api/bikes/damages/owner?ownerId=${session.user.id}`
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
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, newStatus: "reviewed" | "resolved") => {
        try {
            const response = await axios.put<ApiResponse & { success: boolean; damageReports: DamageReportProps[] }>(`/api/bikes/damages/owner/${ownerId}/${id}/${newStatus}`, { status: newStatus });
            if (response.data.success) {
                setDamageReports(response.data.damageReports);
                toast.success(`Marked ${newStatus}`);
            }

            fetchDamageReports();
        } catch {
            toast.error("Update failed")
        }
    };

    useEffect(() => {
        if (session && session.user.role === "owner") {
            fetchDamageReports();
        }
    }, [session]);

    return (
        <section className="px-4 py-2 md:px-6 md:py-2 mx-auto">
            <div className="sticky md:top-0 top-16 inset-x-0 z-25 py-4 md:py-4 bg-white dark:bg-gray-800 flex flex-col gap-3 sm:flex-row items-center justify-between border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-800">Damages</h1>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : damageReports.length === 0 ? (
                <p className="text-center text-gray-500 mt-3">No damage reports yet.</p>
            ) : (
                <div className="overflow-x-auto py-4 rounded-md space-y-6">
                    {damageReports.map((damageReport) => {
                        // Find the relevant booking associated with this damage report
                        const relevantBooking = damageReport.bike?.bookings.find((booking) =>
                            booking.id === damageReport.bookingId
                        );
                        return (
                            <Card key={damageReport.id} className="p-5 flex gap-4 items-start">
                                <CardHeader className="w-full flex flex-col gap-2 p-0">
                                    <div className="flex gap-2 items-center">
                                        <Avatar className="h-10 w-10 cursor-pointer border-1 border-gray-900">
                                            {damageReport.customer.profilePictureUrl ? (
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
                                    <div className="space-y-1 flex justify-between items-center mb-4">
                                        <div className="flex flex-col gap-2">
                                            <div>
                                                <span className="font-semibold">Bike Name: </span>
                                                <span>{damageReport.bike?.bikeName}</span>
                                            </div>
                                            <div>
                                                <span className="font-semibold">Bike Type: </span>
                                                <span>{damageReport.bike?.bikeType}</span>
                                            </div>
                                            <div>
                                                <span className="font-semibold">Pick-up Location: </span>
                                                <span>{damageReport.bike?.bikeLocation}</span>
                                            </div>
                                            <div>
                                                <span className="font-semibold">Bike Price/Day: </span>
                                                <span>₹ {damageReport.bike?.pricePerDay.toString()}</span>
                                            </div>
                                        </div>

                                        {relevantBooking ? (
                                            <div className="flex flex-col gap-2">
                                                <div>
                                                    <span className="font-semibold">Start Date: </span>
                                                    <span>{new Date(relevantBooking.startTime).toDateString()}</span>
                                                </div>
                                                <div>
                                                    <span className="font-semibold">End Date: </span>
                                                    <span>{new Date(relevantBooking.endTime).toDateString()}</span>
                                                </div>
                                                <div>
                                                    <span className="font-semibold">Bike Total: </span>
                                                    <span>₹ {relevantBooking.totalPrice}</span>
                                                </div>
                                                <div>
                                                    <span className="font-semibold">Booking Status: </span>
                                                    <span>{relevantBooking.status}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                <span>No associated booking found</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex overflow-x-auto space-x-4 py-2">
                                        {damageReport.images.map((img) => (
                                            <Dialog key={img.id} open={openImage === img.imageUrl} onOpenChange={(val) => setOpenImage(val ? img.imageUrl : null)}>
                                                <DialogTrigger asChild>
                                                    <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-lg overflow-hidden cursor-pointer">
                                                        <Image src={img.imageUrl} width={160} height={160} className="object-cover w-full h-full" alt="damage" />
                                                    </div>
                                                </DialogTrigger>
                                                <DialogContent className="p-5 lg:max-w-fit! max-h-200 overflow-y-auto">
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

                                    <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-2">
                                        <span
                                            className={`
                                                            px-2 py-1 rounded-full text-sm font-medium
                                                            ${damageReport.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
                                                            ${damageReport.status === "reviewed" ? "bg-blue-100   text-blue-800" : ""}
                                                            ${damageReport.status === "resolved" ? "bg-green-100  text-green-800" : ""}
                                                        `}
                                        >
                                            {damageReport.status.toUpperCase()}
                                        </span>

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant={damageReport.status === "reviewed" ? "outline" : "default"}
                                                disabled={damageReport.status !== "pending"}
                                                onClick={() => updateStatus(damageReport.id, "reviewed")}
                                                className="flex items-center gap-1"
                                            >
                                                <EyeIcon className="h-4 w-4" /> Review
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant={damageReport.status === "resolved" ? "outline" : "default"}
                                                disabled={(damageReport.status === "pending") || (damageReport.status === "resolved")}
                                                onClick={() => updateStatus(damageReport.id, "resolved")}
                                                className="flex items-center gap-1"
                                            >
                                                <CheckIcon className="h-4 w-4" /> Resolve
                                            </Button>
                                        </div>
                                    </div>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default DamagesPage;
