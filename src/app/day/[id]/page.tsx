"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDayData, getWeekForDay, getWeekDayIndex } from "@/lib/curriculum";
import {
  getProgress,
  markDayComplete,
  markExerciseComplete,
  saveQuizAnswer,
} from "@/lib/progress";
import { spring, fadeUp } from "@/lib/motion";
import AnimatedPage from "@/components/AnimatedPage";
import ProgressBar from "@/components/ProgressBar";
import LessonBlock from "@/components/LessonBlock";
import ExerciseBlock from "@/components/ExerciseBlock";
import QuizBlock from "@/components/QuizBlock";
import DayNavigation from "@/components/DayNavigation";
import HomeworkBlock from "@/components/HomeworkBlock";

export default function DayPage() {
  const params = useParams();
  const dayNum = Number(params.id);
  const dayData = getDayData(dayNum);
  const week = getWeekForDay(dayNum);
  const pos = getWeekDayIndex(dayNum);

  const [exerciseDone, setExerciseDone] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    const p = getProgress();
    if (p.exerciseCompleted[dayNum]) setExerciseDone(true);
    if (p.quizAnswers[dayNum]) setQuizDone(true);
    if (p.completedDays.includes(dayNum)) setShowOutput(true);
  }, [dayNum]);

  const handleExerciseComplete = useCallback(() => {
    setExerciseDone(true);
    markExerciseComplete(dayNum);
  }, [dayNum]);

  const handleQuizCorrect = useCallback(() => {
    setQuizDone(true);
    saveQuizAnswer(dayNum, "correct");
  }, [dayNum]);

  useEffect(() => {
    if (exerciseDone && quizDone && !showOutput) {
      setShowOutput(true);
      markDayComplete(dayNum);
    }
  }, [exerciseDone, quizDone, showOutput, dayNum]);

  if (!dayData || !week || !pos) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">Day not found</p>
      </div>
    );
  }

  const weekDays = week.days;
  const dayIndex = pos.dayIndex;
  const prevDay = dayIndex > 0 ? weekDays[dayIndex - 1].day : null;
  const nextDay = dayIndex < weekDays.length - 1 ? weekDays[dayIndex + 1].day : null;
  const isLastDayOfWeek = dayIndex === weekDays.length - 1;

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <AnimatedPage>
        <div className="max-w-2xl mx-auto px-6 py-12">
          <ProgressBar currentDay={dayNum} days={weekDays} />

          <h1 className="text-2xl font-semibold tracking-tight mb-8">
            Day {dayData.day}: {dayData.title}
          </h1>

          <div className="space-y-12">
            <motion.section
              initial={fadeUp.initial}
              animate={fadeUp.animate}
              transition={spring}
            >
              <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
                Scenario
              </h2>
              <div className="p-5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed italic">
                  {dayData.hook}
                </p>
              </div>
            </motion.section>

            <LessonBlock paragraphs={dayData.lesson} />

            <ExerciseBlock
              exercise={dayData.exercise}
              onComplete={handleExerciseComplete}
              initialDone={exerciseDone}
            />

            <QuizBlock quiz={dayData.quiz} onCorrect={handleQuizCorrect} initialDone={quizDone} />

            <AnimatePresence>
              {showOutput && (
                <motion.section
                  initial={fadeUp.initial}
                  animate={fadeUp.animate}
                  exit={fadeUp.exit}
                  transition={spring}
                  className="p-5 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <div>
                      <h2 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
                        Day {dayData.day} Complete
                      </h2>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {dayData.output}
                      </p>
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {showOutput && dayData.homework && dayData.homework.length > 0 && (
              <HomeworkBlock items={dayData.homework} />
            )}

            <DayNavigation
              completed={showOutput}
              prevDay={prevDay}
              nextDay={nextDay}
              completeHref={isLastDayOfWeek ? `/complete/${week.id}` : undefined}
            />
          </div>
        </div>
      </AnimatedPage>
    </main>
  );
}
