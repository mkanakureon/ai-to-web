// レッスン レジストリ
import type { Lesson } from "../types.js";
import { l0_1 } from "./l0-1.js";
import { l0_2 } from "./l0-2.js";
import { l0_3 } from "./l0-3.js";

export const LESSONS: readonly Lesson[] = [l0_1, l0_2, l0_3] as const;

export const LESSON_BY_ID: Readonly<Record<string, Lesson>> = {
  [l0_1.id]: l0_1,
  [l0_2.id]: l0_2,
  [l0_3.id]: l0_3,
};

export function getLesson(id: string): Lesson | undefined {
  return LESSON_BY_ID[id];
}

export function listLessonIds(): string[] {
  return LESSONS.map((l) => l.id);
}
