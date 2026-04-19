"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { micro, spring, fadeUp, tapScale } from "@/lib/motion";

export default function DayNavigation({
  currentDay,
  completed,
}: {
  currentDay: number;
  completed: boolean;
}) {
  return (
    <motion.div
      className="flex items-center justify-between pt-8 border-t border-neutral-200 dark:border-neutral-800"
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      transition={spring}
    >
      {currentDay > 1 ? (
        <Link
          href={`/day/${currentDay - 1}`}
          className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          ← Day {currentDay - 1}
        </Link>
      ) : (
        <Link
          href="/"
          className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          ← Home
        </Link>
      )}
      {currentDay < 7 ? (
        completed ? (
          <motion.div whileTap={tapScale} transition={micro}>
            <Link
              href={`/day/${currentDay + 1}`}
              className="inline-block px-5 py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black rounded-lg text-sm font-medium"
            >
              Next Day →
            </Link>
          </motion.div>
        ) : (
          <span className="text-sm text-neutral-400">
            Complete the exercises to continue
          </span>
        )
      ) : completed ? (
        <motion.div whileTap={tapScale} transition={micro}>
          <Link
            href="/complete"
            className="inline-block px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium"
          >
            See Your Results →
          </Link>
        </motion.div>
      ) : (
        <span className="text-sm text-neutral-400">
          Complete the exercises to finish
        </span>
      )}
    </motion.div>
  );
}
