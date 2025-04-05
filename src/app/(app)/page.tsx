"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
    const currentYear = new Date().getFullYear();

    return (
        <>
            {/* Hero Section */}
            <section className="bg-gray-100 py-12 px-4 md:px-0">
                <div className="container mx-auto flex flex-col items-center justify-center text-center gap-6">
                    <div className="flex flex-col items-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 mt-4">
                            Bike Buddy
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 mt-2">
                            Your Premium Bike Rental Experience
                        </p>
                    </div>
                    <p className="max-w-2xl text-gray-700 text-sm md:text-base">
                        Discover the freedom of urban mobility with Bike Buddy. Rent the perfect bike quickly and securely with real-time tracking, seamless payments, and a user-friendly platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/sign-in">
                            <Button variant="default" className="px-6 py-3 text-base">
                                Get Started
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
                                From city bikes to electric bikes, find the perfect ride for any occasion.
                            </CardContent>
                        </Card>
                        <Card className="p-4">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">Real-Time Tracking</CardTitle>
                            </CardHeader>
                            <CardContent className="text-gray-600 text-sm">
                                Stay updated with live GPS tracking for a safe and reliable rental experience.
                            </CardContent>
                        </Card>
                        <Card className="p-4">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">Secure Payments</CardTitle>
                            </CardHeader>
                            <CardContent className="text-gray-600 text-sm">
                                Enjoy a smooth and secure payment process with integrated payment gateways.
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
                        ></iframe>
                    </div>
                </div>
            </section>
        </>
    );
}
