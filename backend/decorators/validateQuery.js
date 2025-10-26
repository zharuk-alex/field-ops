import HttpError from "../helpers/HttpError.js";

export default function validateQuery(schema, options = {}) {
  const joiOpts = {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
    ...options,
  };

  return (req, _res, next) => {
    const { error, value } = schema.validate(req.query, joiOpts);
    if (error) {
      const msg =
        error.details?.map((d) => d.message).join("; ") || "Invalid query";
      return next(HttpError(400, msg));
    }

    req.query = value;
    next();
  };
}
