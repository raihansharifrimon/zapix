// import { Handler, Router } from "./router";
// import type { HandlerFn, MiddlewareFn } from "./types";

// // -----------------------------
// // Types
// // -----------------------------
// interface AuthenticatedEvent {
//   user?: { name: string; email: string };
// }

// // -----------------------------
// // Controllers
// // -----------------------------
// export const getController: HandlerFn<
//   any,
//   { user: AuthenticatedEvent }
// > = async (event) => {
//   return {
//     statusCode: 200,
//     body: JSON.stringify({ message: "GET agent", user: event.user }),
//   };
// };

// export const createController: HandlerFn<
//   any,
//   { user: AuthenticatedEvent }
// > = async (event) => {
//   console.log(event.body, "event.body");
//   return {
//     statusCode: 201,
//     body: JSON.stringify({
//       message: "Agent created",
//       data: event.body,
//       user: event.user,
//     }),
//   };
// };

// export const updateController: HandlerFn<
//   any,
//   { user: AuthenticatedEvent }
// > = async (event) => {
//   console.log(event.body, "event.body");
//   return {
//     statusCode: 200,
//     body: JSON.stringify({
//       message: "Agent updated",
//       data: event.body,
//       user: event.user,
//     }),
//   };
// };

// export const patchController: HandlerFn<
//   any,
//   { user: AuthenticatedEvent }
// > = async (event) => {
//   console.log(event.body, "event.body");
//   return {
//     statusCode: 200,
//     body: JSON.stringify({
//       message: "Agent patched",
//       data: event.body,
//       user: event.user,
//     }),
//   };
// };

// export const deleteController: HandlerFn<
//   any,
//   { user: AuthenticatedEvent }
// > = async (event) => {
//   return {
//     statusCode: 200,
//     body: JSON.stringify({ message: "Agent deleted", user: event.user }),
//   };
// };

// // -----------------------------
// // Middleware
// // -----------------------------
// export const authMiddleware: MiddlewareFn = async (event, context, next) => {
//   console.log("Auth middleware called");
//   console.log(context, "context");

//   try {
//     // Example: attach user info
//     event.user = { name: "Raihan", email: "raihan" };

//     return next();
//   } catch (err) {
//     console.log(err);

//     return {
//       statusCode: 401,
//       body: JSON.stringify({ message: "Unauthorized or invalid token" }),
//     };
//   }
// };

// // -----------------------------
// // Router Setup
// // -----------------------------
// const router = new Router();

// // CRUD Routes
// router.get("/agents/{id}", authMiddleware, getController);
// router.post("/agents", authMiddleware, createController);
// router.put("/agents/{id}", authMiddleware, updateController);
// router.patch("/agents/{id}", authMiddleware, patchController);
// router.delete("/agents/{id}", authMiddleware, deleteController);

// // Catch-all fallback
// router.all(async () => {
//   return {
//     statusCode: 404,
//     body: JSON.stringify({ error: "Route not found" }),
//   };
// });

// // -----------------------------
// // Export Lambda Handler
// // -----------------------------
// export const handler = Handler(router);
