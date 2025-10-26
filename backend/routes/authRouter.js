import { Router } from "express";

import ctrlWrapper from "../decorators/ctrlWrapper.js";
import validateBody from "../decorators/validateBody.js";

import authenticate from "../middlewares/authenticate.js";
import upload from "../middlewares/upload.js";

import {
  authRegisterSchema,
  authLoginSchema,
  authResendVerifySchema,
} from "../validators/auth.js";

import {
  register,
  login,
  logout,
  currentUser,
  updateAvatar,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/authControllers.js";

const authRouter = Router();

authRouter.post(
  "/register",
  validateBody(authRegisterSchema),
  ctrlWrapper(register)
);

authRouter.post("/login", validateBody(authLoginSchema), ctrlWrapper(login));

authRouter.post("/logout", authenticate, ctrlWrapper(logout));

authRouter.get("/current", authenticate, ctrlWrapper(currentUser));

authRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  ctrlWrapper(updateAvatar)
);

authRouter.get("/verify/:verificationToken", ctrlWrapper(verifyEmail));

authRouter.post(
  "/verify",
  validateBody(authResendVerifySchema),
  ctrlWrapper(resendVerificationEmail)
);

export default authRouter;
