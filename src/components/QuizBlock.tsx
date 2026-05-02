"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quiz } from "@/lib/types";
import { micro, spring, shake, fadeUp, tapScale } from "@/lib/motion";

export default function QuizBlock({
  quiz,
  onCorrect,
  initialDone = false,
}: {
  quiz: Quiz;
  onCorrect: () => void;
  initialDone?: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (initialDone) {
      setCorrect(true);
      setSelected(quiz.correct);
      setShowFeedback(true);
    }
  }, [initialDone, quiz.correct]);

  const handleSelect = (label: string) => {
    if (correct) return;
    setSelected(label);
    setShowFeedback(true);
    if (label === quiz.correct) {
      setCorrect(true);
      onCorrect();
    }
  };

  return (
    <motion.section
      className="space-y-4"
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      transition={spring}
    >
      <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
        Quiz
      </h2>
      <p className="text-neutral-700 dark:text-neutral-300 font-medium">
        {quiz.question}
      </p>
      <div className="space-y-2">
        {quiz.options.map((opt) => {
          const isCorrectOption = opt.label === quiz.correct;
          const isSelected = opt.label === selected;
          let style = "border-neutral-200 dark:border-neutral-800";
          if (showFeedback && isSelected) {
            if (isCorrectOption) {
              style = "border-green-500 bg-green-50 dark:bg-green-950";
            } else {
              style = "border-red-500 bg-red-50 dark:bg-red-950";
            }
          } else if (correct && isCorrectOption) {
            style = "border-green-500 bg-green-50 dark:bg-green-950";
          }

          return (
            <motion.button
              key={opt.label}
              onClick={() => handleSelect(opt.label)}
              disabled={correct}
              whileTap={!correct ? tapScale : undefined}
              animate={
                showFeedback && isSelected && !isCorrectOption
                  ? { x: shake.x }
                  : showFeedback && isSelected && isCorrectOption
                    ? { backgroundColor: ["rgba(34,197,94,0.2)", "rgba(34,197,94,0)", "rgba(34,197,94,0)"] }
                    : {}
              }
              transition={micro}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm ${style} disabled:cursor-default`}
            >
              <span className="font-semibold">{opt.label}.</span> {opt.value}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            key={selected}
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            exit={fadeUp.exit}
            transition={spring}
            className={`p-4 rounded-lg text-sm border ${
              selected === quiz.correct
                ? "bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800"
                : "bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800"
            }`}
          >
            {selected === quiz.correct ? "Correct! " : "Try again! "}
            {selected === quiz.correct ? quiz.explanation : "That's not right — pick another option."}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
