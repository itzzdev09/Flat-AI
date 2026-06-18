import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const pageMotion = {
  initial: { opacity: 0, y: 18, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -10, filter: 'blur(10px)' },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

export const sectionMotion = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  viewport: { once: true, amount: 0.22 },
};

export const staggerMotion = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};

export const cardMotion = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  viewport: { once: true, amount: 0.2 },
};

export const MotionSection = ({ children, className = '', ...props }) => {
  const reducedMotion = useReducedMotion();
  const motionProps = reducedMotion
    ? { initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
    : sectionMotion;

  return (
    <motion.section className={className} {...motionProps} {...props}>
      {children}
    </motion.section>
  );
};

