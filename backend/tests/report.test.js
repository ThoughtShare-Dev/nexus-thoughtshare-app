import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  createMemberReport,
  getReportById,
  getAllReports,
  updateReportStatus,
} from "../src/services/report.service.js";

import prisma from "../src/config/prisma.js";

import {
  createReport,
  findReportById,
  findAllReports,
  updateReportStatus as repositoryUpdateReportStatus,
} from "../src/repositories/report.repository.js";


vi.mock("../src/config/prisma.js", () => ({
  default: {
    member: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("../src/repositories/report.repository.js", () => ({
  createReport: vi.fn(),
  findReportById: vi.fn(),
  findReportsByReporterId: vi.fn(),
  findAllReports: vi.fn(),
  updateReportStatus: vi.fn(),
  deleteReport: vi.fn(),
}));


describe("Report Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });


  describe("createMemberReport", () => {
    it("creates a report successfully", async () => {
      prisma.member.findUnique
        .mockResolvedValueOnce({
          id: "reporter-id",
          name: "Reporter",
        })
        .mockResolvedValueOnce({
          id: "member-id",
          name: "Reported Member",
        });

      createReport.mockResolvedValue({
        id: "report-id",
        reporterId: "reporter-id",
        reportedMemberId: "member-id",
        reason: "SPAM",
        description: "Test report",
        status: "PENDING",
      });

      const result = await createMemberReport({
        reporterId: "reporter-id",
        reportedMemberId: "member-id",
        reason: "SPAM",
        description: "Test report",
      });

      expect(result.id).toBe("report-id");

      expect(createReport).toHaveBeenCalledWith({
        reporterId: "reporter-id",
        reportedMemberId: "member-id",
        reason: "SPAM",
        description: "Test report",
      });
    });


    it("rejects self-reporting", async () => {
      await expect(
        createMemberReport({
          reporterId: "member-id",
          reportedMemberId: "member-id",
          reason: "SPAM",
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "SELF_REPORT",
      });
    });


    it("rejects an invalid report reason", async () => {
      await expect(
        createMemberReport({
          reporterId: "reporter-id",
          reportedMemberId: "member-id",
          reason: "INVALID_REASON",
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "INVALID_REASON",
      });
    });
  });


  describe("getReportById", () => {
    it("returns a report when it exists", async () => {
      findReportById.mockResolvedValue({
        id: "report-id",
        status: "PENDING",
      });

      const result = await getReportById("report-id");

      expect(result.id).toBe("report-id");
      expect(findReportById).toHaveBeenCalledWith("report-id");
    });


    it("returns an error when the report does not exist", async () => {
      findReportById.mockResolvedValue(null);

      await expect(
        getReportById("missing-id")
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "REPORT_NOT_FOUND",
      });
    });
  });


  describe("getAllReports", () => {
    it("returns all reports", async () => {
      findAllReports.mockResolvedValue([
        {
          id: "report-1",
          status: "PENDING",
        },
        {
          id: "report-2",
          status: "RESOLVED",
        },
      ]);

      const result = await getAllReports();

      expect(result).toHaveLength(2);
      expect(findAllReports).toHaveBeenCalledWith({
        status: undefined,
      });
    });


    it("rejects an invalid status", async () => {
      await expect(
        getAllReports({
          status: "INVALID",
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "INVALID_STATUS",
      });
    });
  });


  describe("updateReportStatus", () => {
    it("updates a report status successfully", async () => {
      findReportById.mockResolvedValue({
        id: "report-id",
        status: "PENDING",
      });

      repositoryUpdateReportStatus.mockResolvedValue({
        id: "report-id",
        status: "RESOLVED",
      });

      const result = await updateReportStatus({
        reportId: "report-id",
        status: "RESOLVED",
      });

      expect(result.status).toBe("RESOLVED");

      expect(repositoryUpdateReportStatus).toHaveBeenCalledWith({
        reportId: "report-id",
        status: "RESOLVED",
      });
    });


    it("rejects an invalid status", async () => {
      await expect(
        updateReportStatus({
          reportId: "report-id",
          status: "INVALID",
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "INVALID_STATUS",
      });
    });


    it("returns an error when the report does not exist", async () => {
      findReportById.mockResolvedValue(null);

      await expect(
        updateReportStatus({
          reportId: "missing-id",
          status: "RESOLVED",
        })
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "REPORT_NOT_FOUND",
      });
    });
  });
});