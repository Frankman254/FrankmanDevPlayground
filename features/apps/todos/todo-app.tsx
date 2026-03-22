"use client";

import { type FormEvent, useMemo, useState } from "react";
import { Check, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  selectVisibleTodos,
  useTodoStore,
} from "@/features/apps/todos/todo-store";
import type { TodoVisibility } from "@/features/apps/todos/types";
import { todoSchema } from "@/lib/validations/todo";
import { cn } from "@/lib/utils";

const filters: TodoVisibility[] = ["all", "active", "completed"];

export function TodoApp() {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  const {
    todos,
    visibility,
    addTodo,
    toggleTodo,
    removeTodo,
    setVisibility,
    clearCompleted,
  } = useTodoStore();

  const visibleTodos = useMemo(
    () => selectVisibleTodos(todos, visibility),
    [todos, visibility],
  );

  const completedCount = todos.filter((todo) => todo.completed).length;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = todoSchema.safeParse({ title: draft });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Write a valid task.");
      return;
    }

    addTodo(result.data.title);
    setDraft("");
    setError("");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Card className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">
            Productivity app
          </p>
          <h2 className="text-2xl font-semibold text-white">Todos Hub</h2>
          <p className="text-sm leading-7 text-slate-300">
            Local-first task management that feels instant today and can sync to
            Supabase profiles later.
          </p>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a task for the playground roadmap"
            value={draft}
          />
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <Button className="w-full" type="submit">
            Add task
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              className="capitalize"
              key={filter}
              onClick={() => setVisibility(filter)}
              type="button"
              variant={visibility === filter ? "default" : "secondary"}
            >
              {filter}
            </Button>
          ))}
          <Button onClick={clearCompleted} type="button" variant="ghost">
            Clear completed
          </Button>
        </div>

        <div className="space-y-3">
          {visibleTodos.length === 0 ? (
            <Card className="border-dashed text-sm text-slate-400">
              No tasks match this filter yet.
            </Card>
          ) : (
            visibleTodos.map((todo) => (
              <div
                className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-slate-950/60 p-4"
                key={todo.id}
              >
                <button
                  className={cn(
                    "flex flex-1 items-center gap-3 text-left",
                    todo.completed && "text-slate-500",
                  )}
                  onClick={() => toggleTodo(todo.id)}
                  type="button"
                >
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full border border-white/15",
                      todo.completed && "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
                    )}
                  >
                    {todo.completed ? <Check className="size-4" /> : null}
                  </span>
                  <span className={cn(todo.completed && "line-through")}>
                    {todo.title}
                  </span>
                </button>

                <Button
                  aria-label={`Delete ${todo.title}`}
                  onClick={() => removeTodo(todo.id)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">
            Persistence strategy
          </p>
          <h3 className="text-xl font-semibold text-white">Ready for sync</h3>
        </div>

        <div className="grid gap-4">
          <Metric label="Total tasks" value={String(todos.length)} />
          <Metric label="Completed" value={String(completedCount)} />
          <Metric label="Storage today" value="localStorage" />
          <Metric label="Upgrade path" value="Supabase + user profiles" />
        </div>

        <ul className="space-y-3 text-sm leading-7 text-slate-300">
          <li>Guest users can manage tasks instantly without auth friction.</li>
          <li>Task shape is simple enough to migrate into tables later.</li>
          <li>Filters and UI state are already stored for a smoother return experience.</li>
        </ul>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-medium text-white">{value}</p>
    </div>
  );
}
