import { describe, it, expect } from "vitest";
import {
  hashPassword,
  comparePassword,
} from "../src/utils/password.js";

describe("Password utilities", () => {
  it("hashes a password and verifies the correct password", async () => {
    const password = "ThoughtShare123";

    const hashedPassword = await hashPassword(password);

    expect(hashedPassword).not.toBe(password);

    const isMatch = await comparePassword(
      password,
      hashedPassword
    );

    expect(isMatch).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const password = "ThoughtShare123";

    const hashedPassword = await hashPassword(password);

    const isMatch = await comparePassword(
      "WrongPassword",
      hashedPassword
    );

    expect(isMatch).toBe(false);
  });
});