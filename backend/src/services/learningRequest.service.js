import {
  createLearningRequest,
  findRequestById,
  findRequestsByMember,
  updateLearningRequestStatus,
} from "../repositories/learningRequest.repository.js";

import { findMemberById } from "../repositories/member.repository.js";

export const sendLearningRequest = async ({
  senderId,
  receiverId,
  message,
}) => {
  if (senderId === receiverId) {
    const error = new Error("You cannot send a learning request to yourself");
    error.statusCode = 400;
    error.code = "SELF_REQUEST";
    throw error;
  }

  const receiver = await findMemberById(receiverId);

  if (!receiver) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    error.code = "MEMBER_NOT_FOUND";
    throw error;
  }

  if (!receiver.isActive || receiver.hiddenFromSearch) {
    const error = new Error("Member is not available for learning requests");
    error.statusCode = 404;
    error.code = "MEMBER_NOT_AVAILABLE";
    throw error;
  }

  return createLearningRequest({
    senderId,
    receiverId,
    message,
  });
};

export const getMyLearningRequests = async (memberId) => {
  return findRequestsByMember(memberId);
};

export const respondToLearningRequest = async ({
  requestId,
  memberId,
  status,
}) => {
  const request = await findRequestById(requestId);

  if (!request) {
    const error = new Error("Learning request not found");
    error.statusCode = 404;
    error.code = "REQUEST_NOT_FOUND";
    throw error;
  }

  if (request.receiverId !== memberId) {
    const error = new Error(
      "Only the receiver can accept or decline this request"
    );
    error.statusCode = 403;
    error.code = "FORBIDDEN";
    throw error;
  }

  if (request.status !== "PENDING") {
    const error = new Error("This learning request has already been responded to");
    error.statusCode = 409;
    error.code = "REQUEST_ALREADY_RESPONDED";
    throw error;
  }

  if (!["ACCEPTED", "DECLINED"].includes(status)) {
    const error = new Error("Status must be ACCEPTED or DECLINED");
    error.statusCode = 400;
    error.code = "INVALID_STATUS";
    throw error;
  }

  return updateLearningRequestStatus(requestId, status);
};