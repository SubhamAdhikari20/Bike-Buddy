// src/model/Review.ts
import prisma from "@/lib/prisma";
import { Review, Rating } from "@prisma/client";

export async function createReview(data: {
    customerId: number;
    customerName: string;
    customerProfilePictureUrl: string;
    bikeId: number;
    rating: Rating;
    comment: string;
    rideJourneyId: number;
    reviewBikeImageUrl?: string;
}): Promise<Review> {
    return await prisma.review.create({
        data: {
            customerId: data.customerId,
            bikeId: data.bikeId,
            rating: data.rating,
            comment: data.comment,
            customerName: data.customerName,
            customerProfilePictureUrl: data.customerProfilePictureUrl,
            rideJourneyId: data.rideJourneyId,
            reviewBikeImageUrl: data.reviewBikeImageUrl

        },
    });
}

export async function getReviewById(id: number): Promise<Review | null> {
    return await prisma.review.findUnique({ where: { id } });
}

export async function getAllReviews(): Promise<Review[]> {
    return await prisma.review.findMany();
}

export async function updateReview(
    id: number,
    data: Partial<{
        rating: Rating;
        comment: string;
    }>
): Promise<Review> {
    return await prisma.review.update({ where: { id }, data });
}

export async function deleteReview(id: number): Promise<Review> {
    return await prisma.review.delete({ where: { id } });
}
