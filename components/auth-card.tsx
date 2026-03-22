"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { emailSchema } from "@/lib/validations/auth";

export function AuthCard() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    "Use magic link auth when your Supabase keys are configured.",
  );
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = emailSchema.safeParse({ email });

    if (!result.success) {
      setMessage(result.error.issues[0]?.message ?? "Enter a valid email.");
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setMessage(
        "Supabase keys are missing. Add them to .env.local before enabling auth.",
      );
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
        : "Magic link sent. Check your inbox to continue into the playground.",
    );
  }

  return (
    <Card className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Magic link sign in</h2>
        <p className="text-sm leading-7 text-slate-300">
          Keep the default experience open for guests, then unlock persistence
          for users who want favorites, stats and synced app data.
        </p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          type="email"
          value={email}
        />
        <Button className="w-full" disabled={isLoading} type="submit">
          {isLoading ? "Sending..." : "Send magic link"}
        </Button>
      </form>

      <p className="text-sm text-slate-400">{message}</p>
    </Card>
  );
}
