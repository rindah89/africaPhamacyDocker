import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  categoryImage: f({ image: { maxFileSize: "1MB" } }).onUploadComplete(
    async ({ file }) => {
      console.log("file url", file.url);
      return { uploadedBy: "JB" };
    }
  ),
  bannerImage: f({ image: { maxFileSize: "1MB" } }).onUploadComplete(
    async ({ file }) => {
      console.log("file url", file.url);
      return { uploadedBy: "JB" };
    }
  ),
  advertImage: f({ image: { maxFileSize: "1MB" } }).onUploadComplete(
    async ({ file }) => {
      console.log("file url", file.url);
      return { uploadedBy: "JB" };
    }
  ),
  brandLogo: f({ image: { maxFileSize: "1MB" } }).onUploadComplete(
    async ({ file }) => {
      console.log("file url", file.url);
      return { uploadedBy: "JB" };
    }
  ),
  warehouseLogo: f({ image: { maxFileSize: "1MB" } }).onUploadComplete(
    async ({ file }) => {
      console.log("file url", file.url);
      return { uploadedBy: "JB" };
    }
  ),
  supplierImage: f({ image: { maxFileSize: "1MB" } }).onUploadComplete(
    async ({ file }) => {
      console.log("file url", file.url);
      return { uploadedBy: "JB" };
    }
  ),
  // productImage: f({ image: { maxFileSize: "1MB" } }).onUploadComplete(
  //   async ({ file }) => {
  //     console.log("file url", file.url);
  //     return { uploadedBy: "JB" };
  //   }
  // ),
  productImages: f({
    image: { maxFileSize: "4MB", maxFileCount: 3 },
  }).onUploadComplete(async ({ file }) => {
    console.log("file url", file.url);
    return { uploadedBy: "JB" };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
