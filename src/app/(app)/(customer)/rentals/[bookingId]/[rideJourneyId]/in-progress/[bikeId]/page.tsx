// src/app/(customer)/rentals/[bookingId]/[rideJourneyId]/in-progress/[bikeId]/page.tsx
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
    Loader2,
} from "lucide-react";
import Link from "next/link";
import { Bike, Booking, DamageReport, DamageReportImages, Review, User } from "@prisma/client";
import CustomerTracker from "@/components/CustomerTracker";
import RideControls from "@/components/customer/RideControls";
import RideMap from "@/components/customer/RideMap";
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

export default function RideInProgressPage() {
    const { bookingId, rideJourneyId, bikeId } = useParams() as unknown as RideInProgressPageParams;
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isActive, setIsActive] = useState(true);

    // Damage Report
    const bookingID = Number(bookingId);
    const bikeID = Number(bikeId);
    const [damageReportSubmitting, setDamageReportSubmitting] = useState(false);
    const [damageImagePreviews, setDamageImagePreviews] = useState<string[] | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[] | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [openImage, setOpenImage] = useState<string | null>(null);

    useEffect(() => {
        if (!session || session.user.role !== "customer") {
            signIn("credentials", { redirect: false });
            router.replace("/sign-in");
            return;
        }
    }, [session]);

    // fetch this customer’s past damage reports on this bike ===
    const [damageReports, setDamageReports] = useState<DamageReportProps[]>([]);
    const [damageReportsLoading, setDamageReportsLoading] = useState(false);

    const fetchDamageReports = async () => {
        if (!session) return;
        setDamageReportsLoading(true);
        try {
            const res = await axios.get<ApiResponse & { success: boolean; reports: DamageReportProps[] }>(
                `/api/bikes/${bikeID}/damages/customer/${session?.user.id}`
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
        if (session && session.user.role === "customer") {
            fetchDamageReports();
        }
    }, [session]);

    const onImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(prev => [...(prev || []), ...files]);
        setDamageImagePreviews(prev => [
            ...(prev || []),
            ...files.map(f => URL.createObjectURL(f))
        ]);
    };

    // Booking form setup
    const damageForm = useForm<DamageReportForm>({
        resolver: zodResolver(damageReportSchema),
        defaultValues: {
            description: "",
            bookingId: bookingID
        },
    });

    const handleDamageReport = async (data: DamageReportForm) => {
        if (!selectedFiles) {
            toast.error("Please select an image");
            return;
        }
        setDamageReportSubmitting(true);
        try {
            let imageUrls: string[] | undefined;
            if (selectedFiles && selectedFiles.length > 0) {
                const uploadForm = new FormData();
                selectedFiles.forEach((file) => {
                    uploadForm.append("images", file);
                });

                try {
                    const uploadResponse = await axios.post<{ urls: string[] }>("/api/upload-multiple-images", uploadForm);
                    imageUrls = uploadResponse.data.urls;
                }
                catch (error) {
                    const axiosError = error as AxiosError<ApiResponse>;
                    toast.error(`Image upload failed: ${axiosError.response?.data.message || "Unknown error"}`);
                    return;
                }
            }

            const payload = {
                ...data,
                images: imageUrls
            }

            const response = await axios.post<ApiResponse>(`/api/bikes/${bikeID}/damages/customer/${session?.user.id}`, payload);
            if (response.data.success) {
                toast.success("Damage report submitted successfully");
                damageForm.reset();
                setSelectedFiles(null);
                damageImagePreviews?.forEach(URL.revokeObjectURL);
                setDamageImagePreviews(null);
                fetchDamageReports();
            }
            else {
                toast.error(response.data.message || "Failed to submit damage report");
            }
        }
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message || "Failed to submit damage report");
        }
        finally {
            setDamageReportSubmitting(false);
        }
    };

    // remove one image by index
    const removeImage = (index: number) => {
        setSelectedFiles(files => {
            const updated = [...(files || [])];
            updated.splice(index, 1);
            return updated;
        });
        setDamageImagePreviews(prev => {
            const updated = [...(prev || [])];
            URL.revokeObjectURL(updated[index]);
            updated.splice(index, 1);
            return updated;
        });
    };

    const handleDamageReportClear = () => {
        damageForm.reset();
        setSelectedFiles(null);
        damageImagePreviews?.forEach(URL.revokeObjectURL);
        setDamageImagePreviews(null);
    };


    return (
        <section className="p-6 space-y-6">
            <h1 className="text-2xl mb-4">Your Ride Is Live</h1>

            {/* This kicks off geolocation → Firebase and then disappears */}
            <CustomerTracker
                rideJourneyId={rideJourneyId}
                customerId={session?.user.id}
                isActive={isActive}
            />

            {/* Live map view */}
            <RideMap rideJourneyId={rideJourneyId} />

            {/* Pause/Resume & End ride controls */}
            <RideControls bookingId={bookingId} rideJourneyId={rideJourneyId} onToggleActive={setIsActive} />

            <div className="flex justify-center">
                <div className="w-full p-6 space-y-6 bg-white rounded-lg shadow max-w-xl">
                    <Form {...damageForm}>
                        <form
                            onSubmit={damageForm.handleSubmit(handleDamageReport)}
                            className="space-y-4"
                        >
                            <FormField
                                name="description"
                                control={damageForm.control}
                                render={({ field }) => (
                                    <FormItem >
                                        <FormLabel>Damage Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Enter damage description" className="min-h-25 max-h-30" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormItem>
                                <FormLabel>Bike Image (Press *Ctrl* to select multiple images)</FormLabel>
                                <FormControl>
                                    <div className="flex gap-4">
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="bg-gray-400 hover:bg-gray-500 flex-1"
                                            disabled={damageReportSubmitting}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            Bike Image
                                        </Button>
                                        <Input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={onImagesChange}
                                            className="hidden"
                                            disabled={damageReportSubmitting}
                                        />
                                        {(damageImagePreviews && selectedFiles && selectedFiles.length > 0) && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                disabled={damageReportSubmitting}
                                                onClick={() => {
                                                    setSelectedFiles(null);
                                                    setDamageImagePreviews(null);
                                                }}
                                                className="flex-1"
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>

                            {(damageImagePreviews && damageImagePreviews.length > 0) && (
                                <div className="mt-2 w-full max-w-full flex flex-row whitespace-nowrap space-x-2 overflow-x-auto overflow-y-hidden py-2">
                                    {damageImagePreviews.map((src, idx) => (
                                        <div key={idx} className="relative w-24 h-24 flex-shrink-0 overflow-hidden sm:w-32 sm:h-32 md:w-40 md:h-40 mr-4">
                                            <Image
                                                src={src}
                                                fill
                                                className="object-cover rounded"
                                                alt={`Preview ${idx + 1}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="cursor-pointer outline absolute top-1 right-1 bg-white rounded-full p-0.5 shadow"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex justify-evenly items-center gap-5">
                                <Button
                                    type="submit"
                                    disabled={damageReportSubmitting}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                >
                                    {damageReportSubmitting ? (
                                        <>
                                            Submitting… <Loader2 className="animate-spin ml-2 h-4 w-4" />
                                        </>
                                    ) : (
                                        "Submit Damage Report"
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    disabled={damageReportSubmitting}
                                    onClick={handleDamageReportClear}
                                >
                                    Clear
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
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
}
