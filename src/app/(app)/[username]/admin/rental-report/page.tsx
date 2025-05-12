// src/app/(app)/admin/rental-report/page.tsx
"use client";
import React, { useEffect, useRef, useState } from 'react';
import { ApiResponse } from "@/types/ApiResponse";
import { Invoice as InvoiceModel } from "@prisma/client";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaFileInvoice } from "react-icons/fa";
import Invoice, { InvoiceProps } from "@/components/Invoice";
import { useReactToPrint } from "react-to-print";

const RentalReport = () => {
    const [loading, setLoading] = useState(false);
    const [rentals, setRentals] = useState<InvoiceModel[]>([]);
    const [openId, setOpenId] = useState<number | null>(null);
    const invoiceRef = useRef<HTMLDivElement>(null);

    // const [dialogOpen, setDialogOpen] = useState(false);
    // const [invoiceData, setInvoiceData] = useState<InvoiceProps["invoice"] | null>(null);

    const fetchRentalReport = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/admin/rental-report`);
            setRentals(response.data);
        }
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRentalReport();
    }, []);

    const fmtDate = (d: Date) => d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    const handleDelete = async (inovice: InvoiceModel) => {
        try {
            const response = await axios.delete(`/api/admin/rental-report/${inovice.id}`);
            toast.success(response.data.message);
            fetchRentalReport();
        }
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message || "Failed to delete owner");
        }
    }

    const handlePrint = useReactToPrint({
        contentRef: invoiceRef,
        documentTitle: `Invoice_${openId}`,
        pageStyle: `
              @media print {
                body { -webkit-print-color-adjust: exact; }
                .no-print { display: none !important; }
              }
            `,
    });

    return (
        <section className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Rental Report</h1>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                rentals &&
                <div className="overflow-x-auto rounded-md border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-blue-500 hover:bg-blue-600">
                                <TableHead className="text-white font-semibold text-[16px]">Id</TableHead>
                                <TableHead className="text-white font-semibold text-[16px]">Customer Name</TableHead>
                                <TableHead className="text-white font-semibold text-[16px]">Customer Contact</TableHead>
                                <TableHead className="text-white font-semibold text-[16px]">Owner Name</TableHead>
                                <TableHead className="text-white font-semibold text-[16px]">Owner Contact</TableHead>
                                <TableHead className="text-white font-semibold text-[16px]">Bike Name</TableHead>
                                <TableHead className="text-white font-semibold text-[16px]">Start Date</TableHead>
                                <TableHead className="text-white font-semibold text-[16px]">End Date</TableHead>
                                <TableHead className="text-white font-semibold text-[16px]">Price/Day (₹)</TableHead>
                                <TableHead className="text-white font-semibold text-[16px]">Total Price (₹)</TableHead>
                                <TableHead className="text-center text-white font-semibold text-[16px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rentals.map((rental) => (
                                <TableRow key={rental.id}>
                                    <TableCell className="text-center">{rental.id}</TableCell>
                                    <TableCell>{rental.customerName}</TableCell>
                                    <TableCell>{rental.customerContact}</TableCell>
                                    <TableCell>{rental.ownerName}</TableCell>
                                    <TableCell>{rental.ownerContact}</TableCell>
                                    <TableCell>{rental.bikeName}</TableCell>
                                    <TableCell>{fmtDate(new Date(rental.startTime))}</TableCell>
                                    <TableCell>{fmtDate(new Date(rental.endTime))}</TableCell>
                                    <TableCell className="text-center">{rental.pricePerDay.toString()}</TableCell>
                                    <TableCell className="text-center">{rental.totalPrice.toString()}</TableCell>
                                    <TableCell className="text-center flex gap-2">
                                        <Dialog open={openId === rental.id} onOpenChange={open => setOpenId(open ? rental.id : null)}>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="bg-green-500 hover:bg-green-600">
                                                    <FaFileInvoice className="h-4 w-4" />
                                                    <span className="sr-only md:not-sr-only md:ml-2">View Bill</span>
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-full min-w-3xl sm:max-w-md max-h-200 overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>View Bill</DialogTitle>
                                                </DialogHeader>
                                                <div className="px-4 flex flex-col gap-4">
                                                    <div ref={invoiceRef} className="invoice-print bg-white w-full p-6 shadow-lg rounde">
                                                        {rental && <Invoice invoice={rental} />}
                                                    </div>

                                                    <div className="flex items-center justify-center">
                                                        <Button onClick={() => handlePrint()}>Print Bill</Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only md:not-sr-only md:ml-2">Delete</span>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the rentl history
                                                        <strong> "{rental.id}"</strong> and remove their data from the system.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(rental)}>
                                                        Confirm Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

        </section>
    );
};

export default RentalReport;
