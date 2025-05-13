// src/app/(app)/page.tsx -> Main Page (Customer)
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signOut, useSession } from "next-auth/react";
import { Loader2, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Home() {
    const { data: session, status } = useSession();
    const currentUser = session?.user;

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin h-10 w-10 text-gray-600" />
            </div>
        );
    }

    // 1) Hero text phrases
    const phrases = currentUser
        ? [
            `Welcome, ${currentUser.fullName ?? currentUser.username}`,
            `Hello, ${currentUser.fullName ?? currentUser.username}`,
            `Ride on, ${currentUser.fullName ?? currentUser.username}`,
        ]
        : ["Bike Buddy", "Your Bike Companion", "Ride with Ease"];

    const [phraseIndex, setPhraseIndex] = useState(0);
    useEffect(() => {
        const iv = setInterval(
            () => setPhraseIndex((i) => (i + 1) % phrases.length),
            3000
        );
        return () => clearInterval(iv);
    }, [phrases.length]);

    return (
        <>
            {/* ───────────────────────── Hero Section ───────────────────────── */}
            <section className="relative overflow-hidden px-4 md:px-0 min-h-screen flex items-center">
                {/* Background image */}
                <div className="absolute inset-0 -z-10 hover:animate-out overflow-hidden">
                    <Image
                        src="/bike-bg-1.jpg"
                        alt="Bike Logo"
                        fill
                        className="object-cover opacity-60"
                        style={{ opacity: 0.60 }}
                        priority
                    />

                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30 dark:from-blue-900/60 dark:to-gray-900/60 mix-blend-multiply"></div>

                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 dark:to-background/90"></div>

                </div>

                <div className="container mx-auto flex flex-col items-center justify-center text-center gap-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800">
                        {phrases[phraseIndex]}
                    </h1>
                    {currentUser ? (
                        <>
                            {/* <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800">
                                Welcome, {currentUser.fullName ?? currentUser.username}
                            </h1> */}
                            <p className="max-w-xl text-gray-700 text-base sm:text-lg md:text-xl">
                                Your Premium Bike Rental Platform. Whether you need a quick ride
                                across town or a leisurely weekend tour, we’ve got you covered.
                            </p>
                            <p className="max-w-xl text-gray-800 text-base sm:text-lg md:text-xl">
                                Enjoy real‑time GPS tracking, seamless payments, and 24/7
                                support—your ride, your way.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/bikes">
                                    <Button className="px-6 py-3 text-base">Browse Bikes</Button>
                                </Link>
                                <Link href="/rentals">
                                    <Button variant="outline" className="px-6 py-3 text-base">
                                        Rental History
                                    </Button>
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800">
                                Bike Buddy
                            </h1> */}
                            <p className="max-w-xl text-gray-700 text-base sm:text-lg md:text-xl">
                                Discover the freedom of urban mobility. Rent the perfect bike
                                quickly and securely with:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 space-y-2 max-w-md text-sm sm:text-base">
                                <li>Real‑time GPS tracking</li>
                                <li>Seamless payments</li>
                                <li>Flexible rental durations</li>
                                <li>24/7 customer support</li>
                            </ul>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/sign-in">
                                    <Button className="px-6 py-3 text-base">Get Started</Button>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-8">Why Choose Bike Buddy?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="p-0 gap-2">
                            <CardHeader className="p-0">
                                <div className="relative h-60 w-full overflow-hidden">
                                    <Image
                                        src={`/bike-range-1.jpg`}
                                        alt={`Wide Range of Bikes`}
                                        fill
                                        className="object-cover rounded-t-xl"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                                <CardTitle className="px-4 pt-2 text-xl font-semibold">Wide Range of Bikes</CardTitle>
                            </CardHeader>
                            <CardContent className="text-gray-600 text-sm px-4 py-2 mb-2">
                                From city bikes to electric bikes, find the perfect ride for any occasion.
                            </CardContent>
                        </Card>
                        <Card className="p-0 gap-2">
                            <CardHeader className="p-0">
                                <div className="relative h-60 w-full overflow-hidden">
                                    <Image
                                        src={`/track-1.jpg`}
                                        alt={`Wide Range of Bikes`}
                                        fill
                                        className="object-cover rounded-t-xl"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                                <CardTitle className="px-4 pt-2 text-xl font-semibold">Real-Time Tracking</CardTitle>
                            </CardHeader>
                            <CardContent className="text-gray-600 text-sm px-4 py-2 mb-2">
                                Stay updated with live GPS tracking for a safe and reliable rental experience.
                            </CardContent>
                        </Card>
                        <Card className="p-0 gap-2">
                            <CardHeader className="p-0">
                                <div className="relative h-60 w-full overflow-hidden">
                                    <Image
                                        src={`/payment-1.jpg`}
                                        alt={`Wide Range of Bikes`}
                                        fill
                                        className="object-cover rounded-t-xl"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                                <CardTitle className="px-4 pt-2 text-xl font-semibold">Secure Payments</CardTitle>
                            </CardHeader>
                            <CardContent className="text-gray-600 text-sm px-4 py-2 mb-2">
                                Enjoy a smooth and secure payment process with integrated payment gateways.
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* ───────────────────── Testimonials ───────────────────── */}
            <section className="py-12 bg-background dark:bg-background-dark">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-8">Testimonials</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                name: "Subham Sharma",
                                role: "Adventure Enthusiast",
                                avatar: "/pp-2.jpg",
                                quote: `“Bike Buddy’s real-time GPS tracking turned my solo weekend ride into pure joy—no more “lost in the city” stress. Booking was instant, the bike was waiting, and payments were a breeze. Truly seamless from start to finish.”`
                            },
                            {
                                name: "Aayush Parazuli",
                                role: "Daily Commuter",
                                avatar: "/pp-3.jpg",
                                quote: `“I hopped on a Bike Buddy for my morning commute and was blown away by the smooth app experience. Unlocking the bike took seconds, the route guidance was spot-on, and I never looked back. Top-notch service!”`
                            },
                            {
                                name: "Susmita Malla",
                                role: "Weekend Explorer",
                                avatar: "/pp-1.jpg",
                                quote: `“Whether I'm zipping through downtown or tackling scenic country roads, Bike Buddy delivers perfect reliability. Their 24/7 support, transparent pricing, and live-map GPS mean I can ride with total confidence.”`
                            },
                        ].map((t, i) => (
                            <Card key={i} className="bg-muted p-6">
                                <CardContent className="flex flex-col h-full justify-between">
                                    <div className="space-y-4">
                                        <Quote className="w-6 h-6 text-muted-foreground" />
                                        <p className="text-sm text-foreground leading-relaxed md:text-[16px]">
                                            {t.quote}
                                        </p>
                                    </div>
                                    <div className="flex items-center mt-6">
                                        <Avatar className="border-1 border-black w-15 h-15">
                                            <AvatarImage src={t.avatar} alt={t.name} />
                                            <AvatarFallback>{t.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                        </Avatar>
                                        <div className="ml-4 text-left">
                                            <p className="font-medium text-foreground">{t.name}</p>
                                            <p className="text-xs text-muted-foreground">{t.role}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────────────────── Call To Action ───────────────────── */}
            <section className="relative h-[400px] sm:h-[500px] flex items-center overflow-hidden">
                {/* Background image */}
                <Image
                    src="/bike-bg-5.jpg"
                    alt="Ride Adventure"
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/60" />

                <div className="container mx-auto px-4 relative z-10 text-center text-white space-y-4">
                    <h2 className="text-4xl sm:text-5xl font-extrabold">
                        Start Your Bike Adventure
                    </h2>
                    <p className="max-w-xl mx-auto text-lg sm:text-xl">
                        Rent the perfect bike in seconds and explore your city on two wheels.
                    </p>
                    <Link href="/bikes">
                        <Button size="lg" className="mt-4 bg-gray-50 text-gray-800 font-bold text-[17px] hover:bg-gray-200">
                            Start Now
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Demo / Video Section */}
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-4 flex flex-col items-center">
                    <h2 className="text-3xl font-bold text-center mb-8">Experience Bike Buddy in Action</h2>
                    <div className="w-full max-w-3xl aspect-video rounded overflow-hidden shadow-lg">
                        <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/C-eCWfDIUXA?si=CrADAmA31-Hcqron"
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
