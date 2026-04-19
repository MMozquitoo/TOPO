"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

export default function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      exit={fadeUp.exit}
      transition={fadeUp.transition}
    >
      {children}
    </motion.div>
  );
}
