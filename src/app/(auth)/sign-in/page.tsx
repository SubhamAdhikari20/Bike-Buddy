// src/app/(auth)/sign-in/page.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { loginSchema } from "@/schemas/user-schemas/loginSchema";
import { signIn, getSession, useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const SignIn = () => {
    const router = useRouter();
    const { data: session, status } = useSession();

    // OTP dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [emailToVerify, setEmailToVerify] = useState("");
    const [code, setCode] = useState("");
    const [sendingCode, setSendingCode] = useState(false);

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

    // Sign In
    const onSubmit = async (data: z.infer<typeof loginSchema>) => {
        const result = await signIn("credentials", {
            redirect: false,
            identifier: data.identifier,
            password: data.password,
            role: data.role,
        });


        if (result?.error) {
            if (result.error == "CredentialsSignIn") {
                toast.error('Login Failed', {
                    description: "Incorrect username or password"
                });
            }
            else {
                toast.error('Error', {
                    description: result.error
                });
            }
            return;
        }

        const updatedSession = await getSession();

        if (!updatedSession) {
            toast.error("Session not found.");
            return;
        }

        const { user } = updatedSession;

        if (user.isVerified) {
            toast.success('Login Successful', {
                description: `Logged in as ${user.role}`
            });
            if (user.role === "customer") {
                router.replace(`/`);
            }
            else {
                router.replace(`/${user.username}/${user.role}/dashboard`);
            }
        }
        else {
            toast.warning('Account Not Verified', {
                description: `Do you want to verify your account?`,
                action: {
                    label: "Yes",
                    onClick: () => {
                        setEmailToVerify(user.email!);
                        setDialogOpen(true);
                    }
                }
            });
        }
    }

    // useEffect(() => {

    //     if (status !== "authenticated") {
    //         toast.error("Session not authenticated!");
    //         return;
    //     }

    //     if (!session) {
    //         toast.error("No Session");
    //         return;
    //     }

    //     const { user } = session;
    //     if (user.isVerified) {
    //         toast.success('Login Successful', {
    //             description: `Logged in as ${user.role}`
    //         });
    //         router.replace(`/${user.username}/${user.role}/dashboard`);
    //         return;
    //     }
    //     else {
    //         toast.warning('Account Not verified!', {
    //             description: `Do you want to verify your account?`,
    //             action: {
    //                 label: "Yes",
    //                 onClick: () => {
    //                     setEmailToVerify(user.email!);
    //                     return setDialogOpen(true);
    //                 },
    //             },
    //         });
    //         // setEmailToVerify(user.email!);
    //         // return setDialogOpen(true);
    //     }

    // }, [status, session, router]);

    const sendCode = async () => {
        setSendingCode(true);
        try {
            const response = await axios.put("/api/auth/send-verification-email", {
                email: emailToVerify,
            });
            toast.success(response.data.message);
            router.replace(`/verify/${session?.user.username}`);
        }
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message || "Failed to send code");
        }
        finally {
            setSendingCode(false);
        }
    }

    return (
        <section className="min-h-screen flex items-center justify-center bg-gray-100 px-5 py-10 sm:px-6 lg:px-8">
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

            {/* ─── VERIFY DIALOG ───────────────────────────────────── */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Verify Your Email</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label className="mb-2">Email</Label>
                            <Input value={emailToVerify} onChange={(e) => setEmailToVerify(e.target.value)} />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={sendCode}
                                disabled={sendingCode}
                                className="flex-1"
                            >
                                {sendingCode && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                Send Code
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </section>
    );
};

export default SignIn;
