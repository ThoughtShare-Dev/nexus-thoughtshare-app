import { getAllSkills } from "../services/skill.service.js";
import { sendSuccess } from "../utils/response.js";

export const getSkills = async (req, res, next) => {
  try {
    const skills = await getAllSkills();

    return sendSuccess(
      res,
      200,
      skills,
      "Skills retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};