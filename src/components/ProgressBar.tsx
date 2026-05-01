"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getProgress } from "@/lib/progress";
import { spring } from "@/lib/motion";

export default function ProgressBar({
  currentDay,
  days,
}: {
  currentDay: number;
  days: { day: number }[];
}) {
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    setCompleted(getProgress().completedDays);
  }, []);

  const total = days.length;
  const currentIndex = days.findIndex((d) => d.day === currentDay) + 1;
  const completedInWeek = days.filter((d) => completed.includes(d.day)).length;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-neutral-500">Day {currentIndex}/{total}</span>
        <span className="text-sm text-neutral-500">
          {completedInWeek}/{total} completed
        </span>
      </div>
      <div className="flex gap-1.5">
        {days.map((d) => (
          <div key={d.day} className="h-1.5 flex-1 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                completed.includes(d.day)
                  ? "bg-green-500"
                  : d.day === currentDay
                    ? "bg-neutral-800 dark:bg-neutral-200"
                    : ""
              }`}
              initial={{ width: "0%" }}
              animate={{
                width: completed.includes(d.day) || d.day === currentDay ? "100%" : "0%",
              }}
              transition={spring}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
