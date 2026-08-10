import {
  registerMember,
  loginMember,
} from "../services/auth.service.js";
import { sendSuccess } from "../utils/response.js";

export const register = async (req, res, next) => {
  try {
    const result = await registerMember(req.body);

    return sendSuccess(
      res,
      201,
      result,
      "Member registered successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await loginMember(req.body);

    return sendSuccess(
      res,
      200,
      result,
      "Login successful"
    );
  } catch (error) {
    next(error);
  }
};

export const getCurrentMember = async (req, res) => {
  return sendSuccess(
    res,
    200,
    req.user,
    "Authenticated member"
  );
};