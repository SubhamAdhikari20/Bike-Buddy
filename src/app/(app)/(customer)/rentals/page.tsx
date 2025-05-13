// src/app/(customer)/rentals/page.tsx
"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import axios, { AxiosError } from "axios";
import { Bike, Booking, User, Invoice as InvoiceModel } from "@prisma/client"
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner";
import Image from "next/image";
import BookedBikeCard from "@/components/customer/BookedBikeCard";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FaFileInvoice } from "react-icons/fa";
import Invoice from "@/components/Invoice";
import { useReactToPrint } from "react-to-print";


type RentalWithBikeAndCustomerAndOwner = Booking & {
    bike: Bike & { owner: User };
    customer: User;
};


export default function MyRentalsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [rentals, setRentals] = useState<RentalWithBikeAndCustomerAndOwner[]>([]);
    const [rentalsHistory, setRentalsHistory] = useState<RentalWithBikeAndCustomerAndOwner[]>([]);
    const [paymetsHistory, setPaymetsHistory] = useState<InvoiceModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [openId, setOpenId] = useState<number | null>(null);
    const invoiceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!session || session.user.role !== "customer") {
            signIn("credentials", { redirect: false });
            router.replace("/sign-in");
            return;
        }
    }, [session]);

    const userId = session?.user.id;
    const fetchRentals = async () => {
        setLoading(true);
        try {
            const response = await axios.get<{ success: boolean, rentals: RentalWithBikeAndCustomerAndOwner[] }>(`/api/bookings/my-rentals?customerId=${userId}`);
            if (response.data.success) {
                setRentals(response.data.rentals);
            }
        }
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message);
        }
        finally {
            setLoading(false);
        }
    }

    const fetchRentalHistroy = async () => {
        setLoading(true);
        try {
            const response = await axios.get<{ success: boolean, rentals: RentalWithBikeAndCustomerAndOwner[] }>(`/api/bookings/my-rentals/rental-history?customerId=${userId}`);
            if (response.data.success) {
                setRentalsHistory(response.data.rentals);
            }
        }
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message);
        }
        finally {
            setLoading(false);
        }
    }

    const fetchPaymentHistroy = async () => {
        setLoading(true);
        try {
            const response = await axios.get<{ success: boolean, paymentsHistory: InvoiceModel[] }>(`/api/bookings/my-rentals/payment-history?customerId=${userId}`);
            if (response.data.success) {
                setPaymetsHistory(response.data.paymentsHistory);
            }
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
        if (userId) {
            fetchRentals();
            fetchRentalHistroy();
            fetchPaymentHistroy();
        }
    }, [userId]);

    const fmtDate = (d: Date) => d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

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

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-gray-600" />
            </div>
        );
    }

    return (
        <section className="container mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-4">My Rentals</h1>
            <Tabs defaultValue="current-rentals" className="space-y-4">
                <TabsList className="flex gap-2">
                    <TabsTrigger value="current-rentals">
                        Current Rentals
                    </TabsTrigger>
                    <TabsTrigger value="rental-history">
                        Rental History
                    </TabsTrigger>
                    <TabsTrigger value="payment-history">
                        Payment History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="current-rentals">
                    {rentals.length === 0 ? (
                        <p>You have no active rentals.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {rentals.map(rental => (
                                <BookedBikeCard key={rental.id} booking={rental} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="rental-history">
                    {rentalsHistory.length === 0 ? (
                        <p>You have no active rentals.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {rentalsHistory.map(rental => (
                                <BookedBikeCard key={rental.id} booking={rental} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="payment-history">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        paymetsHistory &&
                        <div className="overflow-x-auto rounded-md border shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-blue-500 hover:bg-blue-600">
                                        <TableHead className="text-white font-semibold text-[16px]">Id</TableHead>
                                        {/* <TableHead className="text-white font-semibold text-[16px]">Customer Name</TableHead>
                                        <TableHead className="text-white font-semibold text-[16px]">Customer Contact</TableHead> */}
                                        <TableHead className="text-white font-semibold text-[16px]">Owner Name</TableHead>
                                        <TableHead className="text-white font-semibold text-[16px]">Owner Contact</TableHead>
                                        <TableHead className="text-white font-semibold text-[16px]">Bike Name</TableHead>
                                        <TableHead className="text-white font-semibold text-[16px]">Start Date</TableHead>
                                        <TableHead className="text-white font-semibold text-[16px]">End Date</TableHead>
                                        <TableHead className="text-center text-white font-semibold text-[16px]">Price/Day (₹)</TableHead>
                                        <TableHead className="text-center text-white font-semibold text-[16px]">Total Price (₹)</TableHead>
                                        <TableHead className="text-center text-white font-semibold text-[16px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paymetsHistory.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="text-center">{payment.id}</TableCell>
                                            {/* <TableCell>{payment.customerName}</TableCell>
                                            <TableCell>{payment.customerContact}</TableCell> */}
                                            <TableCell>{payment.ownerName}</TableCell>
                                            <TableCell>{payment.ownerContact}</TableCell>
                                            <TableCell>{payment.bikeName}</TableCell>
                                            <TableCell>{fmtDate(new Date(payment.startTime))}</TableCell>
                                            <TableCell>{fmtDate(new Date(payment.endTime))}</TableCell>
                                            <TableCell className="text-center">{payment.pricePerDay.toString()}</TableCell>
                                            <TableCell className="text-center">{payment.totalPrice.toString()}</TableCell>
                                            <TableCell className="text-center">
                                                <Dialog open={openId === payment.id} onOpenChange={open => setOpenId(open ? payment.id : null)}>
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
                                                                {payment && <Invoice invoice={payment} />}
                                                            </div>

                                                            <div className="flex items-center justify-center">
                                                                <Button onClick={() => handlePrint()}>Print Bill</Button>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </section>
    );
}
