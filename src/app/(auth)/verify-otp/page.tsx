"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";

const VerifyOTP = () => {
    const [otp, setOtp] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const router = useRouter();

    const handleVerify = async () => {
        setIsVerifying(true);
        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ otp }), // include email from session or step before
            });

            const data = await res.json();

            if (data.success) {
                toast.success("OTP verified successfully");
                router.push("/reset-password");
            } else {
                toast.error(data.message || "Invalid OTP");
            }
        } catch (error) {
            toast.error("Failed to verify OTP");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center mb-6">Enter Verification Code</h1>
                <p className="text-center text-sm text-gray-600 mb-6">
                    Please check your email for a 6-digit code.
                </p>
                <div className="flex justify-center mb-6">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                        <InputOTPGroup>
                            {[...Array(6)].map((_, i) => (
                                <InputOTPSlot key={i} index={i} />
                            ))}
                        </InputOTPGroup>
                    </InputOTP>
                </div>
                <Button onClick={handleVerify} disabled={isVerifying || otp.length !== 6} className="w-full">
                    {isVerifying ? "Verifying..." : "Verify Code"}
                </Button>
            </div>
        </div>
    );
};

export default VerifyOTP;
