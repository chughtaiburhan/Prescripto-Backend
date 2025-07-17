import { v2 as cloudinary } from "cloudinary";
import connectCloudinary from "./cloudinary";

export const uploadImage = async (imageFile: File): Promise<string> => {
  console.log("Starting image upload process...");
  console.log("Image file details:", {
    name: imageFile.name,
    size: imageFile.size,
    type: imageFile.type,
  });

  // Check if Cloudinary is configured
  const hasCloudinary =
    process.env.CLOUDINARY_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_SECRET_KEY;

  if (!hasCloudinary) {
    console.log("Cloudinary not configured, using fallback image service");
    // Generate a unique image based on file name and timestamp
    const timestamp = Date.now();
    const fileName = imageFile.name.replace(/\.[^/.]+$/, ""); // Remove extension
    const imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      fileName
    )}&background=5f6FFF&color=fff&size=300&rounded=true&bold=true&t=${timestamp}`;
    console.log("Generated fallback image URL:", imageUrl);
    return imageUrl;
  }

  // Try Cloudinary first
  try {
    console.log("Attempting Cloudinary upload...");
    await connectCloudinary();

    // Convert File to buffer
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "doctors",
            resource_type: "auto",
            transformation: [
              { width: 300, height: 300, crop: "fill" },
              { quality: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    const imageUrl = (result as any).secure_url;
    console.log("Image uploaded to Cloudinary successfully:", imageUrl);
    return imageUrl;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);

    // Fallback to a reliable placeholder service
    try {
      const timestamp = Date.now();
      const fileName = imageFile.name.replace(/\.[^/.]+$/, "");
      const imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        fileName
      )}&background=5f6FFF&color=fff&size=300&rounded=true&bold=true&t=${timestamp}`;
      console.log("Using fallback image after Cloudinary failure:", imageUrl);
      return imageUrl;
    } catch (fallbackError) {
      console.error("Fallback image failed:", fallbackError);
      // Final fallback - base64 encoded simple image
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjNWY2RkZGIi8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEyMCIgcj0iNDAiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMDAgMjAwQzEwMCAxNzAgMTMwIDE0MCAxNTAgMTQwQzE3MCAxNDAgMjAwIDE3MCAyMDAgMjAwIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K";
    }
  }
};

export const getDefaultDoctorImage = (): string => {
  // Return a reliable default image URL using a working service
  return "https://ui-avatars.com/api/?name=Doctor&background=5f6FFF&color=fff&size=300&rounded=true&bold=true";
};

export const getFallbackDoctorImage = (doctorName?: string): string => {
  // Generate a fallback image with the doctor's name
  const name = doctorName || "Doctor";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=5f6FFF&color=fff&size=300&rounded=true&bold=true`;
};
