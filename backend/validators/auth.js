import Joi from "joi";

export const authRegisterSchema = Joi.object({
  username: Joi.string(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const authLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const authResendVerifySchema = Joi.object({
  email: Joi.string().email().required(),
});
