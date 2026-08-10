import express from "express";

import {
  createLearningRequest,
  getLearningRequests,
  updateLearningRequest,
} from "../controllers/learningRequest.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createLearningRequest);

router.get("/", authenticate, getLearningRequests);

router.patch("/:id", authenticate, updateLearningRequest);

export default router;