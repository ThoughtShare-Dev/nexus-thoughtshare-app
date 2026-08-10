import prisma from "../config/prisma.js";

export const findLearningRequestById = async (id) => {
  return prisma.learningRequest.findUnique({
    where: {
      id,
    },
    include: {
      sender: true,
      receiver: true,
      review: true,
    },
  });
};

export const createReview = async (reviewData) => {
  return prisma.review.create({
    data: reviewData,
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
        },
      },
      reviewee: {
        select: {
          id: true,
          name: true,
        },
      },
      learningRequest: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });
};

export const findReviewById = async (id) => {
  return prisma.review.findUnique({
    where: {
      id,
    },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
        },
      },
      reviewee: {
        select: {
          id: true,
          name: true,
        },
      },
      learningRequest: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });
};

export const findReviewByLearningRequestId = async (
  learningRequestId
) => {
  return prisma.review.findUnique({
    where: {
      learningRequestId,
    },
  });
};

export const findReviewsByRevieweeId = async (revieweeId) => {
  return prisma.review.findMany({
    where: {
      revieweeId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const updateReview = async (id, reviewData) => {
  return prisma.review.update({
    where: {
      id,
    },
    data: reviewData,
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
        },
      },
      reviewee: {
        select: {
          id: true,
          name: true,
        },
      },
      learningRequest: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });
};

export const deleteReview = async (id) => {
  return prisma.review.delete({
    where: {
      id,
    },
  });
};