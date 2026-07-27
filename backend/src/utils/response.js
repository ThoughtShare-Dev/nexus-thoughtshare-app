export const sendSuccess = (res, statusCode, data, message) => {
	return res.status(statusCode).json({ success: true, data, message });
};

export const sendError = (res, statusCode, code, message) => {
	return res.status(statusCode).json({
		success: false,
		error: {
			code,
			message,
		},
	});
};
