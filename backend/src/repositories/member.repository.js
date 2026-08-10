import prisma from "../config/prisma.js";

const memberSelect = {
  id: true,
  name: true,
  email: true,
  bio: true,
  profilePictureUrl: true,
  preferredContactType: true,
  preferredContactValue: true,
  avgRating: true,
  ratingCount: true,
  isActive: true,
  hiddenFromSearch: true,
  createdAt: true,
  updatedAt: true,
};

export const findMemberByEmail = async (email) => {
  return prisma.member.findUnique({
    where: {
      email,
    },
  });
};

export const findMemberById = async (id) => {
  return prisma.member.findUnique({
    where: {
      id,
    },
  });
};

export const createMember = async (memberData) => {
  return prisma.member.create({
    data: memberData,
    select: memberSelect,
  });
};

export const updateMember = async (id, memberData) => {
  return prisma.member.update({
    where: {
      id,
    },
    data: memberData,
    select: memberSelect,
  });
};

export const findMemberPublicById = async (id) => {
  return prisma.member.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      bio: true,
      profilePictureUrl: true,
      avgRating: true,
      ratingCount: true,
      createdAt: true,
      isActive: true,
      hiddenFromSearch: true,
    },
  });
};

export const findSkillsByIds = async (skillIds) => {
  return prisma.skill.findMany({
    where: {
      id: {
        in: skillIds,
      },
    },
  });
};

export const setMemberTeachingSkills = async (memberId, skillIds) => {
  return prisma.$transaction(async (tx) => {
    await tx.teachingSkill.deleteMany({
      where: {
        memberId,
      },
    });

    if (skillIds.length > 0) {
      await tx.teachingSkill.createMany({
        data: skillIds.map((skillId) => ({
          memberId,
          skillId,
        })),
        skipDuplicates: true,
      });
    }

    return tx.teachingSkill.findMany({
      where: {
        memberId,
      },
      include: {
        skill: true,
      },
    });
  });
};

export const setMemberLearningSkills = async (memberId, skillIds) => {
  return prisma.$transaction(async (tx) => {
    await tx.learningSkill.deleteMany({
      where: {
        memberId,
      },
    });

    if (skillIds.length > 0) {
      await tx.learningSkill.createMany({
        data: skillIds.map((skillId) => ({
          memberId,
          skillId,
        })),
        skipDuplicates: true,
      });
    }

    return tx.learningSkill.findMany({
      where: {
        memberId,
      },
      include: {
        skill: true,
      },
    });
  });
};

export const searchMembers = async ({ skill, q }) => {
  return prisma.member.findMany({
    where: {
      isActive: true,
      hiddenFromSearch: false,

      ...(q
        ? {
            name: {
              contains: q,
              mode: "insensitive",
            },
          }
        : {}),

      ...(skill
        ? {
            OR: [
              {
                teachingSkills: {
                  some: {
                    skill: {
                      name: {
                        equals: skill,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              },
              {
                learningSkills: {
                  some: {
                    skill: {
                      name: {
                        equals: skill,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              },
            ],
          }
        : {}),
    },

    select: {
      id: true,
      name: true,
      bio: true,
      profilePictureUrl: true,
      avgRating: true,
      ratingCount: true,

      teachingSkills: {
        include: {
          skill: true,
        },
      },

      learningSkills: {
        include: {
          skill: true,
        },
      },
    },

    orderBy: [
      {
        avgRating: "desc",
      },
      {
        name: "asc",
      },
    ],
  });
};