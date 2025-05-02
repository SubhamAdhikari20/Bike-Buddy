// src/app/(customer)/rentals/[bookingId]/[rideJourneyId]/complete/page.tsx:
"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Rating } from "react-simple-star-rating";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Bike, Rating as StarRatingEnum } from "@prisma/client";
import Image from "next/image";
import { ApiResponse } from "@/types/ApiResponse";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

type RideCompleteProps = {
    bookingId: string;
    rideJourneyId: string;
};

export default function RideCompletePage() {
    const { data: session, status } = useSession();
    const { bookingId, rideJourneyId } = useParams() as RideCompleteProps;
    const router = useRouter();
    const [bike, setBike] = useState<Bike | null>(null);
    const [avgRating, setAvgRating] = useState(0);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function loadData() {
            try {
                const r1 = await axios.get(`/api/bookings/my-rentals/${bookingId}/${rideJourneyId}/complete`);
                const bikeId = r1.data.booking.bikeId;
                const r2 = await axios.get(`/api/bikes/${bikeId}`);
                setBike(r2.data.bike);
                const r3 = await axios.get(`/api/reviews?bikeId=${bikeId}`);
                setAvgRating(r3.data.average);
            }
            catch (error) {
                const axiosError = error as AxiosError<ApiResponse>;
                toast.error(axiosError.response?.data.message || "Failed to load bike info");
            }
            finally {
                setLoading(false);
            }
        }
        loadData();
    }, [bookingId]);

    const handleSubmit = async () => {
        if (rating === 0) {
            return toast.error("Please select a star rating");
        }

        setSubmitting(true);
        try {
            const enumRating = ([
                StarRatingEnum.one,
                StarRatingEnum.two,
                StarRatingEnum.three,
                StarRatingEnum.four,
                StarRatingEnum.five,
            ])[rating - 1];

            const response = await axios.post("/api/reviews", {
                rideJourneyId: Number(rideJourneyId),
                customerId: Number(session?.user.id),
                bikeId: bike?.id,
                rating: enumRating,
                comment,
            });

            toast.success(response?.data.message || "Thank you for your feedback!");
            // router.replace(`/bikes/${bike?.id}`);
        }
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data?.message || "Failed to submit review");
        }
        finally {
            setSubmitting(false);
        }
    };

    if (loading || !bike) {
        return <p className="p-8 text-center">Loading...</p>;
    }

    return (
        <section className="max-w-xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow">
            {/* Bike header */}
            <div className="flex items-center gap-4">
                {bike?.bikeImageUrl ? (
                    <Image
                        src={bike.bikeImageUrl}
                        alt={bike.bikeName}
                        width={50}
                        height={50}
                        className="w-20 h-20 object-cover rounded"
                    />
                ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded" />
                )}
                <div>
                    <h1 className="text-xl font-semibold">{bike?.bikeName}</h1>
                    <p className="text-sm text-gray-600">
                        Average rating:{" "}
                        <span className="font-medium">{avgRating.toFixed(1)}</span> / 5 (
                        {avgRating > 0 ? "" : "no reviews yet"})
                    </p>
                </div>
            </div>

            {/* Rating control */}
            <div className="space-y-1">
                <h2 className="text-lg font-medium">How was your ride?</h2>
                <Rating
                    onClick={(rate) => setRating(rate)}
                    initialValue={rating}
                    size={32}
                    fillColor="#F59E0B"
                    emptyColor="#E5E7EB"
                    transition
                />
            </div>

            {/* Comment box */}
            <div>
                <h3 className="text-lg font-medium">Tell us more</h3>
                <Textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Anything we can improve?"
                    className="mt-1 min-h-20 max-h-35"
                />
            </div>

            {/* Submit */}
            <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
                {submitting ? "Submitting…" : "Submit Review"}
            </Button>
        </section>
    );
}