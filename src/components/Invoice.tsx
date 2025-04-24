// src/components/Invoice.tsx
"use client";
import React, { forwardRef } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export interface BookingData {
    id: number;
    startTime: string;
    endTime: string;
    totalPrice: number;
    paymentReference: string;
    bike: {
        bikeName: string;
        pricePerDay: number;
    };
    customer: {
        fullName: string;
        email: string;
    };
    payment: {
        method: string;
        transactionId: string;
        createdAt: string;
    };
}

interface InvoiceProps {
    booking: BookingData;
}

// forwardRef so react-to-print can access the DOM node
const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(({ booking }, ref) => {
    const {
        id,
        startTime,
        endTime,
        totalPrice,
        paymentReference,
        bike: { bikeName, pricePerDay },
        customer: { fullName, email },
        payment: { method, transactionId, createdAt },
    } = booking;

    const days = Math.max(
        1,
        Math.ceil(
            (new Date(endTime).getTime() - new Date(startTime).getTime()) /
            (1000 * 60 * 60 * 24)
        )
    );

    return (
        <div ref={ref} className="p-8 bg-white w-full max-w-lg mx-auto">
            <Card className="shadow-none border-none">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Bike Buddy Invoice</h2>
                        <span className="text-sm text-gray-500">#{id}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {new Date(createdAt).toLocaleString()}
                    </p>
                </CardHeader>

                <Separator />

                <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <h3 className="font-medium">Billed To</h3>
                            <p>{fullName}</p>
                            <p>{email}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="font-medium">Payment Method</h3>
                            <p className="capitalize">{method}</p>
                            <p className="mt-1 text-xs text-gray-500">
                                Ref: {transactionId}
                            </p>
                        </div>
                    </div>

                    <table className="w-full text-left mb-6">
                        <thead>
                            <tr className="border-b">
                                <th className="py-2">Description</th>
                                <th className="py-2">Qty / Days</th>
                                <th className="py-2">Unit Price (₹)</th>
                                <th className="py-2">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="py-2">{bikeName}</td>
                                <td className="py-2">{days}</td>
                                <td className="py-2">{pricePerDay.toFixed(2)}</td>
                                <td className="py-2">{(days * pricePerDay).toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="flex justify-end">
                        <div className="w-1/2">
                            <div className="flex justify-between mb-1">
                                <span>Subtotal</span>
                                <span>₹ {(days * pricePerDay).toFixed(2)}</span>
                            </div>
                            {/* Tax, discounts etc could go here */}
                            <Separator className="my-2" />
                            <div className="flex justify-between font-bold">
                                <span>Total</span>
                                <span>₹ {totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});

Invoice.displayName = "Invoice";
export default Invoice;
