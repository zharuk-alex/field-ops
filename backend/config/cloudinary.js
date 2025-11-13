import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

function ensureConfigured() {
  if (isConfigured) return;

  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  } else if (process.env.CLOUDINARY_URL) {
    try {
      const url = new URL(process.env.CLOUDINARY_URL);
      cloudinary.config({
        cloud_name: url.host,
        api_key: url.username,
        api_secret: url.password,
      });
    } catch (error) {
      console.error("Failed CLOUDINARY_URL:", error.message);
      throw new Error("Failed CLOUDINARY_URL");
    }
  } else {
    console.error("Cloudinary configuration failed");
    throw new Error("Cloudinary configuration failed");
  }

  isConfigured = true;
}

const cloudinaryProxy = new Proxy(cloudinary, {
  get(target, prop) {
    ensureConfigured();
    return target[prop];
  },
});

export default cloudinaryProxy;
