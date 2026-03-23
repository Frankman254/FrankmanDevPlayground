"use client";

import dynamic from "next/dynamic";

import { useTranslations } from "@/components/providers/locale-provider";
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
	const t = useTranslations();

  return (
    <div className="space-y-10">
      <SectionHeading
				description={t.todosPage.description}
				eyebrow={t.todosPage.eyebrow}
				title={t.todosPage.title}
      />
      <TodoApp />
    </div>
  );
}

function TodosLoadingState() {
	const t = useTranslations();

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Card className="space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">
					{t.todosPage.loadingEyebrow}
        </p>
				<h2 className="text-2xl font-semibold text-white">
					{t.todosPage.loadingTitle}
				</h2>
        <p className="text-sm leading-7 text-slate-300">
					{t.todosPage.loadingDescription}
        </p>
      </Card>
      <Card className="space-y-4">
				<p className="text-sm text-slate-400">{t.todosPage.storage}</p>
				<p className="text-lg font-medium text-white">{t.todosPage.hydrating}</p>
      </Card>
    </div>
  );
}
