import prisma from "../config/prisma.js";

import {
  createReport,
  findReportById,
  findReportsByReporterId,
  findAllReports,
  updateReportStatus as updateReportStatusInRepository,
  deleteReport,
} from "../repositories/report.repository.js";

const validReasons = [
  "HARASSMENT",
  "SCAM",
  "INAPPROPRIATE_CONTENT",
  "FAKE_PROFILE",
  "SPAM",
  "OTHER",
];

const validStatuses = [
  "PENDING",
  "REVIEWED",
  "RESOLVED",
  "DISMISSED",
];

export const createMemberReport = async ({
  reporterId,
  reportedMemberId,
  reason,
  description,
}) => {
  if (!reportedMemberId) {
    const error = new Error("Reported member ID is required");
    error.statusCode = 400;
    error.code = "REPORTED_MEMBER_REQUIRED";
    throw error;
  }

  if (reporterId === reportedMemberId) {
    const error = new Error("You cannot report yourself");
    error.statusCode = 400;
    error.code = "SELF_REPORT";
    throw error;
  }

  if (!reason) {
    const error = new Error("Report reason is required");
    error.statusCode = 400;
    error.code = "REASON_REQUIRED";
    throw error;
  }

  if (!validReasons.includes(reason)) {
    const error = new Error("Invalid report reason");
    error.statusCode = 400;
    error.code = "INVALID_REASON";
    throw error;
  }

  if (description && description.length > 1000) {
    const error = new Error(
      "Report description must not exceed 1000 characters"
    );
    error.statusCode = 400;
    error.code = "DESCRIPTION_TOO_LONG";
    throw error;
  }

  const reporter = await prisma.member.findUnique({
    where: {
      id: reporterId,
    },
  });

  if (!reporter) {
    const error = new Error("Reporter not found");
    error.statusCode = 404;
    error.code = "REPORTER_NOT_FOUND";
    throw error;
  }

  const reportedMember = await prisma.member.findUnique({
    where: {
      id: reportedMemberId,
    },
  });

  if (!reportedMember) {
    const error = new Error("Reported member not found");
    error.statusCode = 404;
    error.code = "MEMBER_NOT_FOUND";
    throw error;
  }

  return createReport({
    reporterId,
    reportedMemberId,
    reason,
    description,
  });
};

export const getReportById = async (reportId) => {
  const report = await findReportById(reportId);

  if (!report) {
    const error = new Error("Report not found");
    error.statusCode = 404;
    error.code = "REPORT_NOT_FOUND";
    throw error;
  }

  return report;
};

export const getMyReports = async (reporterId) => {
  return findReportsByReporterId(reporterId);
};

export const getAllReports = async ({ status } = {}) => {
  if (status && !validStatuses.includes(status)) {
    const error = new Error("Invalid report status");
    error.statusCode = 400;
    error.code = "INVALID_STATUS";
    throw error;
  }

  return findAllReports({ status });
};

export const updateReportStatus = async ({
  reportId,
  status,
}) => {
  if (!status) {
    const error = new Error("Report status is required");
    error.statusCode = 400;
    error.code = "STATUS_REQUIRED";
    throw error;
  }

  if (!validStatuses.includes(status)) {
    const error = new Error("Invalid report status");
    error.statusCode = 400;
    error.code = "INVALID_STATUS";
    throw error;
  }

  const report = await findReportById(reportId);

  if (!report) {
    const error = new Error("Report not found");
    error.statusCode = 404;
    error.code = "REPORT_NOT_FOUND";
    throw error;
  }

  return updateReportStatusInRepository({
    reportId,
    status,
  });
};

export const deleteMemberReport = async ({
  reportId,
  reporterId,
}) => {
  const report = await findReportById(reportId);

  if (!report) {
    const error = new Error("Report not found");
    error.statusCode = 404;
    error.code = "REPORT_NOT_FOUND";
    throw error;
  }

  if (report.reporterId !== reporterId) {
    const error = new Error(
      "Only the reporter can delete this report"
    );
    error.statusCode = 403;
    error.code = "FORBIDDEN";
    throw error;
  }

  await deleteReport(reportId);

  return {
    message: "Report deleted successfully",
  };
};