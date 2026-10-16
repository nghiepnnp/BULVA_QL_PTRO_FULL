"use client";

import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { loginSchema, queryKeys, useSessionStore } from "@package/shared";
import { webApi } from "@/services/api";

export function LoginForm() {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();
  const setUser = useSessionStore((state) => state.setUser);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const input = loginSchema.safeParse({ email, password });
    if (!input.success) {
      setError(input.error.issues[0]?.message ?? "Dữ liệu không hợp lệ");
      return;
    }
    setBusy(true);
    try {
      await webApi.login(input.data);
      const user = await webApi.me();
      queryClient.clear(); // Avoid leaking cached data between sessions.
      setUser(user);
      await queryClient.invalidateQueries({ queryKey: queryKeys.me });
    } catch {
      setError("Đăng nhập thất bại. Hãy kiểm tra tài khoản hoặc API.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="max-w-md rounded-2xl border border-slate-100 bg-white p-7 shadow-sm">
      <h2 className="text-2xl font-bold">Đăng nhập</h2>
      <p className="mt-2 text-sm text-slate-500">Demo: demo@example.com / Password123!</p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium">Email
          <input type="email" autoComplete="username" className="mt-2 w-full rounded-xl border border-slate-200 p-3" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">Mật khẩu
          <input type="password" autoComplete="current-password" className="mt-2 w-full rounded-xl border border-slate-200 p-3" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} type="submit" className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60">
          {busy ? "Đang xử lý…" : "Đăng nhập"}
        </button>
      </form>
    </section>
  );
}
