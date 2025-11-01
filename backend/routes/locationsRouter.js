import express from "express";
import authenticate from "#root/middlewares/authenticate.js";
import requireRole from "#root/middlewares/requireRole.js";
import validateBody from "#root/decorators/validateBody.js";
import ctrlWrapper from "#root/decorators/ctrlWrapper.js";
import {
  createLocationSchema,
  listLocationsQuerySchema,
  updateLocationSchema,
} from "#root/validators/locations.js";

import {
  listLocations,
  createLocation,
  getLocation,
  updateLocation,
  deleteLocation,
} from "#root/controllers/locationsController.js";
import validateQuery from "#root/decorators/validateQuery.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  validateQuery(listLocationsQuerySchema),
  ctrlWrapper(listLocations)
);

router.post(
  "/",
  authenticate,
  requireRole("admin", "manager"),
  validateBody(createLocationSchema),
  ctrlWrapper(createLocation)
);

router.get("/:id", authenticate, ctrlWrapper(getLocation));

router.put(
  "/:id",
  authenticate,
  requireRole("admin", "manager"),
  validateBody(updateLocationSchema),
  ctrlWrapper(updateLocation)
);

router.delete(
  "/:id",
  authenticate,
  requireRole("admin", "manager"),
  ctrlWrapper(deleteLocation)
);

export default router;
