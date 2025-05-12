// src/app/(app)/[username]/owner/bikes/page.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BikeCard from "@/components/owner/BikeCard";
import { Bike } from "@prisma/client";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { bikeSchema } from "@/schemas/bikeSchema";
import { useSession } from "next-auth/react";
import { ApiResponse } from "@/types/ApiResponse";
import Image from "next/image";

const OwnerBikes = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    let currentUser: any;
    if (session?.user) {
        currentUser = session.user;
    }
    const ownerId = Number(currentUser?.id);

    const [bikes, setBikes] = useState<Bike[]>([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [preview, setPreview] = useState<string>("");
    const [editingBike, setEditingBike] = useState<Bike | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof bikeSchema>>({
        resolver: zodResolver(bikeSchema),
        defaultValues: {
            ownerId: ownerId,
            bikeName: "",
            bikeDescription: "",
            bikeLocation: "",
            pricePerDay: 0,
            bikeImageUrl: "",
            available: true,
        },
    });

    useEffect(() => {
        if (status === "authenticated" && currentUser?.id) {
            fetchBikes();
        }
    }, [status, currentUser?.id]);

    // Fetch the bikes of the owner
    const fetchBikes = async () => {
        try {
            const ownerId = Number(currentUser?.id);
            const response = await axios.get<{ bikes: Bike[] }>(`/api/bikes/owner?ownerId=${ownerId}`);
            setBikes(response.data.bikes);
        }
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message);
        }
        finally {
            setLoading(false);
        }
    };

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
        setEditingBike(null);
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

    // Handle form submission for create/update bike
    const onSubmit = async (data: z.infer<typeof bikeSchema>) => {
        setLoading(true);
        try {
            let imageUrl = data.bikeImageUrl || "";

            // if the user selected a file, first upload it:
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
            if (editingBike) {
                const response = await axios.put<ApiResponse>(`/api/bikes/owner/${editingBike.id}`, payload);
                toast.success(response.data.message);
            }
            else {
                const response = await axios.post<ApiResponse>("/api/bikes/owner", payload);
                toast.success(response.data.message);
            }
            setDialogOpen(false);
            setEditingBike(null);
            handleClear();
            fetchBikes();
        }
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message);
        }
        finally {
            setLoading(false);
        }
    };

    // Handle edit, prefill the form and open the dialog
    const handleEdit = (bike: Bike) => {
        setEditingBike(bike);
        form.reset({
            ownerId: bike.ownerId,
            bikeName: bike.bikeName,
            bikeType: bike.bikeType,
            bikeDescription: bike.bikeDescription,
            bikeLocation: bike.bikeLocation,
            pricePerDay: Number(bike.pricePerDay),
            available: bike.available,
            bikeImageUrl: bike.bikeImageUrl || "",
        });
        setPreview(bike.bikeImageUrl || "");
        setDialogOpen(true);
    };

    // Handle delete
    const handleDelete = async (bikeId: number) => {
        try {
            const response = await axios.delete(`/api/bikes/owner/${bikeId}`);
            toast.success(response.data.message);
            fetchBikes();
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

    return (
        <section className="px-4 py-2 md:px-6 md:py-2 mx-auto">
            <div className="sticky md:top-0 top-16 inset-x-0 z-25 py-4 md:py-4 bg-white dark:bg-gray-800 flex flex-col gap-3 sm:flex-row items-center justify-between border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-800">Manage Bikes</h1>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleClear}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Bike
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md max-h-200 overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingBike ? "Update Bike Details" : "Add New Bike Deatils"}</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                <FormField
                                    name="bikeDescription"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="Enter description" className="min-h-20 max-h-30" />
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

                                {preview && (
                                    <div className="relative w-full h-50 mt-2">
                                        <Image
                                            src={preview}
                                            alt="Preview"
                                            fill
                                            className="w-full h-50 object-cover rounded-lg"
                                        />
                                    </div>
                                )}

                                <div className="flex justify-evenly items-center gap-4">
                                    <Button type="submit" className="flex-1" disabled={loading}>
                                        {editingBike ? (loading ? "Updating..." : "Update") : (loading ? "Adding..." : "Add")}
                                        {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                    </Button>
                                    <Button variant="outline" className="flex-1" onClick={handleClear}>
                                        Clear
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="overflow-x-auto py-4 rounded-md">
                    {bikes.length === 0 ? (
                        <p className="p-4 text-gray-600">No bikes found.</p>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {bikes.map((bike) => (
                                <BikeCard
                                    key={bike.id}
                                    bike={bike}
                                    currentUser={currentUser!}
                                    onEdit={() => handleEdit(bike)}
                                    onDelete={() => handleDelete(bike.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default OwnerBikes;
