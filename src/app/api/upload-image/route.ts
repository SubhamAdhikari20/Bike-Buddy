// app/api/upload-image/route.ts
import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/uploadImage";

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(req: Request) {
    try {
        const form = await req.formData();
        const file = form.get("image");

        if (!(file instanceof File)) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const url = await uploadImage(buffer, file.name);

        return NextResponse.json({ url }, { status: 200 });
    }
    catch (error: any) {
        console.error("Upload failed:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
