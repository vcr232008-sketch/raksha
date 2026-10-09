import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "./api-response";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadImage(file: File): Promise<string> {
  if (!process.env.CLOUDINARY_API_SECRET) throw new ApiError(500, "Cloudinary is not configured");
  if (!ALLOWED.includes(file.type)) throw new ApiError(415, "Only JPEG, PNG or WebP images are allowed");
  if (file.size > MAX_BYTES) throw new ApiError(413, "Image must be 5MB or smaller");
  const buf = Buffer.from(await file.arrayBuffer());
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "aura-boutique/products" }, (err, res) =>
        err || !res ? reject(err) : resolve(res.secure_url))
      .end(buf);
  });
}

export async function deleteImageByUrl(url: string) {
  const m = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
  if (m) await cloudinary.uploader.destroy(m[1]).catch(() => undefined);
}
