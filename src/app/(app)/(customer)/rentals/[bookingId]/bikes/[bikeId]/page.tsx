// src/app/(app)/(customer)/rentals/[bookingId]/bikes/[bikeId]/page.tsx
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
import { Bike, Booking, DamageReport, DamageReportImages, Review, User } from "@prisma/client";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner";
import { signIn, useSession } from "next-auth/react";
import { damageReportSchema } from "@/schemas/damageReportSchema";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import StarRatings from "react-star-ratings";


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
    bike: Bike & {
        owner: User;
        bookings: Booking[]
    };
}

const BikeDetails = () => {
    const { bookingId, bikeId } = useParams();
    const bookingID = Number(bookingId);
    const bikeID = Number(bikeId);
    const router = useRouter();
    const { data: session, status } = useSession();

    const [bike, setBike] = useState<BikeWithReviewsProps | null>(null);
    const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);

    // Damage Report
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

    const fetchBike = async () => {
        try {
            const { data } = await axios.get<{ success: boolean; bike: BikeWithReviewsProps }>(`/api/bikes/${bikeID}`);

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
            const { data } = await axios.get<{ success: boolean; reviews: ReviewWithUser[] }>(`/api/reviews?bikeId=${bikeID}`);

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
        if (bikeID) {
            fetchBike();
            fetchReview();
        }
    }, [bikeID]);

    // Damage Report
    // fetch this customer’s past damage reports on this bike ===
    const [damageReports, setDamageReports] = useState<DamageReportProps[]>([]);
    const [damageReportsLoading, setDamageReportsLoading] = useState(false);

    const fetchDamageReports = async () => {
        if (!session) return;
        setDamageReportsLoading(true);
        try {
            const res = await axios.get<ApiResponse & { success: boolean; reports: DamageReportProps[] }>(
                `/api/bikes/${bikeID}/damages/customer/${session.user.id}`
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
        if (session && session.user.role === "customer" && !bike?.available) {
            fetchDamageReports();
        }
    }, [session, bike?.available]);

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
    }

    if (!bike) {
        return <div className="p-6 text-center">Bike not found.</div>;
    }

    return (
        <section className="container mx-auto p-6">
            <div className="grid gap-6 lg:grid-cols-2">
                {!bike.available &&
                    <>
                        <div className="space-y-4">
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

                            <Card className="p-4 shadow-lg gap-2">
                                <CardHeader className="flex justify-between">
                                    <CardTitle className="text-xl md:text-2xl">{bike?.bikeName}</CardTitle>
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
                                </CardHeader>
                                <CardContent className="flex flex-col xl:flex-row justify-between gap-2">
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
                                    <Link href="/rentals">
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

                        <div className="w-full p-6 space-y-6 bg-white rounded-lg shadow">
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
                    {!bike?.available &&
                        <TabsTrigger value="damages">
                            Damages Report ({damageReports.length})
                        </TabsTrigger>
                    }

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

                {!bike.available &&
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
                                                        <DialogContent className="p-5 lg:max-w-fit! max-h-200 overflow-y-auto" >
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
                }

            </Tabs>
        </section>
    );
};

export default BikeDetails;