// src/app/(app)/about/page.tsx
"use client"
import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AboutUs = () => {
    return (
        <>
            <section className="relative h-64 md:h-96 w-full overflow-hidden text-gray-800">
                <div className="absolute inset-0 -z-10 hover:animate-out overflow-hidden">
                    <Image
                        src="/bike-bg-4.jpg"
                        alt="City cyclist riding"
                        fill
                        className="object-cover opacity-90"
                        style={{ opacity: 0.9 }}
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30 dark:from-blue-900/60 dark:to-gray-900/60 mix-blend-multiply"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 dark:to-background/90 bg-opacity-20" />
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white">
                        About Bike Buddy
                    </h1>
                    <p className="mt-2 text-sm md:text-lg font-semibold text-gray-100 max-w-2xl">
                        Your ultimate bike rental companion—fast, secure, and powered by real‑time GPS tracking.
                    </p>
                    <Link href="/bikes">
                        <Button
                            variant="outline"
                            className="mt-6 px-6 py-3 text-base text-gray-600 hover:text-gray-900"
                        >
                            Explore Bikes
                        </Button>
                    </Link>
                </div>
            </section>

            {/* ───── Content Card ───── */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <Card className="max-w-3xl mx-auto shadow-lg">
                        <CardHeader className="bg-white">
                            <CardTitle className="text-2xl font-bold text-green-600">
                                Our Story
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p>
                                Founded in 2025, Bike Buddy set out to make urban mobility
                                effortless and eco‑friendly. What started as a small fleet of
                                city bikes has grown into a network of riders, owners, and
                                enthusiasts united by the joy of two wheels.
                            </p>

                            <h3 className="text-xl font-semibold text-green-600">What We Offer</h3>
                            <ul className="list-disc list-inside space-y-2">
                                <li>Wide range of bikes: city, e‑bikes, and mountain.</li>
                                <li>Real‑time GPS tracking for peace of mind.</li>
                                <li>Seamless, secure payments via Khalti & eSewa.</li>
                                <li>User‑friendly search & filter by location, type, price.</li>
                                <li>24/7 in‑app support & damage reporting.</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-green-600">Our Mission</h3>
                            <p>
                                We believe everyone deserves the freedom of the open road.
                                Whether you’re commuting, exploring, or just enjoying fresh air,
                                Bike Buddy delivers reliable, sustainable rides that put you in
                                control of your journey.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </>
    );
};

export default AboutUs;
