import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  pdfUpload: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 }, // Increased from 1MB
  }).onUploadComplete(async ({ metadata, file }) => {
    console.log("File upload complete. URL:", file.url);
    return { uploadedBy: "JB", url: file.url };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;