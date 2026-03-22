import { describe, expect, it } from "vitest";

import { selectVisibleTodos } from "@/features/apps/todos/todo-store";

const todos = [
  {
    id: "1",
    title: "Ship blackjack",
    completed: false,
    createdAt: "2026-03-22T00:00:00.000Z",
  },
  {
    id: "2",
    title: "Sync todos later",
    completed: true,
    createdAt: "2026-03-22T00:00:00.000Z",
  },
];

describe("todo filtering", () => {
  it("returns all todos", () => {
    expect(selectVisibleTodos(todos, "all")).toHaveLength(2);
  });

  it("returns only active todos", () => {
    expect(selectVisibleTodos(todos, "active")).toEqual([todos[0]]);
  });

  it("returns only completed todos", () => {
    expect(selectVisibleTodos(todos, "completed")).toEqual([todos[1]]);
  });
});
