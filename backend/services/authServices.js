import bcrypt from "bcrypt";
import gravatar from "gravatar";

import User from "../db/models/User.js";

import HttpError from "../helpers/HttpError.js";

import { createToken } from "../helpers/jwt.js";

export const findUser = (query) =>
  User.findOne({
    where: query,
  });

export const updateUser = async (query, data) => {
  const user = await findUser(query);
  if (!user) return null;

  return user.update(data, {
    returning: true,
  });
};

export const registerUser = async (payload) => {
  const { email, password, verificationToken } = payload;
  const user = await User.findOne({
    where: {
      email,
    },
  });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatar = gravatar.url(email, { protocol: "https" });

  const newUser = await User.create({
    ...payload,
    password: hashPassword,
    avatarURL: avatar,
    verificationToken,
  });

  return newUser;
};

export const loginUser = async (payload) => {
  const { email, password } = payload;
  const user = await User.findOne({
    where: {
      email,
    },
  });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const paswordCompare = await bcrypt.compare(password, user.password);
  if (!paswordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }

  const token = createToken({ id: user.id });

  await user.update(
    { token },
    {
      returning: true,
    }
  );

  return {
    token,
    user,
  };
};

export const logoutUser = (query) => {
  return updateUser(query, { token: null });
};
