"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { week1 } from "@/data/week1";
import { getProgress } from "@/lib/progress";
import AnimatedPage from "@/components/AnimatedPage";
import AnimatedCard from "@/components/AnimatedCard";
import { motion } from "framer-motion";
import { micro, tapScale } from "@/lib/motion";

export default function Home() {
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    setCompleted(getProgress().completedDays);
  }, []);

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <AnimatedPage>
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="mb-12">
            <h1 className="text-3xl font-semibold tracking-tight mb-2">
              Cybersec Daily
            </h1>
            <p className="text-neutral-500">
              7 days. 7 skills. One concept at a time.
            </p>
          </div>

          <div className="space-y-3">
            {week1.map((day) => {
              const done = completed.includes(day.day);
              return (
                <AnimatedCard
                  key={day.day}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800"
                >
                  <Link
                    href={`/day/${day.day}`}
                    className="flex items-center gap-4 p-4 group"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                        done
                          ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                          : "bg-neutral-100 dark:bg-neutral-900 text-neutral-500"
                      }`}
                    >
                      {done ? "✓" : day.day}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-neutral-600 dark:group-hover:text-neutral-300">
                        {day.title}
                      </p>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        {day.output.replace("Today you learned how to ", "").replace("Today you learned ", "")}
                      </p>
                    </div>
                    <span className="text-neutral-300 dark:text-neutral-700 group-hover:text-neutral-500">
                      →
                    </span>
                  </Link>
                </AnimatedCard>
              );
            })}
          </div>

          {completed.length === 7 && (
            <div className="mt-8 text-center">
              <motion.div whileTap={tapScale} transition={micro} className="inline-block">
                <Link
                  href="/complete"
                  className="inline-block px-6 py-3 bg-green-600 text-white rounded-xl text-sm font-medium"
                >
                  View Your Week 1 Summary →
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </AnimatedPage>
    </main>
  );
}
