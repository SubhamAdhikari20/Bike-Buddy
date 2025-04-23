// src/app/(app)/about/page.tsx
"use client"
import React, { useState } from 'react';
import Image from "next/image";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { messageSchema } from "@/schemas/messageSchema";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";


const Contact = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof messageSchema>>({
        resolver: zodResolver(messageSchema),
        defaultValues: {
            fullName: "",
            email: "",
            contact: "",
            message: ""
        }
    });

    const onSubmit = async (data: z.infer<typeof messageSchema>) => {
        setIsSubmitting(true);
        // Simulate form submission (replace with actual API call if needed)
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsSubmitting(false);
        form.reset();
    };


    return (
        <section className="flex justify-center items-center min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#2D3748] p-8 rounded-lg shadow-lg">
                {/* Informational Section */}
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-white">Contact Us</h1>
                    <p className="text-[#A0AEC0]">
                        We are available for questions, feedback, or collaboration opportunities. Let us know how we can help!
                    </p>
                    <Image
                        src="/bike-contact-bg-1.jpg"
                        alt="Contact Us Image"
                        width={300}
                        height={400}
                        className="rounded-lg object-cover"
                    />
                </div>

                {/* Contact Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            name="fullName"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#CBD5E0]">Full Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Your Name"
                                            {...field}
                                            className="bg-white text-[#1A202C] placeholder:text-[#A0AEC0]"
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
                                    <FormLabel className="text-[#CBD5E0]">Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="Email"
                                            {...field}
                                            className="bg-white text-[#1A202C] placeholder:text-[#A0AEC0]"
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
                                    <FormLabel className="text-[#CBD5E0]">Phone Number</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Your 10-digit Indian Number"
                                            {...field}
                                            className="bg-white text-[#1A202C] placeholder:text-[#A0AEC0]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="message"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#CBD5E0]">Message</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Type your message here"
                                            {...field}
                                            className="bg-white text-[#1A202C] placeholder:text-[#A0AEC0]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center justify-center">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-white text-[#1A202C] hover:bg-gray-200"
                            >
                                {isSubmitting ? (
                                    <>
                                        Please wait... <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                    </>
                                ) : (
                                    "Send Message"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </section>
    );
};

export default Contact;
