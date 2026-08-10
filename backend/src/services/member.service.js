import {
  findSkillsByIds,
  setMemberTeachingSkills,
  setMemberLearningSkills,
  searchMembers as searchMembersRepository
} from "../repositories/member.repository.js";

import {
  findMemberById,
  findMemberPublicById,
  updateMember,
} from "../repositories/member.repository.js";

export const getMyProfile = async (memberId) => {
  const member = await findMemberById(memberId);

  if (!member) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    error.code = "MEMBER_NOT_FOUND";
    throw error;
  }

  const { passwordHash, ...safeMember } = member;

  return safeMember;
};

export const updateMyProfile = async (memberId, profileData) => {
  const member = await findMemberById(memberId);

  if (!member) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    error.code = "MEMBER_NOT_FOUND";
    throw error;
  }

  return await updateMember(memberId, profileData);
};

export const getPublicProfile = async (memberId) => {
  const member = await findMemberPublicById(memberId);

  if (!member) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    error.code = "MEMBER_NOT_FOUND";
    throw error;
  }

  if (!member.isActive || member.hiddenFromSearch) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    error.code = "MEMBER_NOT_FOUND";
    throw error;
  }

  return member;
};

export const updateMemberSkills = async ({
  memberId,
  teachingSkillIds = [],
  learningSkillIds = [],
}) => {
  const allSkillIds = [
    ...new Set([
      ...teachingSkillIds,
      ...learningSkillIds,
    ]),
  ];

  const skills = await findSkillsByIds(allSkillIds);

  if (skills.length !== allSkillIds.length) {
    const error = new Error("One or more skills do not exist");
    error.statusCode = 400;
    error.code = "INVALID_SKILL";
    throw error;
  }

  const teachingSkills = await setMemberTeachingSkills(
    memberId,
    teachingSkillIds
  );

  const learningSkills = await setMemberLearningSkills(
    memberId,
    learningSkillIds
  );

  return {
    teachingSkills: teachingSkills.map((item) => item.skill),
    learningSkills: learningSkills.map((item) => item.skill),
  };
};

export const searchMembers = async ({ skill, q }) => {
  return searchMembersRepository({
    skill,
    q,
  });
};