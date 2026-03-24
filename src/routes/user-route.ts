import { Elysia, t } from "elysia";
import { registerUser } from "../services/user-service";

export const userRoutes = new Elysia({ prefix: "/api" }).post(
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
);
