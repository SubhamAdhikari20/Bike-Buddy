// src/app/(app)/(customer)/payment/checkout/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter
} from "@/components/ui/card";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage
} from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";

// --- form schema ---
const checkoutSchema = z.object({
    bookingId: z.string().nonempty(),
    totalPrice: z.string().nonempty(),
    method: z.enum(["khalti", "esewa"], {
        required_error: "Please select a payment method",
    }),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const CheckoutPage = () => {
    const router = useRouter();
    const params = useSearchParams();

    const bookingId = params.get("bookingId") || "";
    const totalPrice = params.get("totalPrice") || "";

    const form = useForm<CheckoutForm>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: { bookingId, totalPrice },
    });

    const onSubmit = async (data: CheckoutForm) => {
        try {
            const res = await fetch("/api/payments/initiate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bookingId: Number(data.bookingId),
                    amount: Number(data.totalPrice),
                    method: data.method,
                }),
            });
            const json = await res.json();
            // if (!json.success) throw new Error(json.message);
            if (!json.success) {
                toast.error(json.message);
                throw new Error(json.message);
            }

            if (json.method === "khalti") {
                window.location.href = json.paymentUrl;
            }
            else {
                // build & auto‐submit eSewa form
                const formEl = document.createElement("form");
                formEl.method = "POST";
                formEl.action = json.gatewayUrl;
                Object.entries(json.formData).forEach(([key, val]) => {
                    const inp = document.createElement("input");
                    inp.type = "hidden";
                    inp.name = key;
                    inp.value = String(val);
                    formEl.appendChild(inp);
                });
                document.body.appendChild(formEl);
                formEl.submit();
            }
        } catch (e: any) {
            toast.error(e.message);
        }
    }

    useEffect(() => {
        if (!bookingId || !totalPrice) {
            toast.error("Missing booking details – please start over.");
            router.replace("/bikes");
        }
    }, [bookingId, totalPrice, router]);




    return (
        <section className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Confirm Payment</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* hidden bookingId */}
                            <FormField
                                name="bookingId"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className="hidden">
                                        <FormControl>
                                            <Input {...field} readOnly />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* totalAmount */}
                            <FormField
                                name="totalPrice"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Amount (₹)</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled className="bg-gray-100" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* payment method */}
                            <FormField
                                name="method"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Method</FormLabel>
                                        <FormControl>
                                            <ToggleGroup
                                                type="single"
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="grid grid-cols-2 gap-4 w-full"
                                            >
                                                <ToggleGroupItem

                                                    value="khalti"
                                                    className="w-full flex flex-col items-center justify-center h-32 p-3 border border-gray-300 rounded-lg hover:border-blue-500 transition data-[state=on]:border-blue-600 data-[state=on]:bg-blue-50"
                                                >
                                                    <div className="relative w-full h-16">
                                                        <Image
                                                            src="/khalti.png"
                                                            alt="Khalti"
                                                            fill
                                                            className="object-fit object-cover"
                                                        />
                                                    </div>
                                                    {/* <span className="text-sm font-medium">Khalti</span> */}
                                                </ToggleGroupItem>
                                                <ToggleGroupItem
                                                    value="esewa"
                                                    className="flex flex-col items-center justify-center h-32 p-3 border border-gray-300 rounded-lg hover:border-blue-500 transition data-[state=on]:border-blue-600 data-[state=on]:bg-blue-50"
                                                >
                                                    <div className="relative w-full h-16">
                                                        <Image
                                                            src="/esewa.png"
                                                            alt="eSewa"
                                                            fill
                                                            className="object-fit object-cover"
                                                        />
                                                    </div>
                                                    {/* <span className="text-sm font-medium">eSewa</span> */}
                                                </ToggleGroupItem>
                                            </ToggleGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full">
                                Pay ₹{totalPrice}
                            </Button>
                        </form>
                    </Form>
                </CardContent>

                <CardFooter className="text-center text-xs text-gray-500">
                    Secured by <strong>Bike Buddy</strong>
                </CardFooter>
            </Card>
        </section>
    );
};

export default CheckoutPage;
