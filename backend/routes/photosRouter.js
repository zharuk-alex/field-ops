import { Router } from "express";
import multer from "multer";

import ctrlWrapper from "../decorators/ctrlWrapper.js";
import authenticate from "../middlewares/authenticate.js";

import {
  uploadPhoto,
  deletePhoto,
  getAuditPhotos,
  getAnswerPhotos,
} from "../controllers/photosController.js";

const photosRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

photosRouter.post(
  "/upload",
  authenticate,
  upload.single("photo"),
  ctrlWrapper(uploadPhoto)
);

photosRouter.delete("/:id", authenticate, ctrlWrapper(deletePhoto));

photosRouter.get("/audit/:auditId", authenticate, ctrlWrapper(getAuditPhotos));

photosRouter.get(
  "/answer/:answerId",
  authenticate,
  ctrlWrapper(getAnswerPhotos)
);

export default photosRouter;
