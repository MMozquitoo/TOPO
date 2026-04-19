const STORAGE_KEY = "cybersec-daily-progress";

export interface Progress {
  completedDays: number[];
  quizAnswers: Record<number, string>;
  exerciseCompleted: Record<number, boolean>;
}

function getDefaultProgress(): Progress {
  return { completedDays: [], quizAnswers: {}, exerciseCompleted: {} };
}

export function getProgress(): Progress {
  if (typeof window === "undefined") return getDefaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDefaultProgress();
  } catch {
    return getDefaultProgress();
  }
}

export function saveProgress(progress: Progress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function markDayComplete(day: number) {
  const p = getProgress();
  if (!p.completedDays.includes(day)) {
    p.completedDays.push(day);
  }
  saveProgress(p);
}

export function markExerciseComplete(day: number) {
  const p = getProgress();
  p.exerciseCompleted[day] = true;
  saveProgress(p);
}

export function saveQuizAnswer(day: number, answer: string) {
  const p = getProgress();
  p.quizAnswers[day] = answer;
  saveProgress(p);
}
