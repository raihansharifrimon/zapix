<p align="center">
  <img src="./docs/zapix-logo.svg" alt="Zapix Logo" width="400" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/zapix">
    <img src="https://img.shields.io/npm/v/zapix.svg" alt="NPM Version" />
  </a>
  <a href="https://standardjs.com">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg" alt="JavaScript Standard Style" />
  </a>
  <img src="https://camo.githubusercontent.com/501b0cbc24d42d4ac155aa9a099aaac4b3fa5879444221e77dd3ad52b5e42443/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f616374696f6e732f776f726b666c6f772f7374617475732f70696e6f6a732f70696e6f2f63692e796d6c" alt="Build Status" data-canonical-src="https://img.shields.io/github/actions/workflow/status/pinojs/pino/ci.yml" style="max-width: 100%;">
</p>


**Zapix** is a lightweight, AWS Lambda-native router for building APIs on **any cloud framework** (e.g., Serverless Framework, SST) or **raw AWS Lambda**. Inspired by **Express.js**, it provides a familiar routing and middleware experience for Lambda functions.  

#### Key Features

- **Routing & Middleware**
  - Middleware chaining similar to Express.js
  - Define API routes just like in Express.js

- **Error Handling**
  - Global error handling
  - Customizable error responses

- **Utilities & Helpers**
  - Utility helpers for common tasks (e.g., Response, JSON parser)
  - Helper types and interfaces for easier development

- **Type Safety**
  - Fully type-safe and TypeScript-friendly

Zapix lets you build **scalable, serverless APIs** with clean, maintainable code—**framework-free and fully flexible**.


## Table of Contents

- [Overview](#overview)
- [Types](#types)
- [Middleware](#middleware)
- [Controllers](#controllers)
    - [GET /users/{id}](#get-usersid)
    - [POST /users](#post-users)
    - [PUT /users/{id}](#put-usersid)
    - [PATCH /users/{id}](#patch-usersid)
    - [DELETE /users/{id}](#delete-usersid)
- [Router](#router)
- [Fallback Route](#fallback-route)
- [Global Error Handler](#global-error-handler)
- [Utilities](#utilities)
    - [safeJsonParse](#safejsonparse)
    - [Response](#response)
- [Express.js-like Middleware](#expressjs-like-middleware)
- [Lambda Handler](#lambda-handler)

---

## Overview

The Zapix API router uses custom `Router` and `Handler` utilities from `@/libs/router`. It applies `authMiddleware` to all protected endpoints. The Lambda event object includes a typed `user` property, set by the middleware.

- **Path parameters**: `event.pathParameters`
- **Request body**: `event.body`
- **Authenticated user**: `event.user`

---

## Types

```tsx
interface AuthenticatedEvent {
  user?: { name: string; email: string };
}
```

- `AuthenticatedEvent.user`: Populated by `authMiddleware` with the authenticated user's info.

Handler and middleware types:

```tsx
import type { HandlerFn, MiddlewareFn } from '@/libs/router/types';
```

---

## Middleware

### `authMiddleware: MiddlewareFn`

**Purpose:**  
Authenticates requests and attaches user info to the event.

**Behavior:**

- Logs when middleware is invoked
- Attaches a mock user `{ name: 'Raihan', email: 'raihan' }`
- Returns `401 Unauthorized` if authentication fails

**Usage Example:**

```tsx
router.get('/users/{id}', authMiddleware, getController);
```

---

## Controllers

### GET `/users/{id}`

**Controller:** `getController: HandlerFn<any, { user: AuthenticatedEvent }>`
  
**Description:** Returns details of a single user.

**Sample Response:**

```json
{
  "message": "GET user",
  "user": {
    "name": "Raihan",
    "email": "raihan"
  }
}
```

---

### POST `/users`

**Controller:** `createController`

**Description:** Creates a new user. Accepts a JSON body.

**Sample Request:**

```json
{
  "name": "User Name",
  "email": "user@example.com"
}
```

**Sample Response:**

```json
{
  "message": "User created",
  "data": {
    "name": "User Name",
    "email": "user@example.com"
  },
  "user": {
    "name": "Raihan",
    "email": "raihan"
  }
}
```

---

### PUT `/users/{id}`

**Controller:** `updateController`

**Description:** Fully updates a user.

**Sample Request:**

```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

**Sample Response:**

```json
{
  "message": "User updated",
  "data": { "name": "Updated Name", "email": "updated@example.com" },
  "user": { "name": "Raihan", "email": "raihan" }
}
```

---

### PATCH `/users/{id}`

**Controller:** `patchController`

**Description:** Partially updates a user.

**Sample Request:**

```json
{
  "email": "patched@example.com"
}
```

**Sample Response:**

```json
{
  "message": "User patched",
  "data": { "email": "patched@example.com" },
  "user": { "name": "Raihan", "email": "raihan" }
}
```

---

### DELETE `/users/{id}`

**Controller:** `deleteController`

**Description:** Deletes a user.

**Sample Response:**

```json
{
  "message": "User deleted",
  "user": { "name": "Raihan", "email": "raihan" }
}
```

---

## Router

All routes are registered on a `Router` instance:

```tsx
const router = new Router();

router.get('/users/{id}', authMiddleware, getController);
router.post('/users', authMiddleware, createController);
router.put('/users/{id}', authMiddleware, updateController);
router.patch('/users/{id}', authMiddleware, patchController);
router.delete('/users/{id}', authMiddleware, deleteController);
```

---

## Fallback Route

Handles unmatched routes:

```tsx
router.all(async () => ({
  statusCode: 404,
  body: JSON.stringify({ error: 'Route not found' }),
}));
```

---

## Global Error Handler

Zapix supports a global error handler, similar to Express.js. Use `router.useError` to catch and handle errors from any route or middleware:

```tsx
router.useError(async (err, _event, _ctx) => {
  console.log(err, 'errerrerr');
  return Response(err);
});
```

---

## Utilities

### `safeJsonParse`

Safely parses a JSON string, returning `undefined` if parsing fails:

```ts
export const safeJsonParse = (body: string | null | undefined): string | undefined => {
  if (!body) return undefined;
  try {
    return JSON.parse(body);
  } catch {
    return undefined;
  }
};
```

---

### `Response`

A helper for building consistent HTTP responses:

```ts
export const Response = (data: any, statusCode = 200) => ({
  statusCode,
  body: JSON.stringify(data),
});
```

---

## Express.js-like Middleware

Zapix router supports Express.js-style middleware chaining. Middleware functions can be added before controllers for validation, authentication, etc.

**Example:**

```tsx
router.post(
  '/users',
  validate(VCreateUserSchema), // Validation middleware
  authMiddleware,              // Authentication middleware
  createController             // Controller
);
```

- `validate(VCreateUserSchema)`: Validates the request body against a schema.
- `authMiddleware`: Authenticates the request.
- `createController`: Handles the business logic.

---

## Lambda Handler

Exports the Zapix router as a Lambda handler for AWS API Gateway:

```tsx
export const handler = Handler(router);
```

- Usable with Serverless Framework or AWS Lambda.
- All requests pass through middleware before controllers.

---

This documentation covers all routes, middleware, types, utilities, error handling, and behaviors for the **Zapix users API router**.

**Author:** 
Raihan Sharif, Software Engineer Brillmark LLC  
