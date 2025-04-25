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
    DollarSign,
    IndianRupeeIcon,
    Star,
    CalendarDays,
    Loader2,
    Trash2,
} from "lucide-react";
import Link from "next/link";
import { Bike } from "@prisma/client";
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


const BikeDetails = () => {
    const { id } = useParams();
    const bikeId = Number(id);
    const router = useRouter();
    const { data: session, status } = useSession();
    const ownerId = Number(session?.user.id);

    const [bike, setBike] = useState<Bike | null>(null);
    // const [bikes, setBikes] = useState<Bike[]>([]);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // 3) When bike arrives, reset the form
    useEffect(() => {
        if (!bike) {
            return;
        }

        form.reset({
            ownerId: ownerId,
            bikeName: bike.bikeName,
            bikeType: bike.bikeType,
            bikeDescription: bike.bikeDescription,
            bikeLocation: bike.bikeType,
            pricePerDay: Number(bike.pricePerDay),
            available: bike.available,
            bikeImageUrl: bike.bikeImageUrl || "",
        });
        setPreview(bike.bikeImageUrl || "");
    }, [bike, form]);

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
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="grid gap-4 lg:grid-row-2">
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
                    <Card className="p-5 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl">{bike?.bikeName}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col md:flex-row justify-between gap-2">
                            <div className="flex items-center space-x-2 text-gray-600">
                                <MapPin className="h-5 w-5" />
                                <span>{bike?.bikeLocation}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                                <IndianRupeeIcon className="h-5 w-5" />
                                <span className="font-bold text-xl">{bike?.pricePerDay.toString()} / day</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                                <CalendarDays className="h-5 w-5" />
                                <span>Type: {bike?.bikeType.toUpperCase()}</span>
                            </div>
                            <Link href={`/${session?.user.username}/owner/bikes/${bike.id}`}>
                                <Button
                                    className="w-full"
                                    size="sm"
                                >
                                    Back to Browse
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                </div>
                <div className="w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
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

                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    name="bikeDescription"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="Enter description" />
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

                            <div className="flex justify-evenly items-center gap-5">
                                <Button type="submit" className="flex-1" disabled={loading}>
                                    {loading ? "Updating..." : "Update"}
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
                                                <strong> "{bike.bikeName}"</strong> and remove their data from the system.
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
