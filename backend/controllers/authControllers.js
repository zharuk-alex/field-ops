import fs from "node:fs/promises";
import path from "node:path";

import * as authServices from "../services/authServices.js";
import { sendVerificationEmail } from "../services/emailService.js";
import { nanoid } from "nanoid";

const avatarsPath = path.resolve("public", "avatars");
const getVerificationUrl = ({ host, verificationToken }) =>
  `${host}/api/auth/verify/${verificationToken}`;

export const register = async (req, res) => {
  const { email, password } = req.body;
  const host = `${req.protocol}://${req.get("host")}`;
  const verificationToken = nanoid();
  const verificationUrl = getVerificationUrl({ host, verificationToken });
  const result = await authServices.registerUser({
    email,
    password,
    verificationToken,
  });

  await sendVerificationEmail(email, verificationUrl);

  res.status(201).json({
    user: {
      email: result.email,
      subscription: result.subscription,
    },
  });
};

export const login = async (req, res) => {
  const { user, token } = await authServices.loginUser(req.body);

  // if (!user.verify) {
  //   return res.status(404).json({ message: "Email not verified" });
  // }

  res.json({
    token,
    user: {
      email: user?.email,
      subscription: user?.subscription,
    },
  });
};

export const logout = async (req, res) => {
  const { id } = req.user;
  await authServices.logoutUser({ id });
  res.status(204).send();
};

export const currentUser = async (req, res) => {
  const { id, email, firstName, lastName, role, status, companyId, createdAt } = req.user;

  res.json({
    id,
    email,
    firstName,
    lastName,
    role,
    status,
    companyId,
    createdAt,
  });
};

export const updateAvatar = async (req, res) => {
  const { id, avatarURL: oldAvatarURL } = req.user;
  let avatarURL = null;
  if (req.file) {
    const { path: oldPath, filename } = req.file;
    const newPath = path.join(avatarsPath, filename);
    await fs.rename(oldPath, newPath);
    avatarURL = path.join("avatars", filename);
  }

  const result = await authServices.updateUser({ id }, { avatarURL });

  if (oldAvatarURL) {
    const oldAvatarPath = path.resolve("public", oldAvatarURL);
    try {
      await fs.unlink(oldAvatarPath);
    } catch (error) {
      console.warn(error);
    }
  }

  res.status(200).json({
    avatarURL: result.avatarURL,
  });
};

export const verifyEmail = async (req, res, next) => {
  const { verificationToken } = req.params;

  const user = await authServices.findUser({ verificationToken });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await user.update({
    verify: true,
    verificationToken: null,
  });

  res.status(200).json({ message: "Verification successful" });
};

export const resendVerificationEmail = async (req, res, next) => {
  const { email } = req.body;
  const user = await authServices.findUser({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.verify) {
    return res
      .status(400)
      .json({ message: "Verification has already been passed" });
  }

  const host = `${req.protocol}://${req.get("host")}`;
  const verificationUrl = getVerificationUrl({
    host,
    verificationToken: user.verificationToken,
  });

  await sendVerificationEmail(email, verificationUrl);

  res.json({ message: "Verification email sent" });
};
