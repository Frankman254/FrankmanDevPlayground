"use client";

import dynamic from "next/dynamic";

import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";

const TodoApp = dynamic(
  () => import("@/features/apps/todos/todo-app").then((module) => module.TodoApp),
  {
    ssr: false,
    loading: () => <TodosLoadingState />,
  },
);

export default function TodosPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="App MVP"
        title="Todos Hub"
        description="A local-first productivity module that already follows the shape needed for user profiles, favorites and future cloud sync."
      />
      <TodoApp />
    </div>
  );
}

function TodosLoadingState() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Card className="space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">
          Productivity app
        </p>
        <h2 className="text-2xl font-semibold text-white">Loading todos...</h2>
        <p className="text-sm leading-7 text-slate-300">
          Preparing your local task data and restoring the saved state.
        </p>
      </Card>
      <Card className="space-y-4">
        <p className="text-sm text-slate-400">Storage</p>
        <p className="text-lg font-medium text-white">Hydrating local state</p>
      </Card>
    </div>
  );
}
