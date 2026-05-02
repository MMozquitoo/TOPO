"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { weeks } from "@/lib/curriculum";
import { getProgress, exportProgress, importProgress } from "@/lib/progress";
import AnimatedPage from "@/components/AnimatedPage";
import AnimatedCard from "@/components/AnimatedCard";
import { motion } from "framer-motion";
import { micro, tapScale, fadeUp, spring } from "@/lib/motion";

export default function Home() {
  const [completed, setCompleted] = useState<number[]>([]);
  const [syncOpen, setSyncOpen] = useState(false);
  const [syncCode, setSyncCode] = useState("");
  const [importCode, setImportCode] = useState("");
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");

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
              Master cybersecurity. One concept at a time.
            </p>
          </div>

          <div className="space-y-12">
            {weeks.map((week, wi) => {
              const prevWeek = wi > 0 ? weeks[wi - 1] : null;
              const prevWeekComplete = prevWeek
                ? prevWeek.days.every((d) => completed.includes(d.day))
                : true;
              const weekComplete = week.days.every((d) => completed.includes(d.day));
              const locked = !prevWeekComplete;

              return (
                <motion.section
                  key={week.id}
                  initial={fadeUp.initial}
                  animate={fadeUp.animate}
                  transition={{ ...spring, delay: wi * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight">
                        Week {week.id}: {week.title}
                      </h2>
                      <p className="text-sm text-neutral-500">{week.subtitle}</p>
                    </div>
                    {weekComplete && (
                      <span className="text-xs font-medium text-green-600 dark:text-green-400 px-2 py-1 rounded-full bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                        Complete
                      </span>
                    )}
                    {locked && (
                      <span className="text-xs font-medium text-neutral-400 px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        Locked
                      </span>
                    )}
                  </div>

                  <div className={`space-y-3 ${locked ? "opacity-50 pointer-events-none" : ""}`}>
                    {week.days.map((day) => {
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
                                {day.output.replace("Today you learned how to ", "").replace("Today you learned ", "").replace("You completed Week 2! You now know ", "")}
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

                  {weekComplete && (
                    <div className="mt-4 text-center">
                      <motion.div whileTap={tapScale} transition={micro} className="inline-block">
                        <Link
                          href={`/complete/${week.id}`}
                          className="inline-block px-6 py-3 bg-green-600 text-white rounded-xl text-sm font-medium"
                        >
                          View Week {week.id} Summary →
                        </Link>
                      </motion.div>
                    </div>
                  )}
                </motion.section>
              );
            })}
          </div>

          <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800">
            <div className="text-center mb-6">
              <Link
                href="/resources"
                className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                Browse the Resource Library →
              </Link>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setSyncOpen(!syncOpen);
                  if (!syncOpen) setSyncCode(exportProgress());
                  setImportStatus("idle");
                }}
                className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              >
                {syncOpen ? "Close" : "Sync progress between devices"}
              </button>

              {syncOpen && (
                <motion.div
                  initial={fadeUp.initial}
                  animate={fadeUp.animate}
                  transition={spring}
                  className="mt-4 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-left space-y-4"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                      Export from this device
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={syncCode}
                        className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-mono outline-none truncate"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(syncCode)}
                        className="px-3 py-2 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-xs font-medium shrink-0"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                      Import from another device
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={importCode}
                        onChange={(e) => { setImportCode(e.target.value); setImportStatus("idle"); }}
                        placeholder="Paste code here"
                        className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent text-xs font-mono outline-none"
                      />
                      <button
                        onClick={() => {
                          if (importProgress(importCode.trim())) {
                            setImportStatus("success");
                            setCompleted(getProgress().completedDays);
                            setSyncCode(exportProgress());
                            setImportCode("");
                          } else {
                            setImportStatus("error");
                          }
                        }}
                        className="px-3 py-2 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-xs font-medium shrink-0"
                      >
                        Import
                      </button>
                    </div>
                    {importStatus === "success" && (
                      <p className="text-xs text-green-600 mt-1">Progress merged successfully.</p>
                    )}
                    {importStatus === "error" && (
                      <p className="text-xs text-red-500 mt-1">Invalid code. Copy the full code from the other device.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </AnimatedPage>
    </main>
  );
}
