// src/app/(customer)/payment/receipt/page.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import Invoice, { InvoiceProps } from "@/components/Invoice";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { ApiResponse } from "@/types/ApiResponse";

export default function ReceiptPage() {
    const router = useRouter();
    const params = useSearchParams();

    const status = params.get("status");
    const transactionId = params.get("transaction_id") || params.get("transaction_uuid");
    const isSuccess = status === "success";

    const [invoiceData, setInvoiceData] = useState<InvoiceProps["invoice"] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const invoiceRef = useRef<HTMLDivElement>(null);

    // 1) Fetch invoice data
    const fetchInvoice = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/invoices?transaction_id=${transactionId}`);
            if (response.data.success) {
                setInvoiceData(response.data.invoice);
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
        fetchInvoice();
    }, [transactionId]);


    // 2) Print handler
    const handlePrint = useReactToPrint({
        contentRef: invoiceRef,
        documentTitle: `Invoice_${invoiceData?.id}`,
        pageStyle: `
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .no-print { display: none !important; }
          }
        `,
    });

    // 3) Download PDF handler
    const downloadPdf = async () => {
        if (!invoiceRef.current) {
            toast.error("Nothing to print");
            return;
        }

        try {
            // html2canvas options tuned:
            const canvas = await html2canvas(invoiceRef.current, {
                scale: 2,
                useCORS: true,
                logging: true,
                scrollY: -window.scrollY,      // capture the element at its on‐screen position
                windowWidth: document.body.scrollWidth,
                windowHeight: document.body.scrollHeight,
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ unit: "px", format: "a4" });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Fit the rendered image to an A4 page:
            const imgProps = (pdf as any).getImageProperties(imgData);
            const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height);
            const imgWidth = imgProps.width * ratio;
            const imgHeight = imgProps.height * ratio;

            pdf.addImage(
                imgData,
                "PNG",
                (pageWidth - imgWidth) / 2, // center horizontally
                20,                         // top margin
                imgWidth,
                imgHeight
            );

            pdf.save(`Invoice_${invoiceData?.id}.pdf`);
        } catch (err: any) {
            console.error("PDF generation error:", err);
            toast.error("Unable to generate PDF. Please try printing instead.");
        }
    };

    // const downloadPdf = async () => {
    //     if (!invoiceRef.current) {
    //         return;
    //     }

    //     const canvas = await html2canvas(invoiceRef.current, {
    //         scale: 2,
    //     });

    //     const imgData = canvas.toDataURL("image/png");
    //     const pdf = new jsPDF({ unit: "px", format: "a4" });
    //     const pageWidth = pdf.internal.pageSize.getWidth();
    //     const pageHeight = pdf.internal.pageSize.getHeight();
    //     // fit the image into A4
    //     pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
    //     pdf.save(`Invoice_${invoiceData?.id}.pdf`);
    // };

    // 4) Render
    return (
        <section className="min-h-screen bg-gray-50 p-4 flex items-start justify-center">
            <div className="w-full max-w-2xl">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin h-8 w-8 text-gray-600" />
                    </div>
                ) : error ? (
                    <Card className="mx-4">
                        <CardContent>
                            <p className="text-red-600 text-center">{error}</p>
                            <Button
                                variant="outline"
                                className="mt-4 w-full"
                                onClick={() => router.replace("/")}
                            >
                                Go to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* ─── Status Banner ─── */}
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 px-4">
                            <div className="flex items-center space-x-3">
                                {isSuccess ? (
                                    <CheckCircle className="h-10 w-10 text-green-500" />
                                ) : (
                                    <XCircle className="h-10 w-10 text-red-500" />
                                )}
                                <h2 className="text-2xl font-semibold">
                                    {isSuccess ? "Payment Successful!" : "Payment Failed"}
                                </h2>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.replace("/")}
                                className="mt-4 sm:mt-0"
                            >
                                Go to Dashboard
                            </Button>
                        </div>

                        {isSuccess && invoiceData && (
                            <div className="no-print flex flex-col sm:flex-row justify-center gap-2 mb-4 px-4">
                                <Button onClick={() => handlePrint()}>Print Bill</Button>
                                {/* <Button variant="outline" onClick={() => downloadPdf()}>
                                    Download PDF
                                </Button> */}
                            </div>
                        )}

                        {/* ─── Invoice */}
                        <div className="px-4">
                            <div ref={invoiceRef} className="invoice-print bg-white w-full p-6 shadow-lg rounde">
                                {invoiceData && <Invoice invoice={invoiceData} />}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </section>
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