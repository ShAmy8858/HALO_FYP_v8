import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";

interface UploadResult {
  storageProvider: string;
  storageKey: string;
  secureUrl: string | null;
}

const cloudinaryConfigured =
  Boolean(env.CLOUDINARY_CLOUD_NAME) && Boolean(env.CLOUDINARY_API_KEY) && Boolean(env.CLOUDINARY_API_SECRET);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

export async function uploadHospitalDocument(file: Express.Multer.File): Promise<UploadResult> {
  if (!cloudinaryConfigured) {
    return {
      storageProvider: "development",
      storageKey: `dev/${crypto.randomUUID()}-${file.originalname}`,
      secureUrl: null,
    };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "halo/hospital-documents",
        resource_type: "auto",
        use_filename: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed."));
          return;
        }

        resolve({
          storageProvider: "cloudinary",
          storageKey: result.public_id,
          secureUrl: result.secure_url,
        });
      },
    );

    stream.end(file.buffer);
  });
}
