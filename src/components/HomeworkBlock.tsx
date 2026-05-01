"use client";

import { motion } from "framer-motion";
import { Homework } from "@/lib/types";
import { spring, fadeUp, staggerContainer, staggerItem } from "@/lib/motion";

export default function HomeworkBlock({ items }: { items: Homework[] }) {
  return (
    <motion.section
      className="space-y-4"
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      transition={spring}
    >
      <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
        Homework
      </h2>
      <motion.div
        className="space-y-3"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {items.map((hw) => (
          <motion.a
            key={hw.url}
            href={hw.url}
            target="_blank"
            rel="noopener noreferrer"
            variants={staggerItem}
            className="block p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors group"
          >
            <p className="text-sm font-medium group-hover:text-neutral-600 dark:group-hover:text-neutral-300">
              {hw.title} <span className="text-neutral-400">↗</span>
            </p>
            <p className="text-xs text-neutral-500 mt-1">{hw.description}</p>
          </motion.a>
        ))}
      </motion.div>
    </motion.section>
  );
}
