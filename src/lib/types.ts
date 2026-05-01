export interface QuizOption {
  label: string;
  value: string;
}

export interface Exercise {
  type: "input" | "terminal" | "choice";
  prompt: string;
  placeholder?: string;
  choices?: string[];
  validator: (input: string) => { correct: boolean; hint: string };
  terminalCommands?: Record<string, (args: string) => string>;
}

export interface Quiz {
  question: string;
  options: QuizOption[];
  correct: string;
  explanation: string;
}

export interface DayData {
  day: number;
  title: string;
  hook: string;
  lesson: string[];
  exercise: Exercise;
  quiz: Quiz;
  output: string;
  homework?: Homework[];
}

export interface Homework {
  title: string;
  url: string;
  description: string;
}

export interface WeekMeta {
  id: number;
  title: string;
  subtitle: string;
  days: DayData[];
  skills: string[];
}
