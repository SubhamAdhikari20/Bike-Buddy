// src/app/(auth)/sign-up/page.tsx
"use client"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebounceValue, useDebounceCallback } from 'usehooks-ts';
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/user-schemas/signUPSchema";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
import { Loader2 } from 'lucide-react';
import { FaEye, FaEyeSlash } from "react-icons/fa";


const SignUp = () => {
    // const [fullName, setFullName] = useState("");
    // const [contact, setContact] = useState("");
    // const [email, setEmail] = useState("");
    // const [password, setPassword] = useState("");
    // const [confirmPassword, setConfirmPassword] = useState("");

    const [username, setUsername] = useState("");
    const [usernameMessgae, setUsernameMessage] = useState("");
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const debounced = useDebounceCallback(setUsername, 300);
    const router = useRouter();

    // zod implementation
    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            fullName: "",
            username: "",
            email: "",
            contact: "",
            password: "",
            confirmPassword: ""
        }
    });

    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);

    useEffect(() => {
        const checkUsernameUnique = async () => {
            if (username) {
                setIsCheckingUsername(true);
                setUsernameMessage("");
                try {
                    const response = await axios.get(`/api/auth/check-username-unique?username=${username}`);
                    setUsernameMessage(response.data.message);
                }
                catch (error) {
                    const axiosError = error as AxiosError<ApiResponse>;
                    setUsernameMessage(axiosError.response?.data.message ?? "Error checking username!");
                }
                finally {
                    setIsCheckingUsername(false);
                }
            }
        }
        checkUsernameUnique();
    }, [username]);

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true);

        try {
            const response = await axios.post<ApiResponse>("/api/auth/sign-up", data);

            toast.success('Success', {
                description: response.data.message
            });

            router.replace(`/verify/${username}`);
        }
        catch (error) {
            console.error("Error in sign up of user", error);
            const axiosError = error as AxiosError<ApiResponse>;

            let errorMessage = axiosError.response?.data.message;
            toast.error('Sign Up failed', {
                description: errorMessage
            });
        }
        finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="flex justify-center items-center min-h-screen bg-gray-100 px-5 py-10 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                        Bike Buddy
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-gray-600">
                        Sign up to start your adventure
                    </p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            name="fullName"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Full Name" {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="username"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Username" {...field}
                                            onChange={(e) => {
                                                field.onChange(e)
                                                debounced(e.target.value)
                                            }}
                                        />
                                    </FormControl>
                                    {isCheckingUsername && <Loader2 className="animate-spin" />}
                                    <p className={`text-sm ${usernameMessgae === "Username is available" ? "text-green-500" : "text-red-500"}`}>
                                        {usernameMessgae}
                                    </p>
                                    {/* <FormDescription>
                                        This is your public display name.
                                    </FormDescription> */}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="contact"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contact" {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="Email" {...field}
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
                                                placeholder="Confirm Password" {...field}
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

                        <FormField
                            name="role"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={field.value}
                                            onValueChange={(value) => field.onChange(value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent className="mt-1">
                                                <SelectItem value="customer">Customer</SelectItem>
                                                {/* <SelectItem value="owner">Owner</SelectItem> */}
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
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
                <div className="text-center mt-4">
                    <p className="text-sm">
                        Already have an account?{" "}
                        <Link href="/sign-in" className="text-blue-600 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
};

export default SignUp;
