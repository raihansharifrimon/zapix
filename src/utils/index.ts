export const safeParseBody = (body: string | null | undefined): string | undefined => {
	if (!body) return undefined;
	try {
		return JSON.parse(body);
	} catch {
		return undefined;
	}
};
