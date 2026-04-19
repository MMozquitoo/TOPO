"use client";

import { motion } from "framer-motion";
import { spring, cardHover, tapScale, fadeUp } from "@/lib/motion";

export default function AnimatedCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      whileHover={cardHover}
      whileTap={tapScale}
      transition={spring}
      className={className}
    >
      {children}
    </motion.div>
  );
}
