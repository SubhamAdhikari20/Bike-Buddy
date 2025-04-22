// src/app/(app)/[username]/customer/dashboard/layout.tsx
"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function CustomerDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/sign-in");
        }
    }, [status, router])

    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin h-10 w-10 text-gray-600" />
            </div>
        );
    }

    return (
        <>
            {/* Hero Section */}
            <section className="bg-gray-100 py-12 px-4 md:px-0">
                <div className="container mx-auto flex items-center justify-center text-center gap-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800">
                        Welcome back, {session?.user?.fullName ?? session?.user?.username}!
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600">
                        Your Premium Bike Rental Dashboard
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href={`/${session?.user?.username}/customer/bikes`}>
                            <Button className="px-6 py-3 text-base">Browse Bikes</Button>
                        </Link>
                        <Link href={`/${session?.user?.username}/customer/history`}>
                            <Button variant="outline" className="px-6 py-3 text-base">
                                Rental History
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-8">Why Choose Bike Buddy?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="p-4">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">Wide Range of Bikes</CardTitle>
                            </CardHeader>
                            <CardContent className="text-gray-600 text-sm">
                                From city bikes to e‑bikes, find the perfect ride for any occasion.
                            </CardContent>
                        </Card>
                        <Card className="p-4">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">Real‑Time Tracking</CardTitle>
                            </CardHeader>
                            <CardContent className="text-gray-600 text-sm">
                                Stay updated with live GPS tracking for a safe and reliable rental.
                            </CardContent>
                        </Card>
                        <Card className="p-4">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">Secure Payments</CardTitle>
                            </CardHeader>
                            <CardContent className="text-gray-600 text-sm">
                                Enjoy a smooth & secure payment process with integrated gateways.
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Demo / Video Section */}
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-4 flex flex-col items-center">
                    <h2 className="text-3xl font-bold text-center mb-8">Experience Bike Buddy in Action</h2>
                    <div className="w-full max-w-3xl aspect-video rounded overflow-hidden shadow-lg">
                        <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/your_bike_demo_video?controls=1"
                            title="Bike Buddy Demo Video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            </section>
        </>
    );
}
