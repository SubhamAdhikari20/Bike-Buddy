// src/app/(customer)/payment/receipt/page.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Invoice, { BookingData } from "@/components/Invoice";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ReceiptPage() {
    const router = useRouter();
    const params = useSearchParams();
    const status = params.get("status");
    const bookingId = params.get("bookingId");
    const isSuccess = status === "success";

    const [booking, setBooking] = useState<BookingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const invoiceRef = useRef<HTMLDivElement>(null);

    // 1) Fetch booking/invoice data
    useEffect(() => {
        fetch(`/api/bookings/${bookingId}?include=payment,bike,customer`)
            .then((res) => res.json())
            .then((data) => {
                setBooking(data.booking as BookingData);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [bookingId]);

    // 2) Print handler
    const handlePrint = useReactToPrint({
        contentRef: invoiceRef,
        documentTitle: `Invoice_${bookingId}`,
    });

    // 3) Download PDF handler
    const downloadPdf = async () => {
        if (!invoiceRef.current) return;
        const canvas = await html2canvas(invoiceRef.current, {
            scale: 2,
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ unit: "px", format: "a4" });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        // fit the image into A4
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
        pdf.save(`Invoice_${bookingId}.pdf`);
    };

    // 4) Render
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin h-8 w-8 text-green-600" />
                    </div>
                ) : error ? (
                    <Card>
                        <CardContent>
                            <p className="text-red-600 text-center">{error}</p>
                            <Button
                                variant="outline"
                                className="mt-4 w-full"
                                onClick={() => router.replace("/")}>
                                Go to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="mb-6 flex justify-between items-center no-print">
                            <Button onClick={() => router.replace("/")} variant="outline">
                                Go to Dashboard
                            </Button>
                            {isSuccess && (
                                <>
                                    <Button onClick={() => handlePrint?.()}>Print Bill</Button>
                                    <Button onClick={downloadPdf} variant="outline">
                                        Download PDF
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Invoice preview + print-only wrapper */}
                        <div className="no-print mb-4 text-center text-gray-700">
                            {isSuccess
                                ? "Below is your invoice. You can print or download it."
                                : "Payment failed; here’s what you can review."}
                        </div>

                        <div className="print:block no-print:hidden" ref={invoiceRef}>
                            {/* invisible on screen when printing, but react-to-print will capture it */}
                        </div>
                        {booking && <Invoice ref={invoiceRef} booking={booking} />}
                    </>
                )}
            </div>
        </div>
    );
}




// // src/app/(customer)/payment/receipt/page.tsx
// "use client";
// import { useSearchParams, useRouter } from "next/navigation";
// import {
//     Card,
//     CardHeader,
//     CardTitle,
//     CardContent,
//     CardFooter,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { CheckCircle, XCircle } from "lucide-react";

// export default function ReceiptPage() {
//     const router = useRouter();
//     const status = useSearchParams().get("status");
//     const isSuccess = status === "success";

//     return (
//         <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
//             <Card className="w-full max-w-md mx-auto shadow-lg">
//                 <CardHeader className="flex flex-col items-center pt-8">
//                     {isSuccess ? (
//                         <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
//                     ) : (
//                         <XCircle className="h-16 w-16 text-red-500 mb-4" />
//                     )}
//                     <CardTitle className="text-2xl font-semibold">
//                         {isSuccess ? "Payment Successful!" : "Payment Failed"}
//                     </CardTitle>
//                 </CardHeader>

//                 <CardContent>
//                     <p className="text-center text-gray-700 mb-6">
//                         {isSuccess ? (
//                             "Thank you for riding with Bike Buddy. Your booking is now completed."
//                         ) : (
//                             "Unfortunately, your payment could not be processed. Please try again or contact support."
//                         )}
//                     </p>
//                 </CardContent>

//                 <CardFooter className="flex justify-center pb-8">
//                     <Button
//                         variant="outline"
//                         className="w-full"
//                         onClick={() => router.replace("/")}>
//                         Go to Dashboard
//                     </Button>
//                 </CardFooter>
//             </Card>
//         </div>
//     );
// }