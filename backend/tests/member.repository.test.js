import { describe, it, expect } from "vitest";
import { findMemberByEmail } from "../src/repositories/member.repository.js";

describe("Member Repository", () => {
  it("returns null when the member does not exist", async () => {
    const member = await findMemberByEmail(
      "nonexistent-test-user@example.com"
    );

    expect(member).toBeNull();
  });
});