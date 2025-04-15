// src/app/(auth)/reset-password/[email]/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import * as z from "zod";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { resetPasswordSchema } from "@/schemas/user-schemas/resetPasswordSchema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";;
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Loader2 } from "lucide-react";

const ResetPassword = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const params = useParams<{ email: string }>();

    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);

    const form = useForm<z.infer<typeof resetPasswordSchema>>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: ""
        }
    });

    const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
        setIsSubmitting(true);
        try {
            const response = await axios.put<ApiResponse>("/api/auth/reset-password", {
                email: params.email,
                password: data.password
            });

            toast('Success', {
                description: response.data.message
            });

            router.replace(`/sign-in`);
        }
        catch (error) {
            console.error("Error in reseting password of the user", error);
            const axiosError = error as AxiosError<ApiResponse>;

            toast('Reset Password failed', {
                description: axiosError.response?.data.message || "Something went wrong"
            });
        }
        finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>
                <p className="text-sm text-center text-gray-600 mb-6">
                    Enter your new password to reset your password.
                </p>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="New Password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="cursor-pointer absolute inset-y-0 end-2.5 z-20 text-gray-400  focus:outline-hidden focus:text-blue-600 dark:text-neutral-600 dark:focus:text-blue-500"
                                        >
                                            {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                                        </button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="confirmPassword"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm Password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <button
                                            type="button"
                                            onClick={toggleConfirmPasswordVisibility}
                                            className="cursor-pointer absolute inset-y-0 end-2.5 z-20 text-gray-400  focus:outline-hidden focus:text-blue-600 dark:text-neutral-600 dark:focus:text-blue-500"
                                        >
                                            {showConfirmPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                                        </button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center justify-center">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Please wait
                                    </>
                                ) : (
                                    "Sign up"
                                )}
                            </Button>
                        </div>

                    </form>
                </Form>
            </div>
        </div>
    );
};

export default ResetPassword;
