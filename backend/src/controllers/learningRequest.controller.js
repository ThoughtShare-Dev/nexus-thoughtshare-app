import {
  sendLearningRequest,
  getMyLearningRequests,
  respondToLearningRequest,
} from "../services/learningRequest.service.js";

import { sendSuccess } from "../utils/response.js";

export const createLearningRequest = async (req, res, next) => {
  try {
    const request = await sendLearningRequest({
      senderId: req.user.id,
      receiverId: req.body.receiverId,
      message: req.body.message,
    });

    return sendSuccess(
      res,
      201,
      request,
      "Learning request sent successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getLearningRequests = async (req, res, next) => {
  try {
    const requests = await getMyLearningRequests(req.user.id);

    return sendSuccess(
      res,
      200,
      requests,
      "Learning requests retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const updateLearningRequest = async (req, res, next) => {
  try {
    const request = await respondToLearningRequest({
      requestId: req.params.id,
      memberId: req.user.id,
      status: req.body.status,
    });

    return sendSuccess(
      res,
      200,
      request,
      "Learning request updated successfully"
    );
  } catch (error) {
    next(error);
  }
};