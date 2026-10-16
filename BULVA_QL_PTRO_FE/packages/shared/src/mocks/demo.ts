import type { User } from "../schemas/auth.schema";
import type { Task } from "../schemas/task.schema";

export const demoUser: User = {
  id: "demo-01",
  name: "Demo Developer",
  email: "demo@example.com",
};

export const demoTasks: Task[] = [
  { id: "1", title: "Tạo monorepo Web + Mobile", completed: true },
  { id: "2", title: "Dùng chung API client, schemas và hooks", completed: true },
  { id: "3", title: "Kết nối NestJS backend của bạn", completed: false },
  { id: "4", title: "Thêm tính năng theo module", completed: false },
];

export async function demoDelay(ms = 180) {
  await new Promise<void>((resolve) => setTimeout(resolve, ms));
}
