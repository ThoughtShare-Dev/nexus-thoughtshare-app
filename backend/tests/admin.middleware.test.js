import { describe, it, expect, vi } from "vitest";
import { requireAdmin } from "../src/middlewares/admin.middleware.js";

describe("requireAdmin middleware", () => {
  it("allows an admin user to continue", () => {
    const req = {
      user: {
        id: "admin-id",
        isAdmin: true,
      },
    };

    const res = {};
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects a non-admin user", () => {
    const req = {
      user: {
        id: "user-id",
        isAdmin: false,
      },
    };

    const res = {};
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledOnce();

    const error = next.mock.calls[0][0];

    expect(error.message).toBe("Admin access required");
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe("ADMIN_REQUIRED");
  });

  it("rejects a request without an authenticated user", () => {
    const req = {};
    const res = {};
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledOnce();

    const error = next.mock.calls[0][0];

    expect(error.message).toBe("Admin access required");
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe("ADMIN_REQUIRED");
  });
});