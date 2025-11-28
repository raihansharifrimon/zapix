// Default headers for all responses
const DEFAULT_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Content-Type': 'application/json',
};

/**
 * Generic response formatter
 */
const formatResponse = <T = unknown>(
	statusCode: number,
	message: string,
	data?: T,
	headers: Record<string, any> = {},
) => {
	return {
		statusCode,
		headers: { ...DEFAULT_HEADERS, ...headers },
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

const formatErrorResponse = (error: any) => {
	const isDebugMode = process.env.DEBUG || true;

	let message = 'Internal Server Error';
	let details: any = error;

	// 1️⃣ Array-based validation errors (e.g., class-validator)
	if (Array.isArray(error) && error[0]?.constraints) {
		const constraints = error[0].constraints;
		const firstKey = Object.keys(constraints)[0];
		message = constraints[firstKey] ?? 'Validation error';
		details = constraints;
	}
	// 2️⃣ Generic structured validation errors
	else if (error?.name === 'ValidationError' && error.errors) {
		const firstKey = Object.keys(error.errors)[0];
		message = error.errors[firstKey]?.message ?? 'Validation error';
		details = error.errors;
	}
	// 3️⃣ Standard JS Error
	else if (error instanceof Error) {
		message = error.message;
		details = error.stack;
	}
	// 4️⃣ String errors
	else if (typeof error === 'string') {
		message = error;
	}
	// 5️⃣ Fallback for generic objects
	else if (typeof error === 'object') {
		try {
			message = JSON.stringify(error);
		} catch {
			message = 'Unknown error';
		}
	}

	if (!isDebugMode) {
		details = null;
		message = 'Internal Server Error';
	}

	return { success: false, message, error: details };
};

/**
 * Unified API response helper
 * @param payload - success data or error message/object
 * @param statusCode - optional HTTP status code
 */
export const Response = <T = unknown>(
	payload: T,
	statusCode: number = 200,
	headers: Record<string, any> = {},
) => {
	// Determine if this is an error
	const isError =
		typeof payload === 'string' ||
		payload instanceof Error ||
		(Array.isArray(payload) && payload[0]?.constraints) ||
		(statusCode !== undefined && statusCode >= 400);

	// Use default status codes if not provided
	const finalStatus = statusCode ?? (isError ? 500 : 200);

	if (isError) {
		const response = formatErrorResponse(payload);
		return formatResponse(finalStatus, 'error', response, headers);
	}

	return formatResponse(finalStatus, 'Success', payload, headers);
};
