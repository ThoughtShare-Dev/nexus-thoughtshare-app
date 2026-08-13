import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/repositories/member.repository.js", () => ({
  createMember: vi.fn(),
  findMemberByEmail: vi.fn(),
}));

vi.mock("../src/utils/password.js", () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}));

vi.mock("../src/utils/jwt.js", () => ({
  generateToken: vi.fn(),
}));

import {
  registerMember,
  loginMember,
} from "../src/services/auth.service.js";

import {
  createMember,
  findMemberByEmail,
} from "../src/repositories/member.repository.js";

import {
  hashPassword,
  comparePassword,
} from "../src/utils/password.js";

import { generateToken } from "../src/utils/jwt.js";

describe("Auth Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerMember", () => {
    it("registers a new member successfully", async () => {
      findMemberByEmail.mockResolvedValue(null);

      hashPassword.mockResolvedValue("hashed-password");

      createMember.mockResolvedValue({
        id: "member-123",
        name: "Aisha Mohd",
        email: "aisha@example.com",
        passwordHash: "hashed-password",
      });

      generateToken.mockReturnValue("jwt-token");

      const result = await registerMember({
        name: "Aisha Mohd",
        email: "aisha@example.com",
        password: "ThoughtShare123",
      });

      expect(result.member.email).toBe("aisha@example.com");
      expect(result.token).toBe("jwt-token");

      expect(hashPassword).toHaveBeenCalledWith("ThoughtShare123");
      expect(createMember).toHaveBeenCalled();
      expect(generateToken).toHaveBeenCalled();
    });

    it("rejects missing registration fields", async () => {
      await expect(
        registerMember({
          name: "",
          email: "aisha@example.com",
          password: "ThoughtShare123",
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    });

    it("rejects an existing email", async () => {
      findMemberByEmail.mockResolvedValue({
        id: "existing-member",
        email: "aisha@example.com",
      });

      await expect(
        registerMember({
          name: "Aisha Mohd",
          email: "aisha@example.com",
          password: "ThoughtShare123",
        })
      ).rejects.toMatchObject({
        statusCode: 409,
        code: "EMAIL_ALREADY_EXISTS",
      });
    });
  });

  describe("loginMember", () => {
    it("logs in a member successfully", async () => {
      findMemberByEmail.mockResolvedValue({
        id: "member-123",
        name: "Aisha Mohd",
        email: "aisha@example.com",
        passwordHash: "hashed-password",
      });

      comparePassword.mockResolvedValue(true);
      generateToken.mockReturnValue("jwt-token");

      const result = await loginMember({
        email: "aisha@example.com",
        password: "ThoughtShare123",
      });

      expect(result.member.email).toBe("aisha@example.com");
      expect(result.member.passwordHash).toBeUndefined();
      expect(result.token).toBe("jwt-token");

      expect(comparePassword).toHaveBeenCalledWith(
        "ThoughtShare123",
        "hashed-password"
      );
    });

    it("rejects missing login fields", async () => {
      await expect(
        loginMember({
          email: "",
          password: "ThoughtShare123",
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    });

    it("rejects an unknown email", async () => {
      findMemberByEmail.mockResolvedValue(null);

      await expect(
        loginMember({
          email: "unknown@example.com",
          password: "ThoughtShare123",
        })
      ).rejects.toMatchObject({
        statusCode: 401,
        code: "INVALID_CREDENTIALS",
      });
    });

    it("rejects an incorrect password", async () => {
      findMemberByEmail.mockResolvedValue({
        id: "member-123",
        email: "aisha@example.com",
        passwordHash: "hashed-password",
      });

      comparePassword.mockResolvedValue(false);

      await expect(
        loginMember({
          email: "aisha@example.com",
          password: "WrongPassword",
        })
      ).rejects.toMatchObject({
        statusCode: 401,
        code: "INVALID_CREDENTIALS",
      });
    });
  });
});