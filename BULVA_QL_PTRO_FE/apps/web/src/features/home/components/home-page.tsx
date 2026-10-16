"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMeQuery, useSessionStore } from "@package/shared";
import { LoginForm } from "@/features/auth/components/login-form";
import { TaskList } from "@/features/tasks/components/task-list";
import { webApi } from "@/services/api";

export default function HomePage() {
  const queryClient = useQueryClient();
  const { user, status, setUser, clear } = useSessionStore();
  const me = useMeQuery(webApi);

  useEffect(() => {
    if (me.isSuccess) setUser(me.data);
    if (me.isError) clear();
  }, [me.isSuccess, me.isError, me.data, setUser, clear]);

  async function signOut() {
    try { await webApi.logout(); }
    finally { queryClient.clear(); clear(); }
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <header className="mb-12 flex items-center justify-between gap-4">
        <span className="font-bold tracking-tight">Next.js + Expo</span>
        <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500">Web / Mobile / NestJS API</span>
      </header>
      <div className="mb-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-600">Bulva đơn giản</p>
        <h1 className="text-4xl font-bold">Code chung những phần cần thiết, UI tách riêng.</h1>
        <p className="mt-4 text-slate-500">Mở apps/web/src/features để thêm chức năng Web mới.</p>
      </div>
      {status === "loading" ? (
        <div className="rounded-xl bg-white p-10">Đang kiểm tra phiên đăng nhập…</div>
      ) : status === "guest" ? (
        <LoginForm />
      ) : (
        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-bold">Xin chào, {user?.name}</h2>
            <p className="mt-2 text-sm text-slate-500">{user?.email}</p>
            <button className="mt-8 rounded-lg border border-slate-200 px-4 py-2 text-sm" onClick={signOut}>Đăng xuất</button>
          </aside>
          <TaskList />
        </div>
      )}
      <footer className="mt-14 border-t border-slate-200 pt-6 text-sm text-slate-400">TanStack Query · Zustand · Zod · Axios</footer>
    </main>
  );
}
