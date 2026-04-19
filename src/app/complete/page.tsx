"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getProgress } from "@/lib/progress";
import { week1 } from "@/data/week1";
import AnimatedPage from "@/components/AnimatedPage";
import { micro, spring, fadeUp, staggerContainer, staggerItem, tapScale } from "@/lib/motion";

const skills = [
  "Phishing URL Detection",
  "Social Engineering Defense",
  "Password Hashing & Salting",
  "TLS Certificate Analysis",
  "Terminal Navigation",
  "Network Reconnaissance",
  "Firewall Configuration",
];

export default function CompletePage() {
  const [progress, setProgress] = useState<number[]>([]);

  useEffect(() => {
    setProgress(getProgress().completedDays);
  }, []);

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
            <div className="text-6xl mb-6">🛡️</div>
            <h1 className="text-3xl font-semibold tracking-tight mb-3">
              You Survived the Week
            </h1>
            <p className="text-neutral-500">
              {progress.length}/7 days completed
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
              {skills.map((skill, i) => {
                const unlocked = progress.includes(i + 1);
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
                    <span className="text-xs text-neutral-400 ml-auto">Day {i + 1}</span>
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
              {week1.map((day) => (
                <div key={day.day} className="text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    Day {day.day}:
                  </span>{" "}
                  {day.output
                    .replace("Today you learned how to ", "")
                    .replace("Today you learned ", "")
                    .replace("You survived the week! You've unlocked 7 essential cybersecurity skills: ", "")}
                </div>
              ))}
            </div>
          </motion.div>

          <div className="text-center space-y-4">
            <p className="text-sm text-neutral-500">
              Week 2 coming soon — Network Attacks, Encryption, and Incident Response.
            </p>
            <motion.div whileTap={tapScale} transition={micro} className="inline-block">
              <Link
                href="/"
                className="inline-block px-5 py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black rounded-lg text-sm font-medium"
              >
                Back to Home
              </Link>
            </motion.div>
          </div>
        </div>
      </AnimatedPage>
    </main>
  );
}
