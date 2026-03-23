"use client";

import { type FormEvent, useState } from "react";

import { useTranslations } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { createEmailSchema } from "@/lib/validations/auth";

export function AuthCard() {
	const t = useTranslations();
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const emailSchema = createEmailSchema(t.authCard.invalidEmail);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = emailSchema.safeParse({ email });

    if (!result.success) {
			setMessage(result.error.issues[0]?.message ?? t.authCard.invalidEmail);
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
			setMessage(t.authCard.missingKeys);
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: result.data.email,
    });

    setIsLoading(false);
    setMessage(
      error
        ? error.message
				: t.authCard.sentMessage,
    );
  }

  return (
    <Card className="space-y-5">
      <div className="space-y-2">
				<h2 className="text-xl font-semibold text-white">{t.authCard.title}</h2>
        <p className="text-sm leading-7 text-slate-300">
					{t.authCard.description}
        </p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
					placeholder={t.authCard.placeholder}
          type="email"
          value={email}
        />
        <Button className="w-full" disabled={isLoading} type="submit">
					{isLoading ? t.authCard.sending : t.authCard.send}
        </Button>
      </form>

      <p className="text-sm text-slate-400">{message ?? t.authCard.initialMessage}</p>
    </Card>
  );
}
