# Agents API Router Documentation

This module defines a **Serverless Lambda router** for managing agents, including authentication middleware, CRUD operations, and fallback routes.

## Table of Contents

- [Overview](https://www.notion.so/256accf4a0948020bf07c40e4cc52ebf?pvs=21)
- [Types](https://www.notion.so/256accf4a0948020bf07c40e4cc52ebf?pvs=21)
- [Middleware](https://www.notion.so/256accf4a0948020bf07c40e4cc52ebf?pvs=21)
- [Controllers](https://www.notion.so/256accf4a0948020bf07c40e4cc52ebf?pvs=21)
    - [GET /agents/{id}](https://www.notion.so/256accf4a0948020bf07c40e4cc52ebf?pvs=21)
    - [POST /agents](https://www.notion.so/256accf4a0948020bf07c40e4cc52ebf?pvs=21)
    - [PUT /agents/{id}](https://www.notion.so/256accf4a0948020bf07c40e4cc52ebf?pvs=21)
    - [PATCH /agents/{id}](https://www.notion.so/256accf4a0948020bf07c40e4cc52ebf?pvs=21)
    - [DELETE /agents/{id}](https://www.notion.so/256accf4a0948020bf07c40e4cc52ebf?pvs=21)
- [Router](https://www.notion.so/256accf4a0948020bf07c40e4cc52ebf?pvs=21)
- [Fallback Route](https://www.notion.so/256accf4a0948020bf07c40e4cc52ebf?pvs=21)
- [Lambda Handler](https://www.notion.so/256accf4a0948020bf07c40e4cc52ebf?pvs=21)

---

## Overview

This router uses the custom `Router` and `Handler` from `@/libs/router`. It applies the `authMiddleware` to all protected routes. The event object passed to handlers includes a typed `user` property attached by the middleware.

- **Path parameters** are available in the event object (`event.pathParameters`)
- **Request body** is available as `event.body`
- **User info** is available as `event.user`

---

## Types

```tsx
interface AuthenticatedEvent {
  user?: { name: string; email: string };
}

```

- `AuthenticatedEvent.user` → Added by `authMiddleware`. Contains the authenticated user info.

Handler and middleware types:

```tsx
import type { HandlerFn, MiddlewareFn } from '@/libs/router/types';

```

---

## Middleware

### `authMiddleware: MiddlewareFn`

**Description:**

Authenticates requests and attaches user info to the event.

**Behavior:**

- Logs when middleware is called
- Attaches a mock user `{ name: 'Raihan', email: 'raihan' }`
- Returns `401 Unauthorized` if authentication fails

**Example usage:**

```tsx
router.get('/agents/{id}', authMiddleware, getController);

```

---

## Controllers

### GET `/agents/{id}`

**Controller:** `getController: HandlerFn<any, { user: AuthenticatedEvent }>`

**Description:** Returns details of a single agent.

**Response Example:**

```json
{
  "message": "GET agent",
  "user": {
    "name": "Raihan",
    "email": "raihan"
  }
}
```

---

### POST `/agents`

**Controller:** `createController`

**Description:** Creates a new agent. Accepts a JSON request body.

**Request Example:**

```json
{
  "name": "Agent Name",
  "email": "agent@example.com"
}

```

**Response Example:**

```json
{
  "message": "Agent created",
  "data": {
    "name": "Agent Name",
    "email": "agent@example.com"
  },
  "user": {
    "name": "Raihan",
    "email": "raihan"
  }
}

```

---

### PUT `/agents/{id}`

**Controller:** `updateController`

**Description:** Fully updates an existing agent with new data.

**Request Example:**

```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}

```

**Response Example:**

```json
{
  "message": "Agent updated",
  "data": { "name": "Updated Name", "email": "updated@example.com" },
  "user": { "name": "Raihan", "email": "raihan" }
}

```

---

### PATCH `/agents/{id}`

**Controller:** `patchController`

**Description:** Partially updates an existing agent.

**Request Example:**

```json
{
  "email": "patched@example.com"
}

```

**Response Example:**

```json
{
  "message": "Agent patched",
  "data": { "email": "patched@example.com" },
  "user": { "name": "Raihan", "email": "raihan" }
}

```

---

### DELETE `/agents/{id}`

**Controller:** `deleteController`

**Description:** Deletes an existing agent.

**Response Example:**

```json
{
  "message": "Agent deleted",
  "user": { "name": "Raihan", "email": "raihan" }
}

```

---

## Router

All routes are registered on a `Router` instance:

```tsx
const router = new Router();

router.get('/agents/{id}', authMiddleware, getController);
router.post('/agents', authMiddleware, createController);
router.put('/agents/{id}', authMiddleware, updateController);
router.patch('/agents/{id}', authMiddleware, patchController);
router.delete('/agents/{id}', authMiddleware, deleteController);

```

---

## Fallback Route

**Description:** Handles any unmatched route.

```tsx
router.all(async () => ({
  statusCode: 404,
  body: JSON.stringify({ error: 'Route not found' }),
}));

```

---

## Lambda Handler

Exports the router as a Lambda handler for AWS API Gateway:

```tsx
export const handler = Handler(router);

```

- Can be used directly in Serverless Framework or any AWS Lambda setup.
- All requests go through middleware before reaching the controllers.

---

This documentation fully describes **all routes, middleware, types, and behavior** for your agents API router.



**Author:** Raihan Sharif, Software Engineer Brillmark  
**Date:** 2025-08-21  