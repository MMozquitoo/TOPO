export const spring = { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const };
export const micro = { duration: 0.15, ease: [0.22, 1, 0.36, 1] as const };

export const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: spring,
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

export const staggerItem = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0, transition: micro },
};

export const shake = {
  x: [-6, 6, -4, 4, 0],
  transition: micro,
};

export const cardHover = { y: -2 };
export const tapScale = { scale: 0.97 };
