import { describe, it, expect } from "vitest";
import prisma from "../src/config/prisma.js";

describe("Prisma Database Connection", () => {
  it("connects to PostgreSQL successfully", async () => {
    await prisma.$connect();

    const members = await prisma.member.findMany();

    expect(Array.isArray(members)).toBe(true);
  });
});