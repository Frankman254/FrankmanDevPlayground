import { z } from "zod";

export function createEmailSchema(message: string) {
	return z.object({
		email: z.email(message),
	});
}

export type EmailSchema = z.infer<ReturnType<typeof createEmailSchema>>;
