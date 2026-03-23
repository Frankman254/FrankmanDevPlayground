"use client";

import { type FormEvent, useMemo, useState } from "react";
import { Check, Trash2 } from "lucide-react";

import { useTranslations } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  selectVisibleTodos,
  useTodoStore,
} from "@/features/apps/todos/todo-store";
import type { TodoVisibility } from "@/features/apps/todos/types";
import { createTodoSchema } from "@/lib/validations/todo";
import { cn } from "@/lib/utils";

const filters: TodoVisibility[] = ["all", "active", "completed"];

export function TodoApp() {
	const t = useTranslations();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
	const todoSchema = createTodoSchema({
		required: t.todos.invalidTask,
		max: t.todos.invalidTask,
	});

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
			setError(result.error.issues[0]?.message ?? t.todos.invalidTask);
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
          <p className="text-sm uppercase tracking-[0.3em] text-[#F5C400]">
					{t.todos.eyebrow}
          </p>
				<h2 className="text-2xl font-semibold text-white">{t.todos.title}</h2>
          <p className="text-sm leading-7 text-slate-300">
					{t.todos.description}
          </p>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input
            onChange={(event) => setDraft(event.target.value)}
					placeholder={t.todos.placeholder}
            value={draft}
          />
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <Button className="w-full" type="submit">
					{t.todos.addTask}
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
					{filter === "all"
						? t.todos.filters.all
						: filter === "active"
							? t.todos.filters.active
							: t.todos.filters.completed}
            </Button>
          ))}
          <Button onClick={clearCompleted} type="button" variant="ghost">
				{t.todos.clearCompleted}
          </Button>
        </div>

        <div className="space-y-3">
          {visibleTodos.length === 0 ? (
            <Card className="border-dashed text-sm text-slate-400">
					{t.todos.noTasks}
            </Card>
          ) : (
            visibleTodos.map((todo) => (
              <div
                className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-[#0B0B10]/70 p-4"
                key={todo.id}
              >
                <button
                  className={cn(
                    "flex flex-1 items-center gap-3 text-left",
                    todo.completed && "text-[#6B6B73]",
                  )}
                  onClick={() => toggleTodo(todo.id)}
                  type="button"
                >
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full border border-white/15",
                      todo.completed &&
                        "border-[#D72638]/35 bg-[#D72638]/12 text-[#F7B6BD]",
                    )}
                  >
                    {todo.completed ? <Check className="size-4" /> : null}
                  </span>
                  <span className={cn(todo.completed && "line-through")}>
                    {todo.title}
                  </span>
                </button>

                <Button
						aria-label={`${t.todos.deletePrefix} ${todo.title}`}
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
          <p className="text-sm uppercase tracking-[0.3em] text-[#F5C400]">
					{t.todos.strategyEyebrow}
          </p>
				<h3 className="text-xl font-semibold text-white">{t.todos.readyForSync}</h3>
        </div>

        <div className="grid gap-4">
				<Metric label={t.todos.totalTasks} value={String(todos.length)} />
				<Metric label={t.todos.completed} value={String(completedCount)} />
				<Metric label={t.todos.storageToday} value={t.todos.storageTodayValue} />
				<Metric label={t.todos.upgradePath} value={t.todos.upgradePathValue} />
        </div>

        <ul className="space-y-3 text-sm leading-7 text-[#F7F3EB]/78">
				{t.todos.bullets.map((bullet) => (
					<li key={bullet}>{bullet}</li>
				))}
        </ul>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-[#F7F3EB]/55">{label}</p>
      <p className="mt-2 text-lg font-medium text-white">{value}</p>
    </div>
  );
}
