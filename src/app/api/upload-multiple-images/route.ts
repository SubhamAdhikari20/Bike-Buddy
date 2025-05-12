// app/api/upload-multiple-images/route.ts
import { NextResponse, NextRequest } from "next/server";
import { uploadMultipleImages } from "@/lib/uploadImage";

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(req: NextRequest) {
    try {
        const form = await req.formData();
        // collect all files under the key "images"
        const files = form.getAll("images").filter(f => f instanceof File) as File[];
        if (files.length === 0) {
            return NextResponse.json({ error: "No images provided" }, { status: 400 });
        }

        const buffers: Buffer[] = await Promise.all(
            files.map(f => f.arrayBuffer().then(ab => Buffer.from(ab)))
        );

        const names = files.map(f => f.name);
        const urls = await uploadMultipleImages(buffers, names);    // upload all
        return NextResponse.json({ urls }, { status: 200 });
    }
    catch (error: any) {
        console.error("Upload failed:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
