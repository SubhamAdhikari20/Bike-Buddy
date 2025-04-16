// src/app/(app)/owner/bikes/page.tsx
"use client";
import React, { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import BikeCard, { BikeWithImages } from "@/components/owner/BikeCard";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { bikeSchema } from "@/schemas/bikeSchema";

const OwnerBikes = () => {
    const [bikes, setBikes] = useState<BikeWithImages[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingBike, setEditingBike] = useState<BikeWithImages | null>(null);
    const router = useRouter();

    const form = useForm<z.infer<typeof bikeSchema>>({
        resolver: zodResolver(bikeSchema),
        defaultValues: {
            bikeName: "",
            bikeDescription: "",
            bikeLocation: "",
            pricePerHour: 0,
            available: true,
            bikeImage: "",
        },
    });

    // Fetch owner's bikes (assume the owner ID is available e.g. via session or context; here we use a placeholder: ownerId=1)
    const ownerId = 1; // Replace with actual owner id from session
    const fetchBikes = async () => {
        try {
            const res = await axios.get<BikeWithImages[]>(`/api/bikes/owner?ownerId=${ownerId}`);
            setBikes(res.data);
        }
        catch (error) {
            toast.error("Failed to load bikes.");
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBikes();
    }, []);

    // Handle form submission for create/update bike
    const onSubmit = async (data: z.infer<typeof bikeSchema>) => {
        try {
            if (editingBike) {
                // Update existing bike via PUT
                const response = await axios.put(`/api/bikes/owner/${editingBike.id}`, data);
                toast.success(response.data.message);
            }
            else {
                // Create new bike via POST
                const response = await axios.post("/api/bikes/owner", { data, ownerId });
                toast.success(response.data.message);
            }
            setDialogOpen(false);
            setEditingBike(null);
            form.reset();
            fetchBikes();
        } catch (error) {
            console.error(error);
            toast.error("Operation failed.");
        }
    };

    // Handle edit action, prefill the form and open the dialog
    const handleEdit = (bike: BikeWithImages) => {
        setEditingBike(bike);
        form.reset({
            bikeName: bike.bikeName,
            bikeDescription: bike.bikeDescription,
            bikeLocation: bike.bikeLocation,
            pricePerHour: Number(bike.pricePerHour),
            available: bike.available,
        });
        setDialogOpen(true);
    };

    // Handle delete action
    const handleDelete = async (bikeId: number) => {
        try {
            const response = await axios.delete(`/api/bikes/owner/${bikeId}`);
            toast.success(response.data.message);
            fetchBikes();
        }
        catch (error) {
            toast.error("Failed to delete bike.");
        }
    };

    return (
        <section className="p-4 md:p-6 mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Bikes</h1>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            {editingBike ? "Update Bike" : "Add Bike"}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingBike ? "Update Bike" : "Add New Bike"}</DialogTitle>
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
                                    name="bikeDescription"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter description" />
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
                                    name="pricePerHour"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price per Hour</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Price per hour" type="number" min="0" step="0.05" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* <FormField
                                    name="bikeImage"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bike Image</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Choose a image for the bike" type="file"/>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                /> */}
                                {/* You may add additional form fields (e.g., availability, images) here if needed */}
                                <div className="flex justify-center">
                                    <Button type="submit" className="w-full">
                                        {editingBike ? "Update Bike" : "Add Bike"}
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
                <div className="overflow-x-auto border rounded-md">
                    {bikes.length === 0 ? (
                        <p className="p-4 text-gray-600">No bikes found.</p>
                    ) : (
                        <div className="space-y-4">
                            {bikes.map((bike) => (
                                <div key={bike.id}>
                                    <BikeCard bike={bike} onEdit={handleEdit} onDelete={handleDelete} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default OwnerBikes;
