import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const userSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  email: z.email(),
  name: z.string(),
});
export type User = z.infer<typeof userSchema>;

// NestJS should return these camelCase fields, or adjust this adapter once.
export const tokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});
export type Tokens = z.infer<typeof tokensSchema>;
