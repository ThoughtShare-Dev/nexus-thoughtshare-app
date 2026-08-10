import { findAllSkills } from "../repositories/skill.repository.js";

export const getAllSkills = async () => {
  return findAllSkills();
};