import express from "express";
import authenticate from "../middlewares/authenticate.js";
import requireRole from "../middlewares/requireRole.js";
import {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/usersController.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  requireRole("admin", "manager"),
  ctrlWrapper(createUser)
);

router.get(
  "/",
  authenticate,
  requireRole("admin", "manager"),
  ctrlWrapper(listUsers)
);

router.get("/:id", authenticate, ctrlWrapper(getUser));

router.put("/:id", authenticate, ctrlWrapper(updateUser));

router.delete("/:id", authenticate, ctrlWrapper(deleteUser));

export default router;
