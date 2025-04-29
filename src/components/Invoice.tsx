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





// "use client";
// import React, { forwardRef } from "react";
// import {
//     Card,
//     CardHeader,
//     CardTitle,
//     CardContent,
// } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";

// export interface BookingData {
//     id: number;
//     startTime: string;
//     endTime: string;
//     totalPrice: number;
//     paymentReference: string;
//     bike: {
//         bikeName: string;
//         pricePerDay: number;
//     };
//     customer: {
//         fullName: string;
//         email: string;
//     };
//     payment: {
//         method: string;
//         transactionId: string;
//         createdAt: string;
//     };
// }

// interface InvoiceProps {
//     booking: BookingData;
// }

// // forwardRef so react-to-print can access the DOM node
// const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(({ booking }, ref) => {
//     const {
//         id,
//         startTime,
//         endTime,
//         totalPrice,
//         paymentReference,
//         bike: { bikeName, pricePerDay },
//         customer: { fullName, email },
//         payment: { method, transactionId, createdAt },
//     } = booking;

//     const days = Math.max(
//         1,
//         Math.ceil(
//             (new Date(endTime).getTime() - new Date(startTime).getTime()) /
//             (1000 * 60 * 60 * 24)
//         )
//     );

//     return (
//         <div ref={ref} className="p-8 bg-white w-full max-w-lg mx-auto">
//             <Card className="shadow-none border-none">
//                 <CardHeader className="pb-2">
//                     <div className="flex justify-between items-center">
//                         <h2 className="text-xl font-bold">Bike Buddy Invoice</h2>
//                         <span className="text-sm text-gray-500">#{id}</span>
//                     </div>
//                     <p className="text-xs text-gray-500 mt-1">
//                         {new Date(createdAt).toLocaleString()}
//                     </p>
//                 </CardHeader>

//                 <Separator />

//                 <CardContent>
//                     <div className="grid grid-cols-2 gap-4 mb-6">
//                         <div>
//                             <h3 className="font-medium">Billed To</h3>
//                             <p>{fullName}</p>
//                             <p>{email}</p>
//                         </div>
//                         <div className="text-right">
//                             <h3 className="font-medium">Payment Method</h3>
//                             <p className="capitalize">{method}</p>
//                             <p className="mt-1 text-xs text-gray-500">
//                                 Ref: {transactionId}
//                             </p>
//                         </div>
//                     </div>

//                     <table className="w-full text-left mb-6">
//                         <thead>
//                             <tr className="border-b">
//                                 <th className="py-2">Description</th>
//                                 <th className="py-2">Qty / Days</th>
//                                 <th className="py-2">Unit Price (₹)</th>
//                                 <th className="py-2">Amount (₹)</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             <tr className="border-b">
//                                 <td className="py-2">{bikeName}</td>
//                                 <td className="py-2">{days}</td>
//                                 <td className="py-2">{pricePerDay.toFixed(2)}</td>
//                                 <td className="py-2">{(days * pricePerDay).toFixed(2)}</td>
//                             </tr>
//                         </tbody>
//                     </table>

//                     <div className="flex justify-end">
//                         <div className="w-1/2">
//                             <div className="flex justify-between mb-1">
//                                 <span>Subtotal</span>
//                                 <span>₹ {(days * pricePerDay).toFixed(2)}</span>
//                             </div>
//                             {/* Tax, discounts etc could go here */}
//                             <Separator className="my-2" />
//                             <div className="flex justify-between font-bold">
//                                 <span>Total</span>
//                                 <span>₹ {totalPrice.toFixed(2)}</span>
//                             </div>
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// });

// Invoice.displayName = "Invoice";
// export default Invoice;
