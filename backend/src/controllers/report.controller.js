import {
  createMemberReport,
  getReportById,
  getMyReports,
  getAllReports,
  updateReportStatus,
  deleteMemberReport,
} from "../services/report.service.js";

import { sendSuccess } from "../utils/response.js";

export const createReport = async (req, res, next) => {
  try {
    const report = await createMemberReport({
      reporterId: req.user.id,
      reportedMemberId: req.body.reportedMemberId,
      reason: req.body.reason,
      description: req.body.description,
    });

    return sendSuccess(
      res,
      201,
      report,
      "Report submitted successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getReport = async (req, res, next) => {
  try {
    const report = await getReportById(req.params.id);

    return sendSuccess(
      res,
      200,
      report,
      "Report retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getMyReportList = async (req, res, next) => {
  try {
    const reports = await getMyReports(req.user.id);

    return sendSuccess(
      res,
      200,
      reports,
      "Reports retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getAllReportList = async (req, res, next) => {
  try {
    const reports = await getAllReports({
      status: req.query.status,
    });

    return sendSuccess(
      res,
      200,
      reports,
      "Reports retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const updateReport = async (req, res, next) => {
  try {
    const report = await updateReportStatus({
      reportId: req.params.id,
      status: req.body.status,
    });

    return sendSuccess(
      res,
      200,
      report,
      "Report status updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const deleteReport = async (req, res, next) => {
  try {
    const result = await deleteMemberReport({
      reportId: req.params.id,
      reporterId: req.user.id,
    });

    return sendSuccess(
      res,
      200,
      result,
      "Report deleted successfully"
    );
  } catch (error) {
    next(error);
  }
};