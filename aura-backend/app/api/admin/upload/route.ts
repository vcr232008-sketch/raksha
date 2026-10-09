import { ok, fail, handleError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

// multipart/form-data with one or more "files" fields -> { urls: string[] }
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const files = (await req.formData()).getAll("files").filter((f): f is File => f instanceof File);
    if (!files.length) return fail("No files provided", 400);
    if (files.length > 10) return fail("Maximum 10 images per upload", 400);
    const urls = await Promise.all(files.map(uploadImage));
    return ok({ urls }, 201);
  } catch (e) { return handleError(e); }
}
