import { z } from "zod";

export const todoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Write a task title.")
    .max(80, "Task titles should stay under 80 characters."),
});

export type TodoSchema = z.infer<typeof todoSchema>;
