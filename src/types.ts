// 設計出典: docs/reports/2026/04/18/03-tui-foundation-design.md
// 原資料: kaedevn-monorepo/docs/01_in_specs/2026/04/18/C言語と現代技術.md L4879-L4950

export type TargetPaneState = {
  title: string;
  lines: string[];
  highlightLine?: number;
};

export type RepresentationItem = {
  label: string;
  value: string;
};

export type RepresentationPaneState = {
  items: RepresentationItem[];
};

export type MemoryCell = {
  address: string;
  value: string;
  label?: string;
  selected?: boolean;
  dim?: boolean;  // padding などで薄く表示したい場合
};

export type CpuBusMemoryPhase =
  | "idle"
  | "send-address"
  | "select-memory"
  | "return-data"
  | "done";

export type CpuBusMemoryState = {
  mar?: string;
  mdr?: string;
  addressBusValue?: string;
  dataBusValue?: string;
  memoryCells: MemoryCell[];
  phase: CpuBusMemoryPhase;
};

export type QuizChoice = {
  id: string;
  text: string;
};

export type Quiz = {
  question: string;
  choices: QuizChoice[];
  selectedId?: string;
  correctId: string;
  revealed?: boolean;
};

export type ExplainQuizPaneState = {
  explanationLines: string[];
  quiz?: Quiz;
};

export type LessonStep = {
  target: TargetPaneState;
  representation: RepresentationPaneState;
  cpuBusMemory: CpuBusMemoryState;
  explainQuiz: ExplainQuizPaneState;
};

export type Lesson = {
  id: string;
  title: string;
  steps: LessonStep[];
};

export type DisplayMode = "binary" | "hex" | "char";

// ── 画面モード (Screen / AppState) ──
export type TitleState = {
  screen: "title";
  quit: boolean;
};

export type MenuState = {
  screen: "menu";
  index: number;
  quit: boolean;
};

export type LessonPlayState = {
  screen: "lesson";
  lesson: Lesson;
  stepIndex: number;
  displayMode: DisplayMode;
  autoPlay: boolean;
  quizInput: string | null;
  quit: boolean;
};

export type AppState = TitleState | MenuState | LessonPlayState;

export type KeyEvent =
  | { kind: "next" }
  | { kind: "prev" }
  | { kind: "reset" }
  | { kind: "quit" }
  | { kind: "forceQuit" }
  | { kind: "hint" }
  | { kind: "toggleAuto" }
  | { kind: "mode"; mode: DisplayMode }
  | { kind: "choice"; id: string }
  | { kind: "up" }
  | { kind: "down" }
  | { kind: "enter" }
  | { kind: "back" };
