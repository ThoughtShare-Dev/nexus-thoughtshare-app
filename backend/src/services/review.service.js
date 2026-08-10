import prisma from "../config/prisma.js";

import {
  findLearningRequestById,
  findReviewByLearningRequestId,
  createReview,
  findReviewsByRevieweeId,
  findReviewById,
} from "../repositories/review.repository.js";

export const createMemberReview = async ({
  learningRequestId,
  reviewerId,
  rating,
  comment,
}) => {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
  const error = new Error("Rating must be an integer between 1 and 5");
  error.statusCode = 400;
  error.code = "INVALID_RATING";
  throw error;
}

  const request = await findLearningRequestById(learningRequestId);

  if (!request) {
    const error = new Error("Learning request not found");
    error.statusCode = 404;
    error.code = "REQUEST_NOT_FOUND";
    throw error;
  }

  if (request.status !== "ACCEPTED") {
    const error = new Error(
      "Reviews can only be created for accepted learning requests"
    );
    error.statusCode = 400;
    error.code = "REQUEST_NOT_ACCEPTED";
    throw error;
  }

  if (
    request.senderId !== reviewerId &&
    request.receiverId !== reviewerId
  ) {
    const error = new Error(
      "You are not a participant in this learning request"
    );
    error.statusCode = 403;
    error.code = "FORBIDDEN";
    throw error;
  }

  const existingReview =
    await findReviewByLearningRequestId(learningRequestId);

  if (existingReview) {
    const error = new Error(
      "A review already exists for this learning request"
    );
    error.statusCode = 409;
    error.code = "REVIEW_EXISTS";
    throw error;
  }

  const revieweeId =
    request.senderId === reviewerId
      ? request.receiverId
      : request.senderId;

  const review = await createReview({
    learningRequestId,
    reviewerId,
    revieweeId,
    rating,
    comment,
  });

  await updateMemberRating(revieweeId);

  return review;
};

export const getReviewById = async (reviewId) => {
  const review = await findReviewById(reviewId);

  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    error.code = "REVIEW_NOT_FOUND";
    throw error;
  }

  return review;
};

export const getMemberReviews = async (memberId) => {
  return findReviewsByRevieweeId(memberId);
};

export const updateMemberReview = async ({
  reviewId,
  reviewerId,
  rating,
  comment,
}) => {
  const review = await findReviewById(reviewId);

  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    error.code = "REVIEW_NOT_FOUND";
    throw error;
  }

  if (review.reviewerId !== reviewerId) {
    const error = new Error(
      "Only the reviewer can update this review"
    );
    error.statusCode = 403;
    error.code = "FORBIDDEN";
    throw error;
  }

  const updatedReview = await prisma.review.update({
    where: {
      id: reviewId,
    },
    data: {
      rating,
      comment,
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
    },
  });

  await updateMemberRating(review.revieweeId);

  return updatedReview;
};

export const deleteMemberReview = async ({
  reviewId,
  reviewerId,
}) => {
  const review = await findReviewById(reviewId);

  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    error.code = "REVIEW_NOT_FOUND";
    throw error;
  }

  if (review.reviewerId !== reviewerId) {
    const error = new Error(
      "Only the reviewer can delete this review"
    );
    error.statusCode = 403;
    error.code = "FORBIDDEN";
    throw error;
  }

  const revieweeId = review.revieweeId;

  await prisma.review.delete({
    where: {
      id: reviewId,
    },
  });

  await updateMemberRating(revieweeId);

  return {
    message: "Review deleted successfully",
  };
};

const updateMemberRating = async (memberId) => {
  const reviews = await prisma.review.findMany({
    where: {
      revieweeId: memberId,
    },
    select: {
      rating: true,
    },
  });

  const ratingCount = reviews.length;

  const avgRating =
    ratingCount === 0
      ? 0
      : reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        ) / ratingCount;

  await prisma.member.update({
    where: {
      id: memberId,
    },
    data: {
      avgRating,
      ratingCount,
    },
  });
};