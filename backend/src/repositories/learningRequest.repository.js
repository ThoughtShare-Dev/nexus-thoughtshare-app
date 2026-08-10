import prisma from "../config/prisma.js";

export const createLearningRequest = async ({
  senderId,
  receiverId,
  message,
}) => {
  return prisma.learningRequest.create({
    data: {
      senderId,
      receiverId,
      message,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const findRequestById = async (id) => {
  return prisma.learningRequest.findUnique({
    where: {
      id,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const findRequestsByMember = async (memberId) => {
  return prisma.learningRequest.findMany({
    where: {
      OR: [
        {
          senderId: memberId,
        },
        {
          receiverId: memberId,
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const updateLearningRequestStatus = async (id, status) => {
  return prisma.learningRequest.update({
    where: {
      id,
    },
    data: {
      status,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};