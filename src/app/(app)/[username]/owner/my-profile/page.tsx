// src/app/(app)/[username]/owner/my-profile/page.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
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
import { Input } from "@/components/ui/input";
import { User } from "@prisma/client";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ApiResponse } from "@/types/ApiResponse";
import { updateUserSchema } from "@/schemas/user-schemas/updateUserSchema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDebounceValue, useDebounceCallback } from 'usehooks-ts';


const OwnerProfile = () => {
    const { data: session, status } = useSession();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const router = useRouter();
    const userId = Number(session?.user.id);

    const [preview, setPreview] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [username, setUsername] = useState("");
    const [usernameMessgae, setUsernameMessage] = useState("");
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const debounced = useDebounceCallback(setUsername, 300);

    // Fetch the user
    const fetchUser = async () => {
        try {
            if (!userId) {
                toast.error("User ID is not available.");
                return;
            }
            const { data } = await axios.get<{ success: boolean; user: User }>(`/api/auth/edit-profile/${userId}`);
            setCurrentUser(data.user);

            form.reset({
                fullName: data?.user.fullName,
                username: data?.user.username,
                email: data?.user.email,
                contact: data?.user.contact,
            });
        }
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message);
        }
    };

    useEffect(() => {
        if (status === "authenticated") {
            fetchUser();
        }
    }, [status, userId]);


    const form = useForm<z.infer<typeof updateUserSchema>>({
        resolver: zodResolver(updateUserSchema),
        defaultValues: {
            fullName: currentUser?.fullName || "",
            username: currentUser?.username || "",
            email: currentUser?.email || "",
            contact: currentUser?.contact || "",
        }
    });

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

    const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            // const url = URL.createObjectURL(file);
            reader.readAsDataURL(file);
            setSelectedFile(file);
        }
    };

    const onSubmit = async (data: z.infer<typeof updateUserSchema>) => {
        setIsSubmitting(true);
        try {
            const response = await axios.put<ApiResponse>(`/api/auth/edit-profile/${userId}`, data);

            toast('Success', {
                description: response.data.message
            });
            await fetchUser();

            if (response.data.user?.username !== currentUser?.username) {
                await signOut({
                    callbackUrl: `/verify/${response.data.user?.username}`
                });
            }
        }
        catch (error) {
            console.error("Error in sign up of user", error);
            const axiosError = error as AxiosError<ApiResponse>;

            let errorMessage = axiosError.response?.data.message;
            toast('Sign Up failed', {
                description: errorMessage
            });
        }
        finally {
            setIsSubmitting(false);
        }
    };

    const handleClear = () => {
        form.reset({
            fullName: "",
            username: "",
            email: "",
            contact: "",
        });
    };

    // Handle delete
    const handleDelete = async (userId: number) => {
        try {
            const response = await axios.delete(`/api/auth/edit-profile/${userId}`);
            toast.success(response.data.message);
            signOut();
        }
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message);
        }
    };

    const handleUploadImage = async () => {
        try {
            let imageUrl = "";
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

            const profilePictureUrl = imageUrl;
            const response = await axios.put<ApiResponse>(`/api/auth/edit-profile/${userId}`, { profilePictureUrl: profilePictureUrl });

            toast.success(response.data.message);
            await fetchUser();
            // setCurrentUser((u) => u ? { ...u, profilePictureUrl: profilePictureUrl } : u);
        }
        catch (error) {
            console.error("Image upload failed", error);
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(`Image upload failed: ${axiosError.response?.data.message || "Unknown error"}`);
        }
    }

    return (
        <section className="p-3 md:p-5 mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-5">My Profile</h1>
            <div className="bg-[#d3ecdc] flex flex-col xl:flex-row xl:justify-evenly gap-4 justify-center items-center rounded-xl shadow-lg py-7 px-4">
                <div className="flex flex-col justify-center items-center gap-4">
                    <Avatar className="h-30 w-30 md:h-50 md:w-50 border-2 border-gray-900">
                        <AvatarImage
                            src={preview ? preview : (currentUser?.profilePictureUrl || undefined)}
                            alt={currentUser?.fullName || currentUser?.username || "Owner"}
                        />
                        <AvatarFallback className="text-6xl font-semibold text-gray-700">
                            {(currentUser?.fullName || currentUser?.username || "O")
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col items-center space-y-2">
                        <div className="flex flex-row! items-center gap-2">
                            <Button
                                type="button"
                                className="bg-gray-400 hover:bg-gray-500"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Change Profile Picture
                            </Button>

                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={onImageChange}
                                className="hidden"
                            />

                            {((preview || currentUser?.profilePictureUrl) && selectedFile) && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setPreview(currentUser?.profilePictureUrl || "");
                                    }}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            className="text-sm text-gray-500"
                            onClick={handleUploadImage}
                            disabled={!selectedFile}
                        >
                            {selectedFile ? 'Upload Image' : <>Select Image to Upload</>}
                        </Button>

                    </div>

                </div>

                <div className="w-full flex-1 max-w-md space-y-8 bg-white p-8 rounded-lg shadow-lg">
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
                            <div className="flex items-center justify-evenly gap-2">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                                >
                                    {isSubmitting ? (
                                        <>
                                            Please wait...
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        </>
                                    ) : (
                                        <>
                                            Update Details
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant={"outline"}
                                    className="flex-1 text-cyan-600 border-cyan-600 hover:bg-cyan-50"
                                    onClick={handleClear}
                                >
                                    Clear
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>

                <div className="flex mt-auto xl:self-end">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button type="button" variant="destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the user account
                                    <strong> "{currentUser?.fullName}"</strong> and remove their data from the system.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(Number(currentUser?.id))}>
                                    Confirm Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </section>
    );
};

export default OwnerProfile;
