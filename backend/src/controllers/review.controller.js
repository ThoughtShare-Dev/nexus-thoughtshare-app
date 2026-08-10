import {
  createMemberReview,
  getReviewById,
  getMemberReviews,
  updateMemberReview,
  deleteMemberReview,
} from "../services/review.service.js";

import { sendSuccess } from "../utils/response.js";

export const createReview = async (req, res, next) => {
  try {
    const review = await createMemberReview({
      learningRequestId: req.body.learningRequestId,
      reviewerId: req.user.id,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    return sendSuccess(
      res,
      201,
      review,
      "Review created successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getReview = async (req, res, next) => {
  try {
    const review = await getReviewById(req.params.id);

    return sendSuccess(
      res,
      200,
      review,
      "Review retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getReviewsForMember = async (req, res, next) => {
  try {
    const reviews = await getMemberReviews(req.params.id);

    return sendSuccess(
      res,
      200,
      reviews,
      "Member reviews retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const review = await updateMemberReview({
      reviewId: req.params.id,
      reviewerId: req.user.id,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    return sendSuccess(
      res,
      200,
      review,
      "Review updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const result = await deleteMemberReview({
      reviewId: req.params.id,
      reviewerId: req.user.id,
    });

    return sendSuccess(
      res,
      200,
      result,
      "Review deleted successfully"
    );
  } catch (error) {
    next(error);
  }
};