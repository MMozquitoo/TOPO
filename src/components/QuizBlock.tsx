"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quiz } from "@/data/week1";
import { micro, spring, shake, fadeUp, tapScale } from "@/lib/motion";

export default function QuizBlock({
  quiz,
  onCorrect,
}: {
  quiz: Quiz;
  onCorrect: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (label: string) => {
    if (submitted) return;
    setSelected(label);
    setSubmitted(true);
    if (label === quiz.correct) onCorrect();
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
          if (submitted) {
            if (isCorrectOption) {
              style = "border-green-500 bg-green-50 dark:bg-green-950";
            } else if (isSelected) {
              style = "border-red-500 bg-red-50 dark:bg-red-950";
            }
          }

          return (
            <motion.button
              key={opt.label}
              onClick={() => handleSelect(opt.label)}
              disabled={submitted}
              whileTap={!submitted ? tapScale : undefined}
              animate={
                submitted && isSelected && !isCorrectOption
                  ? { x: shake.x }
                  : submitted && isCorrectOption
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
        {submitted && (
          <motion.div
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            exit={fadeUp.exit}
            transition={spring}
            className={`p-4 rounded-lg text-sm border ${
              selected === quiz.correct
                ? "bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800"
            }`}
          >
            {selected === quiz.correct ? "Correct! " : "Not quite. "}
            {quiz.explanation}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
