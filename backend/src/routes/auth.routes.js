import { authenticate } from "../middlewares/auth.middleware.js";
import express from "express";
import {
  register,
  login,
  getCurrentMember,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getCurrentMember);

export default router;