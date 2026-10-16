"use client";
import axios from "axios";
import { createAppApi } from "@package/shared";

// All browser requests use same-origin Next.js BFF. No JWT in JS storage.
const http = axios.create({ baseURL: "/api", timeout: 15_000, withCredentials: true });
export const webApi = createAppApi(http, {
  login: "/session/login",
  me: "/session/me",
  tasks: "/tasks",
  logout: "/session/logout",
});
