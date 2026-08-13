import express from "express";

import {
  createReport,
  getReport,
  getMyReportList,
  getAllReportList,
  updateReport,
  deleteReport,
} from "../controllers/report.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createReport);

router.get("/", authenticate, getMyReportList);

router.get("/:id", authenticate, getReport);

router.patch("/:id", authenticate, updateReport);

router.delete("/:id", authenticate, deleteReport);

export default router;