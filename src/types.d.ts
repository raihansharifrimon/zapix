import type { APIGatewayProxyEventV2, Context as LambdaContext } from 'aws-lambda';

export type Request<
	TBody extends object = Record<string, unknown>,
	TExtra extends object = Record<string, unknown>,
> = Omit<APIGatewayProxyEventV2, 'body'> & {
	body: TBody;
} & TExtra;

export interface Context extends LambdaContext {}

export type MiddlewareFn = (
	event: AuthenticatedEvent,
	context: Context,
	next: () => Promise<any>,
) => Promise<any>;

export type HandlerFn<
	TBody extends object = Record<string, unknown>,
	TExtra extends object = Record<string, unknown>,
> = (event: Request<TBody, TExtra>, context: Context) => Promise<any>;
