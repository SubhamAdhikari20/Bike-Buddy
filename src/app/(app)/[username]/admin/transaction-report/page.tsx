// src/app/(app)/[username]/admin/transaction-report/page.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { ApiResponse } from "@/types/ApiResponse";
import { Payment, PaymentStatus } from "@prisma/client";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
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
import { Button } from "@/components/ui/button";


const TransactionReport = () => {
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState<Payment[]>([]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/admin/transaction-report`);
            setTransactions(response.data);
        }
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message);
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fmtDate = (d: Date) => d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    return (
        <section className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Transaction Report</h1>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                transactions &&
                <div className="overflow-x-auto rounded-md border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-blue-500 hover:bg-blue-600">
                                <TableHead className="text-white font-semibold text-[16px] text-center">Id</TableHead>
                                <TableHead className="text-white font-semibold text-[16px]">Transaction ID</TableHead>
                                <TableHead className="text-white font-semibold text-[16px] text-center">Amount (₹)</TableHead>
                                <TableHead className="text-white font-semibold text-[16px] text-center">Payment Method</TableHead>
                                <TableHead className="text-white font-semibold text-[16px] text-center">Payment Status</TableHead>
                                <TableHead className="text-white font-semibold text-[16px] text-center">Booking ID</TableHead>
                                <TableHead className="text-white font-semibold text-[16px] text-center">Created At</TableHead>
                                <TableHead className="text-white font-semibold text-[16px] text-center">Updated At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell className="text-center">{transaction.id}</TableCell>
                                    <TableCell>{transaction.transactionId}</TableCell>
                                    <TableCell className="text-center">{transaction.amount}</TableCell>
                                    <TableCell className="text-center">{transaction.method}</TableCell>
                                    <TableCell className="text-center">
                                        <span className={transaction.status === 'success' ? 'text-green-600 font-semibold' : transaction.status === 'pending' ? 'text-amber-600' : 'text-red-600'}>
                                            {transaction.status.toUpperCase()}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">{transaction.bookingId}</TableCell>
                                    <TableCell className="text-center">{fmtDate(new Date(transaction.createdAt))}</TableCell>
                                    <TableCell className="text-center">{fmtDate(new Date(transaction.updatedAt))}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter className="bg-gray-100">
                            <TableRow>
                                <TableCell />
                                <TableCell className="text-left font-semibold">Total</TableCell>
                                <TableCell className="text-center font-semibold">₹ {totalAmount.toFixed(2)}</TableCell>
                                <TableCell colSpan={5} />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            )}
        </section>
    );
};

export default TransactionReport;
