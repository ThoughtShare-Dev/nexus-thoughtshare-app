export const sendSuccess = (
  res,
  statusCode = 200,
  data = null,
  message = "Success"
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

export const sendError = (
  res,
  statusCode = 500,
  code = "SERVER_ERROR",
  message = "Something went wrong"
) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};