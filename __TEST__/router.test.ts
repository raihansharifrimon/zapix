import { APIGatewayProxyEventV2, Context } from "aws-lambda";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Response, successResponse } from "../src/utils/response";

// Utility to create fake API Gateway events
const createEvent = (
  overrides: Partial<APIGatewayProxyEventV2> = {}
): APIGatewayProxyEventV2 => ({
  version: "2.0",
  routeKey: "",
  rawPath: "/",
  rawQueryString: "", // required string
  cookies: [],
  headers: {},
  queryStringParameters: {},
  requestContext: { routeKey: "GET /", http: { method: "GET" } } as any,
  body: undefined,
  isBase64Encoded: false,
  stageVariables: undefined, // optional
  ...overrides,
});

describe("Response helper API Gateway style", () => {
  let context: Context;

  beforeEach(() => {
    context = {} as Context;
    vi.resetModules(); // Reset process.env for each test if needed
  });

  it("should return success response with data", async () => {
    const data = { user: "Alice" };
    const response = Response(data);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body).toEqual(data);
    expect(response.headers["Content-Type"]).toBe("application/json");
    expect(response.headers["Access-Control-Allow-Origin"]).toBe("*");
  });

  it("should return success response with no data", async () => {
    const response = successResponse();
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body).toEqual({});
  });

  it("should handle string errors", async () => {
    const errorMessage = "Something went wrong";
    const response = Response(errorMessage, 400);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe(errorMessage);
  });

  it("should handle JS Error instances", async () => {
    const error = new Error("Test error");
    const response = Response(error, 500);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(500);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Test error");
    expect(body.error).toBeDefined();
  });

  it("should handle array-based validation errors", async () => {
    const error = [
      {
        constraints: { isNotEmpty: "Field cannot be empty" },
      },
    ];
    const response = Response(error, 400);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Field cannot be empty");
    expect(body.error).toEqual({ isNotEmpty: "Field cannot be empty" });
  });

  it("should handle Mongoose-style ValidationError", async () => {
    const error = {
      name: "ValidationError",
      errors: {
        email: { message: "Invalid email" },
      },
    };
    const response = Response(error, 400);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Invalid email");
    expect(body.error).toEqual(error.errors);
  });

  it("should return internal server error for generic object when DEBUG=false", async () => {
    process.env.DEBUG = "false";
    const error = { something: "bad" };
    const response = Response(error, 500);
    const body = JSON.parse(response.body);

    expect(body.message).toBe("Internal Server Error");
    expect(body.error).toBeNull();
  });

  it("should merge custom headers with default headers", async () => {
    const headers = { "X-Custom": "test" };
    const response = Response({ foo: "bar" }, 200, headers);
  
    expect(response.headers["Content-Type"]).toBe("application/json");
    expect(response.headers["Access-Control-Allow-Origin"]).toBe("*");
  });
});
