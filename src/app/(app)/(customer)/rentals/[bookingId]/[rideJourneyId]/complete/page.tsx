// src/app/(customer)/rentals/[bookingId]/[rideJourneyId]/complete/page.tsx:
"use client";
import { useState, useEffect, useRef } from "react";
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
import StarRatings from "react-star-ratings";
import { FormControl, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

    const [preview, setPreview] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleSubmit = async () => {
        if (rating === 0) {
            return toast.error("Please select a star rating");
        }

        setSubmitting(true);
        try {
            let imageUrl: string | undefined;
            if (selectedFile) {
                const uploadForm = new FormData();
                uploadForm.append("image", selectedFile);

                try {
                    const uploadResponse = await axios.post<{ url: string }>("/api/upload-image", uploadForm);
                    imageUrl = uploadResponse.data.url;
                }
                catch (error) {
                    const axiosError = error as AxiosError<ApiResponse>;
                    toast.error(`Image upload failed: ${axiosError.response?.data.message || "Unknown error"}`);
                    return;
                }
            }

            const enumRating = ([
                StarRatingEnum.one,
                StarRatingEnum.two,
                StarRatingEnum.three,
                StarRatingEnum.four,
                StarRatingEnum.five,
            ])[rating - 1];

            const payload = {
                rideJourneyId: Number(rideJourneyId),
                customerId: Number(session?.user.id),
                bikeId: bike?.id,
                rating: enumRating,
                comment,
                reviewBikeImageUrl: imageUrl,
            };

            const response = await axios.post("/api/reviews", payload);

            toast.success(response?.data.message || "Thank you for your feedback!");
            router.replace(`/bikes/${bike?.id}`);
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
            <div className="relative h-48 rounded-lg overflow-hidden">
                {/* <div className="flex items-center gap-4"> */}
                {bike?.bikeImageUrl ? (
                    <Image
                        src={bike.bikeImageUrl}
                        alt={bike.bikeName}
                        fill
                        className="w-full h-50 object-cover rounded-lg"
                    // className="w-20 h-20 object-cover rounded"
                    />
                ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded" />
                )}
                <div className="absolute inset-0 bg-black/25" />

                <div className="absolute bottom-4 left-4 text-white">
                    <h1 className="text-2xl font-semibold">{bike.bikeName}</h1>
                    <p className="text-sm">
                        Average rating:{" "}
                        <span className="font-medium">{avgRating.toFixed(1) ?? 0}</span> / 5 (
                        {(avgRating ?? 0) > 0 ? "" : "no reviews yet"})
                    </p>
                </div>
            </div>

            {/* Rating control
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
            </div> */}

            {/* Star selector */}
            <div className="flex flex-col gap-2 justify-center items-center">
                <h2 className="text-lg font-medium">How was your ride?</h2>
                <StarRatings
                    rating={rating}
                    starRatedColor="#F59E0B"
                    starEmptyColor="#E5E7EB"
                    changeRating={(newRating) => setRating(newRating)}
                    numberOfStars={5}
                    name="ride-rating"
                    starDimension="32px"
                    starSpacing="4px"
                />
            </div>

            <div>
                <div className="flex gap-4">
                    <Button
                        type="button"
                        size="sm"
                        className="bg-gray-400 hover:bg-gray-500 flex-1"
                        disabled={submitting}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Bike Image
                    </Button>
                    <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={onImageChange}
                        className="hidden"
                        disabled={submitting}
                    />
                    {(preview && selectedFile) && (
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={submitting}
                            onClick={() => {
                                setSelectedFile(null);
                                setPreview("");
                            }}
                            className="flex-1"
                        >
                            Remove
                        </Button>
                    )}
                </div>
                {preview && (
                    <div className="relative w-full h-64 mt-5 md:h-[400px] rounded-lg overflow-hidden">
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="w-full h-50 object-cover rounded-lg"
                        />
                    </div>
                )}
            </div>

            {/* Comment box */}
            <div>
                <h3 className="text-lg font-medium">Tell us more</h3>
                <Textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Anything we can improve?"
                    className="mt-2 resize-none"
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