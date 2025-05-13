// src/components/Invoice.tsx
import React, { forwardRef } from "react";
import { Invoice as InvoiceModel } from "@prisma/client";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell
} from "@/components/ui/table";

export interface InvoiceProps {
    invoice: InvoiceModel | null;
}

const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(({ invoice }, ref) => {
    // 1) parse timestamps
    const start = new Date(invoice!.startTime);
    const end = new Date(invoice!.endTime);

    // 2) compute duration in days (round up)
    const durationDays = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 3) format numbers & dates
    const fmtDate = (d: Date) => d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    const fmtMoney = (amt: number) =>
        new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }
        ).format(amt);


    return (
        <Card ref={ref} className="max-w-2xl mx-auto p-6 bg-white print:bg-white">
            {/* HEADER */}
            <CardHeader className="flex justify-between items-center pb-4">
                <div>
                    <CardTitle className="text-2xl">Bike Buddy</CardTitle>
                    <p className="text-sm text-muted-foreground">Invoice</p>
                </div>
                <div className="text-right space-y-1">
                    <p className="text-sm">Invoice #{invoice?.id}</p>
                    <p className="text-sm">Date: {fmtDate(new Date(invoice!.createdAt))}</p>
                </div>
            </CardHeader>

            <Separator />

            {/* BILLING / OWNER INFO */}
            <CardContent className="py-4 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold">Billed To:</h3>
                        <p>{invoice?.customerName}</p>
                        <p>{invoice?.customerContact}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Owner:</h3>
                        <p>{invoice?.ownerName}</p>
                        <p>{invoice?.ownerContact}</p>
                    </div>
                </div>

                {/* LINE ITEMS */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Bike</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Rate / day</TableHead>
                            <TableHead className="text-right">Days</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>{invoice?.bikeName}</TableCell>
                            <TableCell>{invoice?.bikeType}</TableCell>
                            <TableCell className="text-right">
                                {fmtMoney(Number(invoice?.pricePerDay))}
                            </TableCell>
                            <TableCell className="text-right">{durationDays}</TableCell>
                            <TableCell className="text-right">
                                {fmtMoney(invoice!.totalPrice)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>

            <Separator />

            {/* FOOTER TOTAL */}
            <CardFooter className="flex justify-end">
                <div className="space-y-1 text-right">
                    <p className="font-medium text-lg">
                        Grand Total: {fmtMoney(invoice!.totalPrice)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Paid via {invoice!.paymentMethod}
                    </p>
                </div>
            </CardFooter>
        </Card>
    );
});
Invoice.displayName = "Invoice";
export default Invoice;