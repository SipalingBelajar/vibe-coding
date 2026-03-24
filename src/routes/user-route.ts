import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser } from "../services/user-service";

export const userRoutes = new Elysia({ prefix: "/api" })
  .post(
    "/users",
    async ({ body, set }) => {
      try {
        const result = await registerUser(body);
        set.status = 201; // Created
        return result;
      } catch (error: any) {
        if (error.message === "Email sudah terdaftar") {
          set.status = 400; // Bad Request
          return { error: error.message };
        }
        set.status = 500; // Internal server error
        return { error: "Terjadi kesalahan server" };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
    }
  )
  .post(
    "/users/login",
    async ({ body, set }) => {
      try {
        const result = await loginUser(body);
        return result;
      } catch (error: any) {
        if (error.message === "Email atau password salah") {
          set.status = 401; // Unauthorized
          return { error: error.message };
        }
        set.status = 500;
        return { error: "Terjadi kesalahan server" };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
    }
  )
  .post(
    "/users/current",
    async ({ headers, set }) => {
      try {
        const authHeader = headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        const [_, token] = authHeader.split(" ");
        if (!token) {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        const result = await getCurrentUser(token);
        return result;
      } catch (error: any) {
        if (error.message === "Unauthorized") {
          set.status = 401;
          return { error: error.message };
        }
        set.status = 500;
        return { error: "Terjadi kesalahan server" };
      }
    }
  );
