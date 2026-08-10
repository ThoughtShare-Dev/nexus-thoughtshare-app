import express from "express";

import {
  createReview,
  getReview,
  getReviewsForMember,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createReview);

router.get("/member/:id", authenticate, getReviewsForMember);

router.get("/:id", authenticate, getReview);

router.patch("/:id", authenticate, updateReview);

router.delete("/:id", authenticate, deleteReview);

export default router;