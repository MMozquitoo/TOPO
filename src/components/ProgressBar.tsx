"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getProgress } from "@/lib/progress";
import { spring } from "@/lib/motion";

export default function ProgressBar({ currentDay }: { currentDay: number }) {
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    setCompleted(getProgress().completedDays);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-neutral-500">Day {currentDay}/7</span>
        <span className="text-sm text-neutral-500">
          {completed.length}/7 completed
        </span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => (
          <div key={day} className="h-1.5 flex-1 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                completed.includes(day)
                  ? "bg-green-500"
                  : day === currentDay
                    ? "bg-neutral-800 dark:bg-neutral-200"
                    : ""
              }`}
              initial={{ width: "0%" }}
              animate={{
                width: completed.includes(day) || day === currentDay ? "100%" : "0%",
              }}
              transition={spring}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
