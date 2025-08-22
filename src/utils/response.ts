// Default headers for all responses
const DEFAULT_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Content-Type': 'application/json',
};

/**
 * Generic response formatter
 */
const formatResponse = <T = unknown>(statusCode: number, message: string, data?: T) => {
	return {
		statusCode,
		headers: DEFAULT_HEADERS,
		body: JSON.stringify(data ?? { message }),
	};
};

/**
 * Success response
 * @param data - optional payload
 */
export const successResponse = <T = unknown>(data?: T) => {
	return formatResponse(200, 'Success', data);
};

/**
 * Error response
 * @param code - HTTP status code (default 500)
 * @param error - error message or validation errors
 */
export const errorResponse = (code = 500, error: unknown) => {
	// Handle array-based validation errors (like class-validator)
	if (Array.isArray(error) && error[0]?.constraints) {
		const constraints = error[0].constraints;
		const firstKey = Object.keys(constraints)[0];
		const message = constraints[firstKey] ?? 'Error occurred';
		return formatResponse(code, message, message);
	}

	return formatResponse(code, `${error}`, error);
};

/**
 * Unified API response helper
 * @param payload - success data or error message/object
 * @param statusCode - optional HTTP status code
 */
export const Response = <T = unknown>(payload: T, statusCode?: number) => {
	// Determine if this is an error
	const isError =
		typeof payload === 'string' ||
		payload instanceof Error ||
		(Array.isArray(payload) && payload[0]?.constraints) ||
		(statusCode !== undefined && statusCode >= 400);

	// Use default status codes if not provided
	const finalStatus = statusCode ?? (isError ? 500 : 200);

	return isError
		? errorResponse(finalStatus, payload)
		: formatResponse(finalStatus, 'Success', payload);
};
