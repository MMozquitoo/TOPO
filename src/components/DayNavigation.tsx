"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { micro, spring, fadeUp, tapScale } from "@/lib/motion";

export default function DayNavigation({
  completed,
  prevDay,
  nextDay,
  completeHref,
}: {
  completed: boolean;
  prevDay: number | null;
  nextDay: number | null;
  completeHref?: string;
}) {
  return (
    <motion.div
      className="flex items-center justify-between pt-8 border-t border-neutral-200 dark:border-neutral-800"
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      transition={spring}
    >
      {prevDay !== null ? (
        <Link
          href={`/day/${prevDay}`}
          className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          ← Day {prevDay}
        </Link>
      ) : (
        <Link
          href="/"
          className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          ← Home
        </Link>
      )}
      {nextDay !== null ? (
        completed ? (
          <motion.div whileTap={tapScale} transition={micro}>
            <Link
              href={`/day/${nextDay}`}
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
            href={completeHref || "/complete"}
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
