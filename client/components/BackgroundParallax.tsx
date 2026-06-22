import { Parallax } from "react-scroll-parallax";
import { motion } from "framer-motion";

export default function BackgroundParallax() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-50 overflow-hidden"
    >
      <Parallax speed={-20}>
        <motion.div
          className="absolute -left-40 -top-32 h-96 w-96 rounded-full bg-[hsl(var(--brand-secondary))/0.2] blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </Parallax>

      <Parallax speed={15}>
        <motion.div
          className="absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-[hsl(var(--brand-primary))/0.18] blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.18, 0.28, 0.18]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </Parallax>

      <Parallax speed={5}>
        <motion.div
          className="absolute top-1/3 left-1/2 h-80 w-80 rounded-full bg-[hsl(var(--brand-secondary))/0.12] blur-3xl"
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.12, 0.2, 0.12]
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
      </Parallax>

      <Parallax speed={-10}>
        <motion.div
          className="absolute -bottom-20 left-1/4 h-72 w-72 rounded-full bg-[hsl(var(--brand-primary))/0.14] blur-3xl"
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.14, 0.24, 0.14]
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </Parallax>

      <Parallax speed={8}>
        <motion.div
          className="absolute top-1/4 -right-20 h-64 w-64 rounded-full bg-[hsl(var(--brand-secondary))/0.15] blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        />
      </Parallax>
    </div>
  );
}
