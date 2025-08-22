import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import type { RouteHandler, RouteMiddleware } from '../types';
import { Response, safeJsonParse } from '../utils';

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
	private errorHandler?: (
		err: any,
		event: APIGatewayProxyEventV2,
		context: Context,
	) => Promise<APIGatewayProxyResultV2> | APIGatewayProxyResultV2;

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

	// 👇 Catch-all error
	useError(
		handler: (
			err: any,
			event: APIGatewayProxyEventV2,
			context: Context,
		) => Promise<APIGatewayProxyResultV2> | APIGatewayProxyResultV2,
	) {
		this.errorHandler = handler;
	}

	private addRoute(method: string, path: string, handlers: RouteChainItem[]) {
		this.routes.push({ method, path, handlers });
	}

	async handle(
		event: APIGatewayProxyEventV2,
		context: Context,
	): Promise<APIGatewayProxyResultV2> {
		const routeKey = event.requestContext.routeKey;
		const body = event.body;

		const route = this.routes.find((r) => `${r.method} ${r.path}` === routeKey);

		if (!route && !this.fallbackHandlers.length) {
			return {
				statusCode: 404,
				body: JSON.stringify({ message: 'Route not found' }),
			};
		}

		event.body = safeJsonParse(body as string);

		let index = 0;
		const handlers = route ? route.handlers : this.fallbackHandlers;

		const run = async (err?: any): Promise<APIGatewayProxyResultV2 | undefined> => {
			if (err) {
				if (this.errorHandler) {
					return this.errorHandler(err, event, context);
				}
				return Response(err, 500);
			}

			const handler = handlers[index++];
			if (!handler) return;

			const next = (error?: any) => run(error);

			const result = await handler(event as any, context, next);
			if (result) return result;
		};

		const response = await run();

		return (
			response || {
				statusCode: 500,
				body: JSON.stringify({ message: 'No response returned' }),
			}
		);
	}
}

export const Handler = <T extends { handle: LambdaHandler }>(router: T): LambdaHandler => {
	return router.handle.bind(router);
};
