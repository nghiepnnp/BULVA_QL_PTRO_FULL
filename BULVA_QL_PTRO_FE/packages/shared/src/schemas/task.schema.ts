import { z } from "zod";

export const taskSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  title: z.string(),
  completed: z.boolean(),
});
export const tasksSchema = z.array(taskSchema);
export type Task = z.infer<typeof taskSchema>;
