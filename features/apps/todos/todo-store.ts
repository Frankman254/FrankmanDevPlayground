"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { TodoItem, TodoVisibility } from "@/features/apps/todos/types";

type TodoStore = {
  todos: TodoItem[];
  visibility: TodoVisibility;
  addTodo: (title: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  setVisibility: (visibility: TodoVisibility) => void;
  clearCompleted: () => void;
};

function createTodo(title: string): TodoItem {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    id,
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

export const useTodoStore = create<TodoStore>()(
  persist(
    (set) => ({
      todos: [
        {
          id: "todo-welcome",
          title: "Ship the first version of FrankmanDev Playground",
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ],
      visibility: "all",
      addTodo: (title) =>
        set((state) => ({
          todos: [createTodo(title), ...state.todos],
        })),
      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo,
          ),
        })),
      removeTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        })),
      setVisibility: (visibility) => set({ visibility }),
      clearCompleted: () =>
        set((state) => ({
          todos: state.todos.filter((todo) => !todo.completed),
        })),
    }),
    {
      name: "frankmandev-playground-todos",
      partialize: (state) => ({
        todos: state.todos,
        visibility: state.visibility,
      }),
    },
  ),
);

export function selectVisibleTodos(todos: TodoItem[], visibility: TodoVisibility) {
  switch (visibility) {
    case "active":
      return todos.filter((todo) => !todo.completed);
    case "completed":
      return todos.filter((todo) => todo.completed);
    default:
      return todos;
  }
}
