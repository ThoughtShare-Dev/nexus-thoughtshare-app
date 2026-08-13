import express from "express";

import {
  getAllReportList,
  updateReport,
} from "../controllers/report.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.get(
  "/reports",
  authenticate,
  requireAdmin,
  getAllReportList
);

router.patch(
  "/reports/:id",
  authenticate,
  requireAdmin,
  updateReport
);

export default router;