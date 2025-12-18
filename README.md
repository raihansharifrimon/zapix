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


**Zapix** is a lightweight, **AWS Lambda–native router** for building APIs on **any AWS framework** (Serverless Framework, SST, CDK, or raw Lambda).

Inspired by Express.js, it gives you familiar routing and middleware on top of Lambda functions — simple, fast, and type-safe.

> Build serverless APIs faster. No custom routing logic. Zero learning curve.
> 

---

### 🚀 Features

- **Express-style Routing**
    
    Simple `.get()`, `.post()`, `.put()`, `.delete()` route definitions.
    
- **Middleware Support**
    
    Chainable middleware functions for authentication, validation, logging, etc.
    
- **Error Handling**
    
    Global error capturing and customizable error responses.
    
- **Utility Helpers**
    
    `Response()`, body parsing, typed route handlers, and more.
    
- **TypeScript-First**
    
    Fully typed interface for safer development and better DX.
    
- **Framework-Agnostic**
    
    Works with any AWS deployment method or plain Lambda code.
    
**Zapix** helps you build **clean, scalable serverless (AWS Lambda) APIs**, without being tied to any framework or complex routing logic.

---

### 📦 Installation

```bash
npm install zapix

```

---

### 📌 When to Use Zapix

If you are building a **single Lambda function with many API Gateway routes**, Zapix handles route matching for you — just like Express.


Zapix is ideal when:

- You use **one AWS Lambda** to handle multiple routes.
- You want routing behavior similar to **Express.js**.
- You need **clean, reusable middleware**.

Example API Gateway paths:

```
POST   /users
GET    /users
GET    /users/{id}
PUT    /users/{id}
DELETE /users/{id}
```

Zapix lets you define these routes exactly like you would in Express, without writing any custom router logic.

---

### 🛠 Prerequisites

- AWS Lambda runtime (Node.js)
- API invoked by **AWS API Gateway** or any Lambda HTTP adapter

---

### 🚀 Quick Start

#### **Basic Router Setup**

```tsx
import { Router, Handler } from 'zapix';

const router = new Router();

router.post('/users', createUser);
router.get('/users', readUsers);
router.get('/users/{userId}', readUserInfo);
router.put('/users/{userId}', updateUser);
router.delete('/users/{userId}', deleteUser);

// Fallback route
router.all(() => ({
  statusCode: 404,
  body: JSON.stringify({ error: 'Route not found' }),
}));

export const handler = Handler(router);
```



### 🧩 Controllers

A **controller** handles your business logic for a route.

```tsx
import { Response, type RouteHandler } from 'zapix';

export const createUser: RouteHandler = async (event, ctx) => {
  try {
    const body = event.body; // Zapix automatically parses JSON

    // Database logic...

    return Response(body);
  } catch (error) {
    return Response(error, 500);
  }
};

```

**Tip:** Any function returning `Response()` is considered a controller.

---

### 🧱 Middleware

Middleware runs **before** a controller.
You can chain multiple middleware functions — each must call `next()` to continue.

```tsx
import { type RouteMiddleware } from 'zapix';

const authMiddleware: RouteMiddleware = async (event, ctx, next) => {
  try {
    // Authentication logic...
    return next();
  } catch (error) {
    return next(error);
  }
};

router.post('/users', authMiddleware, createUser);

```

**Tip:** Calling `next(error)` stops the request and sends an error response.

---

### 🧱➡️ Global Middleware

The Router supports **global middleware**, allowing you to run middleware logic **before any route-specific middleware or handler**.

This is useful for cross-cutting concerns such as authentication, logging, request validation, rate limiting, and request context setup.

#### Registering Global Middleware

Use `router.use()` to register one or more global middleware functions.

```tsx
const router = new Router();

router.use(async (event, context, next) => {
  console.log(event, context);
  await next();
});
```

Global middleware runs for **every request**, regardless of route. Global middleware fully supports async/await:


#### Middleware Signature

Global middleware uses the same signature as route middleware:

```tsx
(event, context, next) =>Promise<void |APIGatewayProxyResultV2>
```

- `event` – API Gateway event
- `context` – Lambda context
- `next(error?)` – Continues execution or triggers error handling


#### Execution Order

Middleware and handlers execute in the following order:

1. **Global middleware** (in registration order)
2. **Route-level middleware**
3. **Route handler**
4. **Error handler** (if an error occurs)

Example:

```tsx
router.use(globalMiddleware);

router.get('/example', routeMiddleware, handler);
```

Execution order:

```
globalMiddleware → routeMiddleware → handler
```

#### Example: Auth + Logging

```tsx
router.use(async (event, context, next) => {
  console.log('Incoming request:', event);
  await next();
});

router.use(async (event, context, next) => {
    if (!event.headers?.authorization) {
      throw new Error('Unauthorized');
    }
    await next();
});
```
---

### 🛡 Request Validation Example (Zod + Middleware)

Payload validation is a common middleware use-case. Zapix middleware makes it simple & easy.

#### 1. Validation Helper

```tsx
// @/helper/zod.ts
import { type z, ZodError } from 'zod';

const formatZodErrorMessages = (error: ZodError) => {
  const errors: Record<string, string> = {};

  error.issues.forEach((issue) => {
    if (issue.path.length) {
      errors[issue.path.join('.')] = issue.message;
    } else {
      errors['extraField'] = issue.message;
    }
  });

  return errors;
};

export const validateRequest = (schema: z.ZodType, data: unknown) => {
  try {
    schema.parse(data);
    return { success: true };
  } catch (err) {
    if (err instanceof ZodError) {
      return { success: false, errors: formatZodErrorMessages(err) };
    }
    throw err;
  }
};

```

#### 2. Zod Schema

```tsx
// schema.ts
import { z } from 'zod';

export const UserValidationSchema = z.object({
  name: z.string().min(2).max(20),
  email: z.string().email(),
  address: z.string().optional(),
});

```

#### 3. Validation Middleware

```tsx
// index.ts
import { Router, Handler } from 'zapix';
import { z } from 'zod';
import { validateRequest } from '@/helper/zod';
import { UserValidationSchema } from './schema';

const requestValidationMiddleware = (schema: z.ZodType) => {
  return async (ctx: any, next: any) => {
    const validation = validateRequest(schema, ctx.body);

    if (!validation.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Validation failed',
          errors: validation.errors,
        }),
      };
    }

    return next();
  };
};

const router = new Router();

router.post(
  '/users',
  requestValidationMiddleware(UserValidationSchema),
  createUser,
);

router.all(() => ({
  statusCode: 404,
  body: JSON.stringify({ error: 'Route not found' }),
}));

export const handler = Handler(router);

```
**Tip:** Reuse the middleware by passing your Zod schema to apply consistent request validation across multiple APIs.

---

### 🧪 Local Testing

You can test Lambda events locally using tools like:

- AWS SAM
- Serverless Framework Offline
- SST Live Lambda Dev
- Local event mock runners

Zapix works with **any Lambda simulator**.

---

### 📝 License

MIT License

© **Raihan Sharif**, Software Engineer | BrillMark LLC