import prisma from "../config/prisma.js";

export const createReport = async ({
  reporterId,
  reportedMemberId,
  reason,
  description,
}) => {
  return prisma.report.create({
    data: {
      reporterId,
      reportedMemberId,
      reason,
      description,
    },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
        },
      },
      reportedMember: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const findReportById = async (reportId) => {
  return prisma.report.findUnique({
    where: {
      id: reportId,
    },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
        },
      },
      reportedMember: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const findReportsByReporterId = async (reporterId) => {
  return prisma.report.findMany({
    where: {
      reporterId,
    },
    include: {
      reportedMember: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const findAllReports = async ({ status } = {}) => {
  return prisma.report.findMany({
    where: status
      ? {
          status,
        }
      : undefined,
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
        },
      },
      reportedMember: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const updateReportStatus = async ({
  reportId,
  status,
}) => {
  return prisma.report.update({
    where: {
      id: reportId,
    },
    data: {
      status,
    },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
        },
      },
      reportedMember: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const deleteReport = async (reportId) => {
  return prisma.report.delete({
    where: {
      id: reportId,
    },
  });
};