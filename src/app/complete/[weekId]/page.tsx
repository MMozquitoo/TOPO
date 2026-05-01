"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getProgress } from "@/lib/progress";
import { weeks } from "@/lib/curriculum";
import AnimatedPage from "@/components/AnimatedPage";
import { micro, spring, fadeUp, staggerContainer, staggerItem, tapScale } from "@/lib/motion";

export default function WeekCompletePage() {
  const params = useParams();
  const weekId = Number(params.weekId);
  const week = weeks.find((w) => w.id === weekId);
  const nextWeek = weeks.find((w) => w.id === weekId + 1);

  const [progress, setProgress] = useState<number[]>([]);

  useEffect(() => {
    setProgress(getProgress().completedDays);
  }, []);

  if (!week) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">Week not found</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <AnimatedPage>
        <div className="max-w-2xl mx-auto px-6 py-16">
          <motion.div
            className="text-center mb-12"
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            transition={spring}
          >
            <div className="text-6xl mb-6">
              {weekId === 1 && "🛡️"}
              {weekId === 2 && "🔧"}
              {weekId === 3 && "🖥️"}
              {weekId === 4 && "🔬"}
              {weekId === 5 && "💥"}
              {weekId === 6 && "🎯"}
              {weekId === 7 && "📡"}
              {weekId === 8 && "🏆"}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight mb-3">
              {weekId === 1 && "You Survived the Week"}
              {weekId === 2 && "Hardware Hacker Unlocked"}
              {weekId === 3 && "Emulation Master"}
              {weekId === 4 && "Reverse Engineer Awakened"}
              {weekId === 5 && "Fuzzing Fury Unleashed"}
              {weekId === 6 && "Exploit Developer Online"}
              {weekId === 7 && "Wireless Warrior Mode"}
              {weekId === 8 && "Certified Security Researcher"}
            </h1>
            <p className="text-neutral-500">
              Week {weekId}: {week.title} — {progress.filter((d) => week.days.some((wd) => wd.day === d)).length}/{week.days.length} days completed
            </p>
          </motion.div>

          <div className="mb-12">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4">
              Skills Unlocked
            </h2>
            <motion.div
              className="space-y-2"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {week.skills.map((skill, i) => {
                const dayNum = week.days[i]?.day;
                const unlocked = dayNum !== undefined && progress.includes(dayNum);
                return (
                  <motion.div
                    key={skill}
                    variants={staggerItem}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      unlocked
                        ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950"
                        : "border-neutral-200 dark:border-neutral-800 opacity-40"
                    }`}
                  >
                    <span className={`text-sm ${unlocked ? "text-green-600" : "text-neutral-400"}`}>
                      {unlocked ? "✓" : "○"}
                    </span>
                    <span className="text-sm font-medium">{skill}</span>
                    <span className="text-xs text-neutral-400 ml-auto">Day {dayNum}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          <motion.div
            className="mb-12"
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            transition={spring}
          >
            <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4">
              Week Summary
            </h2>
            <div className="space-y-3">
              {week.days.map((day) => (
                <div key={day.day} className="text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    Day {day.day}:
                  </span>{" "}
                  {day.output
                    .replace(/^Today you learned (how to )?/i, "")
                    .replace(/^You (survived|completed).*?:\s*/i, "")
                    .replace(/^You now know /i, "")
                    .replace(/^Week \d+ complete.*?[.!]\s*/i, "")}
                </div>
              ))}
            </div>
          </motion.div>

          {weekId === 8 && (
            <motion.div
              className="mb-12 p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800 text-center"
              initial={fadeUp.initial}
              animate={fadeUp.animate}
              transition={spring}
            >
              <p className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                8 Weeks. 56 Days. One Complete Journey.
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                You&apos;ve gone from phishing awareness to professional firmware exploitation.
                You can now extract, emulate, reverse-engineer, fuzz, and exploit embedded devices.
                The Resource Library has 150+ curated links to continue your research.
              </p>
            </motion.div>
          )}

          <div className="text-center space-y-4">
            {nextWeek ? (
              <p className="text-sm text-neutral-500">
                Ready for Week {nextWeek.id}? {nextWeek.title} awaits.
              </p>
            ) : (
              <p className="text-sm text-neutral-500">
                You&apos;ve completed the full program. Explore the Resource Library to deepen your expertise.
              </p>
            )}
            <div className="flex justify-center gap-3">
              <motion.div whileTap={tapScale} transition={micro} className="inline-block">
                <Link
                  href="/"
                  className="inline-block px-5 py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black rounded-lg text-sm font-medium"
                >
                  Back to Home
                </Link>
              </motion.div>
              <motion.div whileTap={tapScale} transition={micro} className="inline-block">
                <Link
                  href="/resources"
                  className="inline-block px-5 py-2.5 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm font-medium"
                >
                  Resource Library
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </AnimatedPage>
    </main>
  );
}
