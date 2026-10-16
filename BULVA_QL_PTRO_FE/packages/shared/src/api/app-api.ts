import type { AxiosInstance } from "axios";
import { loginSchema, tokensSchema, userSchema } from "../schemas/auth.schema";
import { tasksSchema } from "../schemas/task.schema";
import type { LoginInput, Tokens, User } from "../schemas/auth.schema";
import type { Task } from "../schemas/task.schema";

export interface AppApi {
  login(credentials: LoginInput): Promise<Tokens>;
  me(): Promise<User>;
  tasks(): Promise<Task[]>;
  logout(): Promise<void>;
}

/** Adapter for each platform: supply an axios instance and relative paths. */
export function createAppApi(
  http: AxiosInstance,
  paths: { login: string; me: string; tasks: string; logout: string },
): AppApi {
  return {
    async login(credentials) {
      const body = loginSchema.parse(credentials);
      const res = await http.post(paths.login, body);
      return tokensSchema.parse(res.data);
    },
    async me() {
      const res = await http.get(paths.me);
      return userSchema.parse(res.data);
    },
    async tasks() {
      const res = await http.get(paths.tasks);
      return tasksSchema.parse(res.data);
    },
    async logout() {
      await http.post(paths.logout);
    },
  };
}
