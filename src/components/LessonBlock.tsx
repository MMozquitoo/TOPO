"use client";

import { motion } from "framer-motion";
import { spring, fadeUp, staggerContainer, staggerItem } from "@/lib/motion";

export default function LessonBlock({ paragraphs }: { paragraphs: string[] }) {
  return (
    <motion.section
      className="space-y-4"
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      transition={spring}
    >
      <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
        Lesson
      </h2>
      <motion.div
        className="space-y-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {paragraphs.map((p, i) => (
          <motion.p
            key={i}
            variants={staggerItem}
            className="text-neutral-700 dark:text-neutral-300 leading-relaxed"
          >
            {p}
          </motion.p>
        ))}
      </motion.div>
    </motion.section>
  );
}
