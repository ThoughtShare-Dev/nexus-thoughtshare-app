import express from "express";

import { authenticate } from "../middlewares/auth.middleware.js";

import {
  getCurrentMember,
  updateCurrentMember,
  getMemberById,
  updateSkills,
  searchMembers,
} from "../controllers/member.controller.js";

import { getReviewsForMember } from "../controllers/review.controller.js";

const router = express.Router();

router.get("/me", authenticate, getCurrentMember);

router.put("/me", authenticate, updateCurrentMember);

router.put("/me/skills", authenticate, updateSkills);

router.get("/", authenticate, searchMembers);

router.get("/:id/reviews", authenticate, getReviewsForMember);

router.get("/:id", authenticate, getMemberById);

export default router;