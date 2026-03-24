import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, sessions } from "../db/schema";

export const registerUser = async (payload: any) => {
  const { name, email, password } = payload;

  // Pengecekan apakah email sudah terdaftar
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error("Email sudah terdaftar");
  }

  // Hash password menggunakan fitur hashing bawaan Bun (Bcrypt)
  const hashedPassword = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10, // standar default untuk bcrypt
  });

  // Simpan user baru ke database
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return { data: "OK" };
};

export const loginUser = async (payload: any) => {
  const { email, password } = payload;

  // 1. Cari user berdasarkan email
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    throw new Error("Email atau password salah");
  }

  // 2. Verifikasi password hash
  const isPasswordValid = await Bun.password.verify(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Email atau password salah");
  }

  // 3. Buat token session (UUID)
  const token = crypto.randomUUID();

  // 4. Simpan session ke database
  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  return { data: token };
};

export const getCurrentUser = async (token: string) => {
  // 1. Cari user berdasarkan token session dengan join ke table users
  const [result] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .limit(1);

  if (!result) {
    throw new Error("Unauthorized");
  }

  return { data: result };
};

export const logoutUser = async (token: string) => {
  // 1. Cek apakah session ada
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  if (!session) {
    throw new Error("Unauthorized");
  }

  // 2. Hapus session dari database
  await db.delete(sessions).where(eq(sessions.token, token));

  return { data: "OK" };
};
