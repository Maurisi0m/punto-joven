import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

export default function CinematicIntro() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Background zoom-in effect (slow scale from 1 to 1.1)
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  // Title scale animation (subtle scale-in from 0.8 to 1)
  const titleScale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);

  // Title opacity for smooth entrance
  const titleOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  // Snap to hero when title is fully revealed
  const hasSnappedRef = useRef(false);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest >= 0.5 && !hasSnappedRef.current) {
        hasSnappedRef.current = true;
        const lenis = (window as any).lenis as
          | { scrollTo: (t: any, o?: any) => void }
          | undefined;
        if (!lenis) return;

        const hero = document.getElementById("hero");
        if (!hero) return;

        lenis.scrollTo(hero, {
          offset: -1,
          duration: 1.2,
          easing: (t: number) => 1 - Math.pow(1 - t, 3), // Cubic ease-out for cinematic feel
        });
      }
    });

    return unsubscribe;
  }, [scrollYProgress]);

  return (
    <section ref={ref} className="relative h-[165vh] overflow-hidden">
      {/* Full-screen background with zoom effect */}
      <motion.div
        style={{ scale: bgScale }}
        className="absolute inset-0 -z-10"
      >
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2Fce1f4688001c4a1985ce4f6d708c72b7%2F8ee76b000caf49e89233ef44603d4e89?format=webp&width=2000"
          alt="Pachuca Centro"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--brand-primary))/0.3] via-background/0.2 to-[hsl(var(--brand-secondary))/0.3]" />
      </motion.div>

      {/* Centered content with subtle scaling */}
      <div className="flex h-full items-center justify-center px-6 text-center">
        <motion.div
          style={{ scale: titleScale, opacity: titleOpacity }}
          className="space-y-6 mt-20 max-w-4xl"
        >
          <p className="text-sm font-semibold tracking-widest text-white/80">
            PROGRAMA JUVENIL PACHUCA
          </p>
          <h1 className="font-display text-[12vw] leading-[0.85] font-extrabold uppercase tracking-tight text-white sm:text-[10vw] lg:text-[8vw]">
            Punto
            <br />
            Joven
          </h1>
          <p className="mx-auto max-w-2xl text-base text-white/90">
            Beneficios reales, identidad y alianzas con comercios locales.
            Desplázate para explorar.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
