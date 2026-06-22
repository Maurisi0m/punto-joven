import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface RotatingTextProps {
  texts: string[];
  interval?: number;
  className?: string;
  staggerDuration?: number;
}

export function RotatingText({ texts, interval = 3000, className, staggerDuration = 0.05 }: RotatingTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, interval);
    return () => clearInterval(timer);
  }, [texts, interval]);

  return (
    <span 
      className={cn(
        "inline-grid overflow-hidden rounded-xl bg-[hsl(var(--brand-primary))] text-white px-4 py-1.5 border border-[hsl(var(--brand-primary))/30] shadow-md align-middle mx-1", 
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={index}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={{
            visible: { 
              transition: { staggerChildren: staggerDuration } 
            },
            exit: { 
              opacity: 0,
              y: "-50%",
              filter: "blur(4px)",
              transition: { duration: 0.3 } 
            },
          }}
          className="col-start-1 row-start-1 flex whitespace-pre"
        >
          {texts[index].split("").map((char, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: { opacity: 0, y: "50%", filter: "blur(4px)" },
                visible: { 
                  opacity: 1, 
                  y: "0%", 
                  filter: "blur(0px)",
                  transition: { type: "spring", stiffness: 150, damping: 12 } 
                },
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
