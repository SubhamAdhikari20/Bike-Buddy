// lib/uploadImage.ts
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true,
});

export async function uploadImage(
    buffer: Buffer,
    filename: string,
    folder: string = "bike-buddy"
): Promise<string> {
    const basename = filename.replace(/\.[^/.]+$/, "");
    const timestamp = Date.now();
    const publicId = `${folder}/${basename}-${timestamp}`;

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                public_id: publicId,
                folder,
                resource_type: "image",
                overwrite: true,
            },
            (err, result) => {
                if (err) return reject(err);
                resolve(result!.secure_url);
            }
        );

        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
}

// Multiple Images in the Cloudinary
export async function uploadMultipleImages(
    buffers: Buffer[],
    filenames: string[],
    folder: string = "bike-buddy/damages"
): Promise<string[]> {

    return Promise.all(buffers.map((buf, i) => new Promise<string>((resolve, reject) => {
        const publicId = `${folder}/${filenames[i].replace(/\..+$/, '')}-${Date.now()}`;
        const stream = cloudinary.uploader.upload_stream(
            {
                public_id: publicId,
                folder,
                resource_type: "image",
                overwrite: true,
            },
            (err, result) => err ? reject(err) : resolve(result!.secure_url)
        );
        streamifier.createReadStream(buf).pipe(stream);
    })));
}
