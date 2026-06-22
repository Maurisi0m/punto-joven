import { motion } from "framer-motion";
import { ArrowRight, Sparkles, IdCard, Wallet, Zap, Building2, Rocket } from "lucide-react";

export function AnimatedBentoButtons() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const features = [
    {
      title: "Identidad Digital",
      description: "Tu credencial segura en el móvil",
      icon: IdCard,
      className: "lg:col-span-1 lg:row-span-2",
    },
    {
      title: "Descuentos Reales",
      description: "Hasta 30% en comercios aliados",
      icon: Wallet,
      className: "lg:col-span-1",
    },
    {
      title: "Validación Rápida",
      description: "QR instantáneo en segundos",
      icon: Zap,
      className: "lg:col-span-1",
    },
    {
      title: "Comunidad Pachuca",
      description: "Conectado con tu ciudad",
      icon: Building2,
      className: "lg:col-span-1",
    },
    {
      title: "Oportunidades",
      description: "Crece con nosotros",
      icon: Rocket,
      className: "lg:col-span-2",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      className="grid w-full gap-4 md:gap-6 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 lg:grid-rows-3"
    >
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          variants={itemVariants}
          className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/70 to-white/50 dark:from-slate-800/70 dark:to-slate-900/50 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 ${feature.className}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--brand-primary))]/5 to-[hsl(var(--brand-secondary))]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-[hsl(var(--brand-primary))]/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-[hsl(var(--brand-secondary))]/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.1 + index * 0.05 }}
              className="mb-4 inline-block"
            >
              <feature.icon className="h-12 w-12 md:h-16 md:w-16 text-[hsl(var(--brand-primary))]" />
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className="text-lg md:text-xl font-bold text-foreground group-hover:text-[hsl(var(--brand-primary))] transition-colors duration-300"
            >
              {feature.title}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="text-sm md:text-base text-muted-foreground mt-2 group-hover:text-foreground transition-colors duration-300"
            >
              {feature.description}
            </motion.p>
          </div>

          <div className="absolute bottom-0 right-0 w-0 h-0 group-hover:w-12 group-hover:h-12 bg-[hsl(var(--brand-primary))]/10 transition-all duration-500 rounded-full blur-xl" />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function AnimatedCTAButtons() {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <motion.a
        href="/registro"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="relative group inline-flex items-center justify-center rounded-2xl border border-white/20 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-[hsl(var(--brand-primary))]/30 transition-all overflow-hidden"
      >
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1517602302552-471fe67acf66?q=80&w=2000&auto=format&fit=crop"
            alt="Button Background"
            className="h-full w-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--brand-primary))]/90 to-[hsl(var(--brand-secondary))]/80" />
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[hsl(var(--brand-secondary))]/0 via-white/20 to-[hsl(var(--brand-secondary))]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <span className="relative z-10 flex items-center gap-2">
          <motion.span
            initial={{ x: 0 }}
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Registrarme
          </motion.span>
          <motion.span
            initial={{ rotate: 0 }}
            whileHover={{ rotate: 20, x: 4 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Sparkles className="h-5 w-5" />
          </motion.span>
        </span>
      </motion.a>

      <motion.a
        href="#sobre"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="relative group inline-flex items-center justify-center rounded-2xl border-2 border-[hsl(var(--brand-primary))] bg-white/10 dark:bg-slate-900/30 px-8 py-4 text-base font-semibold text-foreground backdrop-blur-xl transition-all overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--brand-primary))]/10 to-[hsl(var(--brand-secondary))]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="relative flex items-center gap-2">
          <motion.span
            initial={{ x: 0 }}
            whileHover={{ x: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Conocer más
          </motion.span>
          <motion.span
            initial={{ x: 0 }}
            whileHover={{ x: 6 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <ArrowRight className="h-5 w-5" />
          </motion.span>
        </span>
      </motion.a>
    </div>
  );
}
