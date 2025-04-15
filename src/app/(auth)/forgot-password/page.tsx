// src/app/(auth)/forgot-password/page.tsx
"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/schemas/user-schemas/forgotPasswordSchema";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import * as z from "zod";
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";;
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ForgotPassword = () => {
    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
        setIsSubmitting(true);
        try {
            const response = await axios.post<ApiResponse>("/api/auth/forgot-password", data);

            toast('Success', {
                description: response.data.message
            });

            router.replace(`/verify-email-reset-password/${data.email}`);
        }
        catch (error) {
            console.error("Error sending forgot password request", error);
            const axiosError = error as AxiosError<ApiResponse>;
            toast("Failed", {
                description: axiosError.response?.data.message || "Failed to send reset instructions",
            });
        }
        finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-center mb-6">Forgot Password</h1>
                <p className="text-sm text-center text-gray-600 mb-6">
                    Enter your email address to receive password reset instructions.
                </p>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="you@example.com"
                                            {...field}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500"

                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center justify-center">
                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                {isSubmitting ? "Sending..." : "Reset Password"}
                            </Button>
                        </div>
                    </form>
                </Form>

                <div className="text-center mt-4">
                    <p>
                        Back to sign in?{" "}
                        <Link href="/sign-in" className="text-blue-600">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div >
    );
};

export default ForgotPassword;
