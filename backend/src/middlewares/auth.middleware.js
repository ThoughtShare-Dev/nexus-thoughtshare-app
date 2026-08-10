import { verifyToken } from "../utils/jwt.js";
import { findMemberById } from "../repositories/member.repository.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("Authentication required");
      error.statusCode = 401;
      error.code = "UNAUTHORIZED";
      throw error;
    }

    const token = authHeader.split(" ")[1];

    const payload = verifyToken(token);

    const member = await findMemberById(payload.id);

    if (!member) {
      const error = new Error("Member not found");
      error.statusCode = 401;
      error.code = "UNAUTHORIZED";
      throw error;
    }

    const { passwordHash, ...safeMember } = member;

    req.user = safeMember;

    next();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 401;
      error.code = "UNAUTHORIZED";
      error.message = "Invalid or expired token";
    }

    next(error);
  }
};