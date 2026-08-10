import {
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
  updateMemberSkills,
  searchMembers as searchMembersService
} from "../services/member.service.js";

import { sendSuccess } from "../utils/response.js";

export const getCurrentMember = async (req, res, next) => {
  try {
    const member = await getMyProfile(req.user.id);

    return sendSuccess(
      res,
      200,
      member,
      "Member profile retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const updateCurrentMember = async (req, res, next) => {
  try {
    const member = await updateMyProfile(
      req.user.id,
      req.body
    );

    return sendSuccess(
      res,
      200,
      member,
      "Member profile updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getMemberById = async (req, res, next) => {
  try {
    const member = await getPublicProfile(req.params.id);

    return sendSuccess(
      res,
      200,
      member,
      "Member profile retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const updateSkills = async (req, res, next) => {
  try {
    const result = await updateMemberSkills({
      memberId: req.user.id,
      teachingSkillIds: req.body.teachingSkillIds,
      learningSkillIds: req.body.learningSkillIds,
    });

    return sendSuccess(
      res,
      200,
      result,
      "Member skills updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const searchMembers = async (req, res, next) => {
  try {
    const members = await searchMembersService({
      skill: req.query.skill,
      q: req.query.q,
    });

    return sendSuccess(
      res,
      200,
      members,
      "Members retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};