import { APIGatewayProxyEventV2, Context } from "aws-lambda";
import { beforeEach, describe, expect, it } from "vitest";
import { Handler, Router } from "../src/router";
import { MiddlewareFn } from "./../src/router/types.d";

// Safe body helper for tests
const createEvent = (
  overrides: Partial<APIGatewayProxyEventV2> = {}
): APIGatewayProxyEventV2 => ({
  rawPath: "/",
  requestContext: { routeKey: "GET /", http: { method: "GET" } } as any,
  queryStringParameters: {},
  body: undefined,
  headers: {},
  isBase64Encoded: false,
  cookies: [],
  version: "2.0",
  routeKey: "",
  stageVariables: "null",
  ...overrides,
});

describe("Router", () => {
  let router: Router;
  let context: Context;

  beforeEach(() => {
    router = new Router();
    context = {} as Context;
  });

  it("should match GET route with path parameter", async () => {
    router.get("/agents/{id}", async (event) => {
      return { statusCode: 200, body: event.pathParameters?.id ?? "missing" };
    });

    const event = createEvent({
      rawPath: "/agents/abc123",
      requestContext: {
        routeKey: "GET /agents/{id}",
        http: { method: "GET" },
      } as any,
    });

    event.pathParameters = { id: "abc123" };

    const response = await router.handle(event, context);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("abc123");
  });

  it("should parse query parameters", async () => {
    router.get("/search", async (event) => ({
      statusCode: 200,
      body: JSON.stringify(event.queryStringParameters),
    }));

    const event = createEvent({
      rawPath: "/search",
      requestContext: {
        routeKey: "GET /search",
        http: { method: "GET" },
      } as any,
      queryStringParameters: { q: "test", page: "2" },
    });

    const response = await router.handle(event, context);
    const query = JSON.parse(response.body);
    expect(response.statusCode).toBe(200);
    expect(query.q).toBe("test");
    expect(query.page).toBe("2");
  });

  it("should handle POST body parsing", async () => {
    router.post("/agents", async (event) => ({
      statusCode: 201,
      body: JSON.stringify(event.body),
    }));

    const event = createEvent({
      rawPath: "/agents",
      requestContext: {
        routeKey: "POST /agents",
        http: { method: "POST" },
      } as any,
      body: JSON.stringify({ name: "Alice" }),
    });

    const response = await router.handle(event, context);
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(201);
    expect(body.name).toBe("Alice");
  });

  it("should execute multiple middleware in order", async () => {
    const calls: string[] = [];

    const middleware1: MiddlewareFn = async (event, ctx, next) => {
      calls.push("first");
      return next?.();
    };

    const middleware2: Handler = async () => {
      calls.push("second");
      return { statusCode: 200, body: "done" };
    };

    router.get("/multi", middleware1, middleware2);

    const event = createEvent({
      rawPath: "/multi",
      requestContext: {
        routeKey: "GET /multi",
        http: { method: "GET" },
      } as any,
    });

    const response = await router.handle(event, context);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("done");
    expect(calls).toEqual(["first", "second"]);
  });

  it("should call fallback route if no match is found", async () => {
    router.all(async () => ({
      statusCode: 404,
      body: JSON.stringify({ error: "Not Found" }),
    }));

    const event = createEvent({
      rawPath: "/unknown",
      requestContext: {
        routeKey: "GET /unknown",
        http: { method: "GET" },
      } as any,
    });

    const response = await router.handle(event, context);
    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body).error).toBe("Not Found");
  });

  it("should handle multiple path parameters", async () => {
    router.get("/agents/{id}/settings/{settingId}", async (event) => ({
      statusCode: 200,
      body: JSON.stringify(event.pathParameters),
    }));

    const event = createEvent({
      rawPath: "/agents/42/settings/99",
      requestContext: {
        routeKey: "GET /agents/{id}/settings/{settingId}",
        http: { method: "GET" },
      } as any,
      pathParameters: { id: "42", settingId: "99" },
    });

    const response = await router.handle(event, context);
    const params = JSON.parse(response.body);
    expect(params.id).toBe("42");
    expect(params.settingId).toBe("99");
  });
});
