// src/app/(auth)/sign-in/page.tsx
"use client"
import React, { useState } from 'react';
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { loginSchema } from "@/schemas/user-schemas/loginSchema";
import { signIn, getSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const SignIn = () => {
    const router = useRouter();

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: "",
            password: ""
        }
    });

    // State to control password visibility
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

    const onSubmit = async (data: z.infer<typeof loginSchema>) => {
        const result = await signIn("credentials", {
            redirect: false,
            identifier: data.identifier,
            password: data.password,
            role: data.role,
        });

        if (result?.error) {
            if (result.error == "CredentialsSignIn") {
                toast('Login Failed', {
                    description: "Incorrect username or password"
                });
            }
            else {
                toast('Error', {
                    description: result.error
                });
            }
            return;
        }

        const session = await getSession();
        const user = session?.user;
        if (!user?.username || !user?.role) {
            toast.error("Could not determine your user profile");
            return;
        }

        router.replace(`/${user.username}/${user.role}/dashboard`);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                        Bike Buddy
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-gray-600">
                        Sign in to start your adventure
                    </p>
                </div>
                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
                            <FormField
                                name="identifier"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username/Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Username or Email" {...field}
                                                className="w-full"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="password"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Password" {...field}
                                                    className="w-full pr-10"
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
                                name="role"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <FormControl>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                                <SelectContent className="w-full">
                                                    <SelectItem value="customer">Customer</SelectItem>
                                                    <SelectItem value="owner">Owner</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-center">
                                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                                    {form.formState.isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Please wait
                                        </>
                                    ) : (
                                        "Sign in"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                    <div className="text-center mt-4">
                        <p className="text-sm">
                            <Link href="/forgot-password" className="text-blue-600 hover:underline">
                                Forgot Password?
                            </Link>
                        </p>
                        <p className="mt-2 text-sm">
                            Don't have an account?{" "}
                            <Link href="/sign-up" className="text-blue-600 hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
