import {
  createMember,
  findMemberByEmail,
} from "../repositories/member.repository.js";
import {
  hashPassword,
  comparePassword,
} from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";

export const registerMember = async ({ name, email, password }) => {
  // Validate required fields
  if (!name || !email || !password) {
    const error = new Error("Name, email and password are required");
    error.statusCode = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  // Check if the email already exists
  const existingMember = await findMemberByEmail(email);

  if (existingMember) {
    const error = new Error("Email already exists");
    error.statusCode = 409;
    error.code = "EMAIL_ALREADY_EXISTS";
    throw error;
  }

  // Hash the password
  const passwordHash = await hashPassword(password);

  // Save the member
  const member = await createMember({
    name,
    email,
    passwordHash,
  });

  // Generate JWT
  const token = generateToken({
    id: member.id,
    email: member.email,
  });

  return {
    member,
    token,
  };
};

export const loginMember = async ({ email, password }) => {
  // Validate required fields
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  // Find the member
  const member = await findMemberByEmail(email);

  if (!member) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  // Compare passwords
  const passwordMatches = await comparePassword(
    password,
    member.passwordHash
  );

  if (!passwordMatches) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  // Generate JWT
  const token = generateToken({
    id: member.id,
    email: member.email,
  });

  // Remove the password hash before returning the member
  const { passwordHash, ...safeMember } = member;

  return {
    member: safeMember,
    token,
  };
};