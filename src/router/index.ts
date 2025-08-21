import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import type { RouteHandler, RouteMiddleware } from '../types';
import { safeParseBody } from '../utils';

type LambdaHandler = (event: APIGatewayProxyEventV2, context: Context) => Promise<any>;

type RouteChainItem = RouteHandler<any, any> | RouteMiddleware<any, any>;
interface Route {
	method: string;
	path: string;
	handlers: RouteChainItem[];
}

export class Router {
	private routes: Route[] = [];
	private fallbackHandlers: RouteChainItem[] = [];

	get(path: string, ...handlers: RouteChainItem[]) {
		this.addRoute('GET', path, handlers);
	}

	post(path: string, ...handlers: RouteChainItem[]) {
		this.addRoute('POST', path, handlers);
	}

	put(path: string, ...handlers: RouteChainItem[]) {
		this.addRoute('PUT', path, handlers);
	}

	patch(path: string, ...handlers: RouteChainItem[]) {
		this.addRoute('PATCH', path, handlers);
	}

	delete(path: string, ...handlers: RouteChainItem[]) {
		this.addRoute('DELETE', path, handlers);
	}

	options(path: string, ...handlers: RouteChainItem[]) {
		this.addRoute('OPTIONS', path, handlers);
	}

	// 👇 Catch-all if no route matched
	all(...handlers: RouteChainItem[]) {
		this.fallbackHandlers = handlers;
	}

	private addRoute(method: string, path: string, handlers: RouteChainItem[]) {
		this.routes.push({ method, path, handlers });
	}

	async handle(
		event: APIGatewayProxyEventV2,
		context: Context,
	): Promise<APIGatewayProxyResultV2> {
		const routeKey = event.requestContext.routeKey; // e.g. "GET /agents/{id}"
		const body = event.body;

		// Find the first route that matches path and method
		const route = this.routes.find((r) => `${r.method} ${r.path}` === routeKey);

		if (!route && !this.fallbackHandlers) {
			return {
				statusCode: 404,
				body: JSON.stringify({ message: 'Route not found' }),
			};
		}

		event.body = safeParseBody(body as string);

		let index = 0;
		const next = async (): Promise<APIGatewayProxyResultV2 | undefined> => {
			const handler = !route ? this.fallbackHandlers[index++] : route.handlers[index++];
			if (handler) return handler(event as any, context, next);
		};

		return next() as APIGatewayProxyResultV2;
	}
}

export const Handler = <T extends { handle: LambdaHandler }>(router: T): LambdaHandler => {
	return router.handle.bind(router);
};
