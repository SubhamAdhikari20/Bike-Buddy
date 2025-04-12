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
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const SignIn = () => {
    const router = useRouter();

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: "",
            password: ""
        }
    });

    const onSubmit = async (data: z.infer<typeof loginSchema>) => {
        const result = await signIn("credentials", {
            redirect: false,
            identifier: data.identifier,
            password: data.password,
            role: data.role,
        });

        if (result?.error) {
            // toast('Login Failed', {
            //     description: "Incorrect username or password"
            // });

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
        }

        if (result?.url) {
            router.replace("/dashboard");
        }
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
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Password" {...field}
                                                className="w-full"
                                            />
                                        </FormControl>
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
                                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
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
