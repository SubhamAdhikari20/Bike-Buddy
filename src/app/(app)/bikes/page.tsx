"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import BikeCard from "@/components/customer/BikeCard";
import { Loader2 } from "lucide-react";

type Bike = {
    id: number;
    bikeName: string;
    bikeDescription: string;
    bikeLocation: string;
    pricePerHour: number;
    bikeImageUrl?: string[];
};

export default function RentBike() {
    const [location, setLocation] = useState("");
    const [type, setType] = useState("");
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
    const [sortBy, setSortBy] = useState<"newest" | "priceAsc" | "priceDesc">(
        "newest"
    );
    const [page, setPage] = useState(1);
    const pageSize = 12;

    const [bikes, setBikes] = useState<Bike[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    // whenever any filter/sort/page changes, re-fetch
    useEffect(() => {
        const fetchBikes = async () => {
            setLoading(true);
            const qp = new URLSearchParams();
            if (location) qp.set("location", location);
            if (type) qp.set("type", type);
            qp.set("minPrice", priceRange[0].toString());
            qp.set("maxPrice", priceRange[1].toString());
            qp.set("sortBy", sortBy);
            qp.set("page", page.toString());
            qp.set("pageSize", pageSize.toString());

            const res = await fetch(`/api/bikes?${qp.toString()}`);
            const json = await res.json();
            setBikes(json.bikes || []);
            setTotal(json.total || 0);
            setLoading(false);
        };

        fetchBikes();
    }, [location, type, priceRange, sortBy, page]);

    const totalPages = Math.ceil(total / pageSize);

    const resetFilters = () => {
        setLocation("");
        setType("");
        setPriceRange([0, 10000]);
        setSortBy("newest");
        setPage(1);
    };

    return (
        <section className="container mx-auto px-4 py-8">
            {/* ───── Filters ───── */}
            <div className="mb-8 bg-[#f8f2f2] shadow-lg rounded-lg p-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {/* Location */}
                <div>
                    <Label className="block text-sm font-semibold mb-1">
                        Pick-up Location
                    </Label>
                    <Input
                        placeholder="e.g. Kathmandu"
                        value={location}
                        onChange={(e) => {
                            setLocation(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                {/* Type */}
                <div>
                    <Label className="block text-sm font-semibold mb-1">Bike Type</Label>
                    <Select
                        value={type}
                        onValueChange={(v) => {
                            setType(v);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* <SelectItem value="">Any</SelectItem> */}
                            <SelectItem value="city">City</SelectItem>
                            <SelectItem value="mountain">Mountain</SelectItem>
                            <SelectItem value="electric">Electric</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Price */}
                <div className="sm:col-span-2">
                    <Label className="block text-sm font-semibold mb-1">
                        Price / Hour (₹)
                    </Label>
                    <Slider
                        min={0}
                        max={10000}
                        step={1}
                        value={priceRange}
                        onValueChange={(v) => {
                            setPriceRange(v as [number, number]);
                            setPage(1);
                        }}
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>₹ {priceRange[0]}</span>
                        <span>₹ {priceRange[1]}</span>
                    </div>
                </div>

                {/* Sort */}
                <div>
                    <Label className="block text-sm font-semibold mb-1">Sort By</Label>
                    <Select
                        value={sortBy}
                        onValueChange={(v: any) => {
                            setSortBy(v);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Newest" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="priceAsc">Price: Low → High</SelectItem>
                            <SelectItem value="priceDesc">Price: High → Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Reset */}
                <div className="lg:col-span-2 flex justify-end items-center">
                    <Button variant="outline" onClick={resetFilters}>
                        Reset Filters
                    </Button>
                </div>
            </div>

            {/* ───── Results ───── */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin h-8 w-8 text-green-600" />
                </div>
            ) : bikes.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bikes.map((b) => (
                        <BikeCard key={b.id} bike={b as any} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-20">
                    No bikes match your filters.
                </p>
            )}

            {/* ─── Pagination ─── */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                    {Array.from({ length: totalPages }).map((_, idx) => (
                        <Button
                            key={idx}
                            variant={page === idx + 1 ? "default" : "outline"}
                            onClick={() => setPage(idx + 1)}
                        >
                            {idx + 1}
                        </Button>
                    ))}
                </div>
            )}
        </section>
    );
}
