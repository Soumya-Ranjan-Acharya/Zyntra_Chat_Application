/**
 * Zyntra Motion Design System
 * Centralized animation presets for Framer Motion
 */

export const spring = {
  type: 'spring',
  stiffness: 420,
  damping: 32,
};

export const springGentle = {
  type: 'spring',
  stiffness: 220,
  damping: 26,
};

export const springBouncy = {
  type: 'spring',
  stiffness: 500,
  damping: 28,
};

export const ease = {
  duration: 0.2,
  ease: [0.23, 1, 0.32, 1],
};

export const easeSlow = {
  duration: 0.35,
  ease: [0.23, 1, 0.32, 1],
};

// ---- Page / Container Variants ----
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
  transition: ease,
};

export const slideUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
  transition: ease,
};

export const slideDown = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: 10 },
  transition: ease,
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.94 },
  animate: { opacity: 1, scale: 1 },
  exit:    { opacity: 0, scale: 0.94 },
  transition: spring,
};

// ---- List Stagger Variants ----
export const listContainer = {
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

export const listItem = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 },
  transition: ease,
};

// ---- Message Bubble ----
export const messageBubble = {
  initial: { opacity: 0, y: 8, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] },
};

// ---- Dropdown / Popover ----
export const dropdownIn = {
  initial: { opacity: 0, scale: 0.95, y: -6 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit:    { opacity: 0, scale: 0.95, y: -6 },
  transition: spring,
};

// ---- Hover helpers (use directly on motion.div) ----
export const hoverLift = {
  whileHover: { y: -1, transition: { duration: 0.15 } },
  whileTap:   { scale: 0.97, transition: { duration: 0.08 } },
};

export const hoverScale = {
  whileHover: { scale: 1.03, transition: { duration: 0.15 } },
  whileTap:   { scale: 0.95, transition: { duration: 0.08 } },
};

export const buttonPress = {
  whileHover: { scale: 1.02 },
  whileTap:   { scale: 0.95 },
  transition:  spring,
};
