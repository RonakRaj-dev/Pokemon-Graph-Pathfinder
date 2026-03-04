"use client"

/**
 * React-bits-inspired animated text components.
 * SplitText — animates word by word with stagger
 * BlurText  — fades in with blur effect
 * GlitchText — brief scramble/glitch before reveal
 */

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState, useMemo } from "react";

// ─── SplitText ──────────────────────────────────────────────────────────────

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  splitBy?: "word" | "char";
}

export const SplitText = ({
  text,
  className = "",
  delay = 0,
  staggerDelay = 0.05,
  splitBy = "word",
}: SplitTextProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const parts = splitBy === "word" ? text.split(" ") : text.split("");

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {parts.map((part, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={
            isInView
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: 20, filter: "blur(4px)" }
          }
          transition={{
            duration: 0.4,
            delay: delay + i * staggerDelay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {part}
          {splitBy === "word" && i < parts.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </span>
  );
};

// ─── BlurText ───────────────────────────────────────────────────────────────

interface BlurTextProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export const BlurText = ({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
}: BlurTextProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, filter: "blur(12px)", y: 15 }}
      animate={
        isInView
          ? { opacity: 1, filter: "blur(0px)", y: 0 }
          : { opacity: 0, filter: "blur(12px)", y: 15 }
      }
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

// ─── GlitchText ─────────────────────────────────────────────────────────────

interface GlitchTextProps {
  text: string;
  className?: string;
  delay?: number;
  glitchDuration?: number;
}

const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

export const GlitchText = ({
  text,
  className = "",
  delay = 0,
  glitchDuration = 800,
}: GlitchTextProps) => {
  const [display, setDisplay] = useState("");
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView || started) return;

    const timer = setTimeout(() => {
      setStarted(true);
      const chars = text.split("");
      let iteration = 0;
      const totalIterations = Math.ceil(glitchDuration / 30);

      const interval = setInterval(() => {
        setDisplay(
          chars
            .map((char, idx) => {
              if (char === " ") return " ";
              if (idx < (iteration / totalIterations) * chars.length) return char;
              return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
            })
            .join("")
        );

        iteration++;
        if (iteration > totalIterations) {
          clearInterval(interval);
          setDisplay(text);
        }
      }, 30);

      return () => clearInterval(interval);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [isInView, started, text, delay, glitchDuration]);

  return (
    <span ref={ref} className={className}>
      {display || "\u00A0".repeat(text.length)}
    </span>
  );
};

// ─── FadeSlideIn ────────────────────────────────────────────────────────────

interface FadeSlideInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
}

export const FadeSlideIn = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.6,
}: FadeSlideInProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  const directionMap = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
  };

  const offset = directionMap[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, x: offset.x, y: offset.y }
      }
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
};

// ─── StaggerContainer ───────────────────────────────────────────────────────

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delay?: number;
}

export const StaggerContainer = ({
  children,
  className = "",
  staggerDelay = 0.1,
  delay = 0,
}: StaggerContainerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
        },
      }}
    >
      {children}
    </motion.div>
  );
};
