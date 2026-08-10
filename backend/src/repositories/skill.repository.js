import prisma from "../config/prisma.js";

export const findAllSkills = async () => {
  return prisma.skill.findMany({
    orderBy: {
      name: "asc",
    },
  });
};