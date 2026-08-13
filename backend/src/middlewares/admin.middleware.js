export const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    const error = new Error("Admin access required");
    error.statusCode = 403;
    error.code = "ADMIN_REQUIRED";

    return next(error);
  }

  next();
};