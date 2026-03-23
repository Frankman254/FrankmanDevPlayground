import { z } from "zod";

export function createTodoSchema(messages: {
	required: string;
	max: string;
}) {
	return z.object({
		title: z
			.string()
			.trim()
			.min(1, messages.required)
			.max(80, messages.max),
	});
}

export type TodoSchema = z.infer<ReturnType<typeof createTodoSchema>>;
