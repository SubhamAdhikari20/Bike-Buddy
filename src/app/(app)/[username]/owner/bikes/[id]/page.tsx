// src/app/(app)/[username]/owner/bikes/[id]/page.tsx
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    IndianRupeeIcon,
    CalendarDays,
    Loader2,
    Trash2,
    EyeIcon,
    CheckIcon,
} from "lucide-react";
import Link from "next/link";
import { Bike, DamageReport, DamageReportImages, Review, User } from "@prisma/client";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner";
import { signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { bikeSchema } from "@/schemas/bikeSchema";
import { Switch } from "@/components/ui/switch";
import StarRatings from "react-star-ratings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";


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
    const ownerId = Number(session?.user.id);

    const [bike, setBike] = useState<BikeWithReviewsProps | null>(null);
    // const [bikes, setBikes] = useState<Bike[]>([]);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string>("");
    const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Damage Report
    const [damageReportSubmitting, setDamageReportSubmitting] = useState(false);
    const [damageImagePreviews, setDamageImagePreviews] = useState<string[] | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[] | null>(null);
    // fetch this owner's past damage reports on this bike
    const [damageReports, setDamageReports] = useState<DamageReportProps[]>([]);
    const [damageReportsLoading, setDamageReportsLoading] = useState(false);

    const [openImage, setOpenImage] = useState<string | null>(null);


    useEffect(() => {
        if (!session || session.user.role !== "owner") {
            signIn("credentials", { redirect: false });
            router.replace("/sign-in");
            return;
        }
    }, [session, bike?.available]);

    const form = useForm<z.infer<typeof bikeSchema>>({
        resolver: zodResolver(bikeSchema),
        defaultValues: {
            ownerId: ownerId,
            bikeName: "",
            bikeType: "city",
            bikeDescription: "",
            bikeLocation: "",
            pricePerDay: 0,
            available: true,
            bikeImageUrl: "",
        },
    });

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

    useEffect(() => {
        if (!bike) {
            return;
        }

        form.reset({
            ownerId: ownerId,
            bikeName: bike.bikeName,
            bikeType: bike.bikeType,
            bikeDescription: bike.bikeDescription,
            bikeLocation: bike.bikeLocation,
            pricePerDay: Number(bike.pricePerDay),
            available: bike.available,
            bikeImageUrl: bike.bikeImageUrl || "",
        });
        setPreview(bike.bikeImageUrl || "");
    }, [bike, form]);

    const fetchDamageReports = async () => {
        if (!session) return;
        setDamageReportsLoading(true);
        try {
            const res = await axios.get<ApiResponse & { success: boolean; reports: DamageReportProps[] }>(
                `/api/bikes/${bikeId}/damages/owner/${session?.user.id}`
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
        if (session && session.user.role === "owner" && !bike?.available) {
            fetchDamageReports();
        }
    }, [session, bike?.available]);

    const handleClear = () => {
        form.reset({
            ownerId,
            bikeName: "",
            bikeType: "city",
            bikeDescription: "",
            bikeLocation: "",
            pricePerDay: 0,
            available: true,
            bikeImageUrl: "",
        });
        setPreview("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const url = URL.createObjectURL(f);
        setPreview(url);
    };

    // Handle form submission for update bike
    const onSubmit = async (data: z.infer<typeof bikeSchema>) => {
        setLoading(true);
        try {
            let imageUrl = data.bikeImageUrl || "";
            const file = fileInputRef.current?.files?.[0];
            if (file) {
                const uploadForm = new FormData();
                uploadForm.append("image", file);

                try {
                    const uploadResp = await axios.post<{ url: string }>("/api/upload-image", uploadForm);
                    imageUrl = uploadResp.data.url;
                }
                catch (error) {
                    const axiosError = error as AxiosError<ApiResponse>;
                    toast.error(`Image upload failed: ${axiosError.response?.data.message || "Unknown error"}`);
                    return;
                }
            }

            const payload = { ...data, bikeImageUrl: imageUrl };
            const response = await axios.put<ApiResponse>(`/api/bikes/owner/${bikeId}`, payload);
            toast.success(response.data.message);

            handleClear();
            fetchBike();
        }
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message);
        }
        finally {
            setLoading(false);
        }
    };

    // Handle delete
    const handleDelete = async (bikeId: number) => {
        try {
            const response = await axios.delete(`/api/bikes/owner/${bikeId}`);
            if (response.data.success) {
                router.replace(`/${session?.user.username}/owner/bikes`)
            }

            toast.success(response.data.message);
            fetchBike();
        }
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message);
        }
    };

    const updateStatus = async (id: number, newStatus: "reviewed" | "resolved") => {
        try {
            const response = await axios.put<ApiResponse & { success: boolean; damageReports: DamageReportProps[] }>(`/api/bikes/${bikeId}/damages/owner/${ownerId}/${id}/${newStatus}`, { status: newStatus });
            if (response.data.success) {
                setDamageReports(response.data.damageReports);
                toast.success(`Marked ${newStatus}`);
            }

            // setDamageReports(r => r.map(x => x.id === id ? { ...x, status: newStatus } : x));
            fetchDamageReports();
        } catch {
            toast.error("Update failed")
        }
    };

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
            <div className="grid gap-6 lg:grid-cols-2 grid-cols-1">
                <div className="space-y-4">
                    <div className="relative w-full h-64 md:h-[400px] rounded-lg overflow-hidden">
                        {preview ? (
                            <Image
                                src={preview}
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
                            <Link href={`/${session?.user.username}/owner/bikes`}>
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
                <div className="w-full space-y-8 bg-white p-8 rounded-lg shadow-lg flex justify-center">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex flex-col justify-between gap-10"
                        >
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        name="bikeName"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bike Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Enter bike name" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        name="bikeType"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bike Type</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={(value) => field.onChange(value)}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select a bike type" />
                                                        </SelectTrigger>
                                                        <SelectContent className="mt-1">
                                                            <SelectItem value="city">City</SelectItem>
                                                            <SelectItem value="mountain">Mountain</SelectItem>
                                                            <SelectItem value="electric">Electric</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    name="bikeDescription"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem >
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="Enter description" className="min-h-25 max-h-30" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        name="pricePerDay"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Price per Day (₹/day)</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Price per day" type="number" min="0" step="5" onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        name="bikeLocation"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Location</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="City or Area" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormItem>
                                        <FormLabel>Bike Image</FormLabel>
                                        <FormControl>
                                            <Input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFile}
                                                className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>

                                    {/* ─── AVAILABILITY SWITCH ─── */}
                                    <FormField
                                        name="available"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between flex-row rounded-lg border p-3 shadow-sm">
                                                <FormLabel>Bike Available</FormLabel>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-evenly items-center gap-5 ">
                                <Button type="submit" className="flex-1" disabled={loading}>
                                    {loading ? "Updating..." : "Save Changes"}
                                    {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                </Button>
                                <Button variant="outline" className="flex-1" onClick={handleClear}>
                                    Clear
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="flex-1">
                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the bike
                                                <strong> "{bike.bikeName}"</strong> and remove its data from the system.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(bike.id)}>
                                                Confirm Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>

            {/* Overview / Reviews Tabs */}
            <Tabs defaultValue="overview" className="space-y-4 mt-8">
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
