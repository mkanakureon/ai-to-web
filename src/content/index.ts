// レッスン レジストリ
import type { Lesson } from "../types.js";
import { l0_1 } from "./l0-1.js";
import { l0_2 } from "./l0-2.js";
import { l0_3 } from "./l0-3.js";
import { l1 } from "./l1.js";
import { l2 } from "./l2.js";
import { l3 } from "./l3.js";
import { l4 } from "./l4.js";
import { l5 } from "./l5.js";
import { l6 } from "./l6.js";
import { l7 } from "./l7.js";
import { l8 } from "./l8.js";
import { l9 } from "./l9.js";
import { l10 } from "./l10.js";

export const LESSONS: readonly Lesson[] = [l0_1, l0_2, l0_3, l1, l2, l3, l4, l5, l6, l7, l8, l9, l10] as const;

export const LESSON_BY_ID: Readonly<Record<string, Lesson>> = {
  [l0_1.id]: l0_1,
  [l0_2.id]: l0_2,
  [l0_3.id]: l0_3,
  [l1.id]: l1,
  [l2.id]: l2,
  [l3.id]: l3,
  [l4.id]: l4,
  [l5.id]: l5,
  [l6.id]: l6,
  [l7.id]: l7,
  [l8.id]: l8,
  [l9.id]: l9,
  [l10.id]: l10,
};

export function getLesson(id: string): Lesson | undefined {
  return LESSON_BY_ID[id];
}

export function listLessonIds(): string[] {
  return LESSONS.map((l) => l.id);
}
