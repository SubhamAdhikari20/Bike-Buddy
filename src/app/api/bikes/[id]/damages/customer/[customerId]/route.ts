// src/api/bikes/[id]/damages/customer/[customerId]/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getUserById } from "@/model/User";
import { getBikeById } from "@/model/Bike";
import { sendNotification } from "@/helpers/sendNotification";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string, customerId: string }> }) {
    try {
        const params = await context.params;
        const customerId = Number(params.customerId);
        if (!customerId) {
            return NextResponse.json(
                { success: false, message: "Customer Id is required" },
                { status: 400 }
            );
        }

        const bikeId = Number(params.id);
        if (!bikeId) {
            return NextResponse.json(
                { success: false, message: "Bike Id is required" },
                { status: 400 }
            );
        }

        const customer = await getUserById(customerId);
        if (!customer) {
            return NextResponse.json(
                { success: false, message: "Customer not found" },
                { status: 404 }
            );
        }

        const bike = await getBikeById(bikeId);
        if (!bike) {
            return NextResponse.json(
                { success: false, message: "Bike not found" },
                { status: 404 }
            );
        }

        const { description, images, bookingId } = await request.json();

        const damageReport = await prisma.damageReport.create({
            data: {
                bikeId: Number(bikeId),
                customerId: Number(customerId),
                customerName: customer.fullName,
                customerProfilePictureUrl: customer.profilePictureUrl,
                description,
                ownerId: bike?.ownerId,
                bookingId
            }
        });


        // If we got an array of image URLs, write them to DamageReportImages
        let damageReportImages;
        if (Array.isArray(images) && images.length > 0) {
            // Using createMany for bulk insert
            damageReportImages = await prisma.damageReportImages.createMany({
                data: images.map((url: string) => ({
                    damageReportId: damageReport.id,
                    imageUrl: url,
                })),
            });
        }

        if (damageReport || damageReportImages) {
            try {
                await sendNotification(
                    customerId.toString(),
                    "damage-registered-customer",
                    {
                        bikeName: bike?.bikeName,
                    }
                );
                await sendNotification(
                    bike?.ownerId.toString(),
                    "damage-registered-owner",
                    {
                        bikeName: bike?.bikeName,
                        customerName: customer.fullName,
                        customerContact: customer.contact,
                    }
                );
            }
            catch (error) {
                console.error("Knock notification error:", error);
            }
        }

        // const { damageReport, damageReportImages } = await prisma.$transaction(async (tx) => {
        //     const damageReport = await tx.damageReport.create({
        //         data: {
        //             bikeId: Number(bikeId),
        //             customerId: Number(customerId),
        //             customerName: customer.fullName,
        //             customerProfilePictureUrl: customer.profilePictureUrl,
        //             description,
        //             ownerId: bike?.ownerId,
        //             bookingId
        //         }
        //     });

        //     // If we got an array of image URLs, write them to DamageReportImages
        //     let damageReportImages;
        //     if (Array.isArray(images) && images.length > 0) {
        //         // Using createMany for bulk insert
        //         damageReportImages = await tx.damageReportImages.createMany({
        //             data: images.map((url: string) => ({
        //                 damageReportId: damageReport.id,
        //                 imageUrl: url,
        //             })),
        //         });
        //     }
        //     return { damageReport, damageReportImages };
        // });


        return NextResponse.json({ success: true, message: "Damage report submitted", damageReport }, { status: 200 });
    }
    catch (error) {
        console.error("Error reporting damage:", error);
        return NextResponse.json({ success: false, message: "Error reporting damage" }, { status: 500 });
    }
}


export async function GET(request: NextRequest, context: { params: Promise<{ id: string, customerId: string }> }) {
    try {
        const params = await context.params;
        const customerId = Number(params.customerId);
        if (!customerId) {
            return NextResponse.json(
                { success: false, message: "Customer Id is required" },
                { status: 400 }
            );
        }

        const bikeId = Number(params.id);
        if (!bikeId) {
            return NextResponse.json(
                { success: false, message: "Bike Id is required" },
                { status: 400 }
            );
        }
        const reports = await prisma.damageReport.findMany({
            where: {
                bikeId,
                customerId,
            },
            include: {
                bike: {
                    include: { owner: true },
                },
                customer: true,
                images: true
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ success: true, reports }, { status: 200 });
    }
    catch (error) {
        console.error("Error fetching damgre reports:", error);
        return Response.json(
            { success: false, message: "Failed to damgre reports" },
            { status: 500 }
        );
    }
};
