import { Elysia } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";

import { userRoutes } from "./routes/user-route";

const app = new Elysia()
  .use(userRoutes)
  .get("/", () => ({ status: "ok", message: "Elysia + Drizzle + Bun is running!" }))
  .get("/users", async () => {
    try {
      const allUsers = await db.select().from(users);
      return allUsers;
    } catch (error) {
      return { error: "Failed to fetch users", details: error instanceof Error ? error.message : "Unknown error" };
    }
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
