import { sendError } from "../utils/response.js";

export const errorHandler = (err, _req, res, next) => {
	console.err(err.stack);
	const status = err.statusCode || 500;
	const code = err.code || "SERVER_ERROR";
	const message = err.message || "Something went wrong";
	return sendError(res, status, code, message);
};

export const notFound = (req, res) => {
	return sendError(res, 404, "NOT_FOUND", "Route not found");
};
