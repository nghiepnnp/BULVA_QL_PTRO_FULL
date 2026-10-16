"use client";

import { useQueryClient } from "@tanstack/react-query";
import { queryKeys, useTasksQuery } from "@package/shared";
import { webApi } from "@/services/api";

export function TaskList() {
  const queryClient = useQueryClient();
  const tasks = useTasksQuery(webApi);

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold">Công việc</h2>
        <button className="text-sm font-medium text-indigo-600" onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.tasks })}>Làm mới</button>
      </div>
      {tasks.isPending ? <p>Đang tải…</p> : tasks.isError ? <p>Không tải được tasks. Kiểm tra backend /tasks.</p> : (
        <div className="space-y-3">
          {tasks.data?.map((task) => (
            <div key={task.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4">
              <span className={task.completed ? "text-emerald-500" : "text-amber-500"}>{task.completed ? "●" : "○"}</span>
              <span className={task.completed ? "text-slate-400 line-through" : "text-slate-700"}>{task.title}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
