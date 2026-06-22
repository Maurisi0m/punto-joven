import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import StatsCounter from "@/components/StatsCounter";
import FAQAccordion from "@/components/FAQAccordion";
import { DigitalIDCard, type Beneficiary } from "@/components/DigitalIDCard";
import { AnimatedBentoButtons, AnimatedCTAButtons } from "@/components/AnimatedBentoButtons";
import ScrollFloat from "@/components/ScrollFloat";
import { RotatingText } from "@/components/motion/RotatingText";
import { LOGO_URL } from "@/lib/constants";
import {
  ArrowRight,
  Building2,
  CreditCard,
  HeartHandshake,
  IdCard,
  Landmark,
  MapPin,
  Percent,
  School,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Users,
  Briefcase,
  Link2,
  Target,
  Eye,
} from "lucide-react";

import { QRCodeCanvas } from "qrcode.react";

function DemoDigitalCard() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => (prev + 1) % 3);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const demo = {
    token: "BJ-2025-01732",
    nombre: "María Fernanda López",
    curp: "LOFM010101HDFRRS09",
    email: "maria.fernanda@example.com",
    fotoDataUrl: undefined,
  };

  const variants = {
    normal: { width: 460, height: 440, borderRadius: 28 },
    vertical: { width: 320, height: 580, borderRadius: 36 },
    horizontal: { width: 560, height: 320, borderRadius: 24 },
  };

  const isVertical = phase === 1;
  const isHorizontal = phase === 2;

  return (
    <div className="relative min-h-[600px] flex items-center justify-center p-4">
      {/* Decorative glow behind */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-64 h-64 bg-[hsl(var(--brand-primary))] rounded-full blur-[80px]"
      />

      <motion.div
        layout
        initial="normal"
        animate={phase === 0 ? "normal" : phase === 1 ? "vertical" : "horizontal"}
        variants={variants}
        transition={{ type: "spring", stiffness: 120, damping: 14, mass: 1.1 }}
        style={{ transformOrigin: "center" }}
        className="relative bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] p-[2px] shadow-[0_20px_60px_-20px_rgba(136,22,62,0.5)] overflow-hidden flex flex-col z-10"
      >
        <motion.div
          layout
          className="relative w-full h-full bg-white/70 backdrop-blur-xl border border-white/20 pt-5 px-5 sm:pt-6 sm:px-6 flex flex-col justify-between"
          style={{ borderRadius: "inherit" }}
        >
          {/* Header */}
          <motion.div layout className={`flex items-center ${isVertical ? 'flex-col text-center gap-2' : 'justify-between'}`}>
            <motion.div layout className="flex items-center gap-2">
              <motion.img layout src={LOGO_URL} alt="Logo" className="h-8 w-auto mix-blend-multiply" />
              <motion.div layout>
                <motion.h3 layout className="font-bold text-sm tracking-tight leading-none text-gray-900">Punto Joven</motion.h3>
                <motion.p layout className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">Pachuca</motion.p>
              </motion.div>
            </motion.div>
            <motion.span layout className="text-[10px] font-bold text-[hsl(var(--brand-secondary))] bg-[hsl(var(--brand-secondary))]/10 px-2 py-0.5 rounded-full">2026-2027</motion.span>
          </motion.div>

          {/* User Data */}
          <motion.div layout className={`flex ${isVertical ? 'flex-col items-center text-center gap-4' : 'gap-5 items-center my-4'}`}>
            <motion.div layout className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-2 border-[hsl(var(--brand-primary))/20] overflow-hidden bg-white/50 flex-shrink-0 grid place-items-center shadow-inner">
               <motion.span layout className="font-bold text-[10px] uppercase text-muted-foreground">FOTO</motion.span>
            </motion.div>
            <motion.div layout className="flex-1 min-w-0 grid grid-cols-1 gap-1">
              <motion.div layout>
                <motion.p layout className="text-[10px] uppercase text-muted-foreground font-semibold">Beneficiario</motion.p>
                <motion.p layout className="font-bold leading-tight truncate text-[15px] sm:text-base text-gray-900">{demo.nombre}</motion.p>
              </motion.div>
              
              <motion.div layout className={`flex ${isHorizontal ? 'gap-4': 'flex-col gap-1'} pt-1`}>
                <motion.div layout>
                  <motion.p layout className="text-[10px] uppercase text-muted-foreground font-semibold">CURP</motion.p>
                  <motion.p layout className="font-mono text-[11px] sm:text-xs tracking-tight text-gray-700">{demo.curp}</motion.p>
                </motion.div>
                <motion.div layout>
                  <motion.p layout className="text-[10px] uppercase text-muted-foreground font-semibold">Correo</motion.p>
                  <motion.p layout className="text-[11px] sm:text-xs truncate text-gray-700">{demo.email}</motion.p>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Footer QR */}
          <motion.div layout className={`flex items-center ${isVertical ? 'flex-col text-center gap-3' : 'justify-between'}`}>
             <motion.div layout className="flex-1 order-2 sm:order-1">
                <motion.p layout className="text-[10px] uppercase text-muted-foreground font-semibold">Folio Autorizado</motion.p>
                <motion.p layout className="font-mono text-xs font-bold text-[hsl(var(--brand-primary))] leading-tight">{demo.token}</motion.p>
                <motion.p layout className="text-[9px] text-muted-foreground mt-1 max-w-[200px] leading-tight">Presenta este código para validar tu beneficio.</motion.p>
             </motion.div>
             <motion.div layout className="order-1 sm:order-2 h-14 w-14 sm:h-16 sm:w-16 bg-white p-1.5 rounded-xl shadow-md border flex-shrink-0 grid place-items-center">
                 <QRCodeCanvas value={"test"} size={48} level="L" />
             </motion.div>
          </motion.div>

          {/* Solid base footer full width */}
          <motion.div layout className="bg-[hsl(var(--brand-primary))] px-4 py-2.5 text-center text-[10px] sm:text-xs font-semibold tracking-wide text-white mt-4 -mx-5 sm:-mx-6 rounded-b-2xl sm:rounded-b-3xl">
            Beneficios y descuentos para la juventud de Pachuca
          </motion.div>

        </motion.div>
      </motion.div>
    </div>
  );
}

import CinematicIntro from "@/components/sections/CinematicIntro";

const heroLines = ["Jóvenes con", "Impulso y", "Beneficios"];

function HeroTitle() {
  const container: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  };

  const line: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 32 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <motion.h1
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.7 }}
      className="font-display uppercase font-extrabold leading-[0.9] text-6xl sm:text-7xl lg:text-[128px] tracking-tighter"
    >
      {heroLines.map((lineText) => (
        <motion.span
          key={lineText}
          variants={line}
          className="block bg-gradient-to-r from-[hsl(var(--brand-primary))] via-foreground to-[hsl(var(--brand-secondary))] bg-clip-text text-transparent"
        >
          {lineText}
        </motion.span>
      ))}
    </motion.h1>
  );
}



export default function Index() {

  const objetivos = [
    {
      icon: School,
      title: "Acceso a servicios",
      desc: "Acercar a jóvenes a servicios educativos, culturales, recreativos y de salud con tarifas preferenciales.",
      bullets: [
        "Becas y apoyos en cursos y certificaciones locales",
        "Entradas con precio preferente a museos y actividades culturales",
        "Promociones en clínicas y servicios de bienestar",
      ],
    },
    {
      icon: HeartHandshake,
      title: "Consumo responsable",
      desc: "Fomentar prácticas de compra informadas y educación financiera en la juventud.",
      bullets: [
        "Tips de finanzas personales y uso responsable de descuentos",
        "Transparencia en términos y condiciones de las promociones",
        "Impulso al ahorro con convenios especiales",
      ],
    },
    {
      icon: Store,
      title: "Vínculo con comercios",
      desc: "Fortalecer la relación entre jóvenes y negocios locales mediante alianzas.",
      bullets: [
        "Red de comercios verificados que aceptan la credencial",
        "Validación rápida con QR y control de vigencia",
        "Promociones exclusivas por temporada",
      ],
    },
    {
      icon: Landmark,
      title: "Identidad pachucense",
      desc: "Reforzar el sentido de pertenencia y orgullo por Pachuca de Soto.",
      bullets: [
        "Actividades que celebran la cultura y el centro histórico",
        "Distintivo oficial para pertenecer a la comunidad del programa",
        "Participación en eventos locales y voluntariados",
      ],
    },
    {
      icon: ShoppingBag,
      title: "Impulso económico",
      desc: "Apoyar a la economía local con convenios y descuentos que atraigan consumo.",
      bullets: [
        "Mayor flujo a negocios de barrio y emprendedores",
        "Beneficios cruzados con comercios aliados",
        "Medición de impacto y mejora continua",
      ],
    },
    {
      icon: ShieldCheck,
      title: "Oportunidades",
      desc: "Promover el desarrollo personal y profesional con beneficios tangibles.",
      bullets: [
        "Vinculación con prácticas, empleo y mentorías",
        "Acceso a talleres de habilidades digitales y blandas",
        "Reconocimientos por participación y logros",
      ],
    },
  ];

  const [publicStats, setPublicStats] = useState({ businesses: 50, beneficiaries: 2000 });

  useEffect(() => {
    fetch("/api/public/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.businesses !== undefined && data.beneficiaries !== undefined) {
          setPublicStats(data);
        }
      })
      .catch((err) => console.error("Error fetching public stats", err));
  }, []);

  const beneficios = [
    { icon: Percent, text: "Descuentos en restaurantes (10-30%)" },
    { icon: School, text: "Acceso preferencial a eventos culturales" },
    { icon: HeartHandshake, text: "Promociones en gimnasios y deportes" },
    { icon: Landmark, text: "Descuentos en transporte público (futuro)" },
    { icon: ShoppingBag, text: "Ofertas en librerías y papelerías" },
    { icon: Star, text: "Precios especiales en cines y entretenimiento" },
    { icon: ShieldCheck, text: "Descuentos en servicios de salud y bienestar" },
  ];

  const [destacados, setDestacados] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/business/approved")
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          const withVisits = data.items.map((c: any) => ({
            ...c,
            // Generar número de visitas determinista para simular clics a maps
            visitas_maps: ((c.business_id * 37) % 800) + 200, 
          }));
          withVisits.sort((a: any, b: any) => b.visitas_maps - a.visitas_maps);
          
          setDestacados(
            withVisits.slice(0, 3).map((c: any) => ({
              nombre: c.business_name,
              categoria: c.category || "Comercio",
              descuento: c.tipoDescuento || "Beneficios exclusivos",
              direccion: c.address || c.city || "Pachuca",
              visitas: c.visitas_maps,
              img: c.local_photo_url || "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=1600&auto=format&fit=crop",
              website: c.website || "https://maps.google.com/?q=Pachuca"
            }))
          );
        }
      })
      .catch(console.error);
  }, []);

  const faqs = [
    {
      q: "¿Quién puede ser beneficiario?",
      a: "Jóvenes de 15 a 29 años residentes de Pachuca de Soto con identificación y CURP vigentes.",
    },
    {
      q: "¿Cómo me registro en el programa?",
      a: "Realiza un registro sencillo con tus datos personales y acepta términos. Recibirás tu credencial digital en minutos.",
    },
    {
      q: "¿Cuánto tiempo tarda la aprobación?",
      a: "La validación es automática en la versión de demostración. En producción podría tardar hasta 48 horas.",
    },
    {
      q: "¿Dónde puedo usar mi credencial?",
      a: "En comercios afiliados identificados con el distintivo del programa. Consulta la lista actualizada en Afiliados.",
    },
    {
      q: "¿La credencial tiene vigencia?",
      a: "Sí, la vigencia es anual y podrás renovarla sin costo durante el programa.",
    },
    {
      q: "¿Qué hago si pierdo mi credencial digital?",
      a: "Puedes regenerarla desde tu perfil o escanear tu QR anterior; el sistema validará tu estatus activo.",
    },
    {
      q: "¿Puedo usar mi credencial en cualquier sucursal?",
      a: "Depende del comercio. La mayoría admite todas sus sucursales de Pachuca Centro; revisa los detalles en la ficha del comercio.",
    },
    {
      q: "¿Cómo validan mi identidad en los comercios?",
      a: "Muestran tu QR y datos básicos. El comercio verifica en segundos el folio y vigencia del beneficiario.",
    },
  ];

  return (
    <main>
      <CinematicIntro />

      {/* SCROLL FLOAT TEST */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-background via-background to-background/50 py-24">
        <div className="mx-auto w-full max-w-[1700px] px-6 sm:px-10 lg:px-16">
          <ScrollFloat containerClassName="text-center" textClassName="text-[hsl(var(--brand-primary))]" 
          animationDuration={6} 
           ease='back.inOut(2)'
           scrollStart='center bottom+=50%'
           scrollEnd='bottom bottom-=40%'
           stagger={0.08}>
            Explora el futuro digital
          </ScrollFloat>
        </div>
      </section>

      {/* HERO */}
      <section id="hero" className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Fce1f4688001c4a1985ce4f6d708c72b7%2F8ee76b000caf49e89233ef44603d4e89?format=webp&width=2000"
            alt="Pachuca Centro"
            className="h-full w-full scale-110 object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--brand-primary))]/30 via-background/30 to-[hsl(var(--brand-secondary))]/30" />
        </div>
        <div className="mx-auto grid w-full max-w-[1700px] items-center gap-10 px-6 pb-16 pt-12 sm:px-10 md:grid-cols-2 lg:px-16 lg:pb-24 lg:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-md">
              <IdCard className="h-4 w-4" /> Credenciales digitales juveniles
            </span>
            <HeroTitle />
            <div className="text-3xl font-extrabold text-foreground">
              Más {" "}
              <RotatingText 
                texts={["Descuentos", "Eventos", "Oportunidades", "Apoyo local"]} 
                className="text-white"
              />
            </div>
            <p className="max-w-xl text-base leading-relaxed text-foreground/90 font-semibold">
              Un programa del Gobierno Municipal de Pachuca de Soto para jóvenes
              de 15 a 29 años. Descuentos en comercios afiliados, acceso a
              actividades y oportunidades que impulsan tu desarrollo.
            </p>
            <AnimatedCTAButtons />
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center shadow-lg backdrop-blur-md">
                <StatsCounter
                  to={publicStats.beneficiaries}
                  suffix="+"
                  className="text-2xl font-extrabold"
                />
                <p className="text-xs text-foreground/70">Beneficiarios Aprobados</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center shadow-lg backdrop-blur-md">
                <StatsCounter
                  to={publicStats.businesses}
                  suffix="+"
                  className="text-2xl font-extrabold"
                />
                <p className="text-xs text-foreground/70">Comercios Afiliados</p>
              </div>
            </div>
          </motion.div>

          {/* Demo Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex items-center justify-center"
          >
            {/* Demo de credencial digital */}
            <DemoDigitalCard />
          </motion.div>
        </div>
      </section>


      <div className="pattern-blanket">
        {/* SOBRE EL PROGRAMA - BENTO CARDS */}
        <section
          id="sobre"
          className="grid-pattern mx-auto w-full max-w-[1700px] px-6 py-24 sm:px-10 lg:px-16"
        >
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "JÓVENES.",
              desc: "Identidad y beneficios que impulsan tu desarrollo.",
              gradient: "from-[hsl(var(--brand-primary))] via-[hsl(var(--brand-primary))/85] to-[hsl(var(--brand-secondary))/30]",
              bgLight: "from-red-50 to-pink-50",
              Icon: Users,
              accentColor: "hsl(var(--brand-primary))",
            },
            {
              title: "COMERCIOS.",
              desc: "Alianzas locales con impacto real para la economía.",
              gradient: "from-[hsl(var(--brand-secondary))] via-[hsl(var(--brand-secondary))/85] to-[hsl(var(--brand-primary))/30]",
              bgLight: "from-amber-50 to-yellow-50",
              Icon: Briefcase,
              accentColor: "hsl(var(--brand-secondary))",
            },
            {
              title: "CONEXIÓN.",
              desc: "Tecnología simple para validar y aprovechar descuentos.",
              gradient: "from-[hsl(var(--brand-primary))] via-[hsl(var(--brand-secondary))] to-[hsl(var(--brand-primary))/70]",
              bgLight: "from-purple-50 to-pink-50",
              Icon: Link2,
              accentColor: "hsl(var(--brand-primary))",
            },
          ].map(({ title, desc, gradient, bgLight, Icon, accentColor }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group"
            >
              <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} dark:${gradient} p-8 shadow-xl border border-white/20 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-white/10 blur-3xl group-hover:scale-125 transition-transform duration-500" />
                <div className="absolute -bottom-24 -left-12 h-48 w-48 rounded-full bg-white/5 blur-3xl group-hover:scale-125 transition-transform duration-500" />

                <div className="relative z-10">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="mb-6 inline-flex p-4 rounded-2xl bg-white/20 dark:bg-white/20 backdrop-blur-sm border border-white/30"
                  >
                    <Icon className="h-10 w-10 text-black dark:text-white" />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 1, delay: i * 0.1 + 0.2 }}
                    className="font-display text-4xl sm:text-5xl font-extrabold leading-tight text-black dark:text-white text-center"
                  >
                    {title}
                  </motion.h3>
                  <p className="mt-4 text-black dark:text-white text-base leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CARACTERÍSTICAS ANIMADAS - BENTO GRID */}
        <section className="grid-pattern mx-auto w-full max-w-[1700px] px-6 py-12 sm:px-10 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Lo que obtienes al registrarte
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre todos los beneficios y características que te esperan en nuestro programa juvenil.
          </p>
        </motion.div>
        <AnimatedBentoButtons />
      </section>

      {/* MISION Y VISION */}
        <section id="mision-vision" className="grid-pattern mx-auto w-full max-w-[1700px] px-6 py-8 sm:px-10 lg:px-16">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Misión */}
          <motion.article
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            whileHover={{ y: -12, transition: { duration: 0.3 } }}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/70 to-white/50 dark:from-slate-800/70 dark:to-slate-900/50 p-6 sm:p-8 text-foreground dark:text-white shadow-lg dark:shadow-2xl border border-white/20 dark:border-slate-700/30 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl dark:hover:shadow-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-white/15 blur-3xl group-hover:scale-125 transition-transform duration-700" />
            <div className="absolute -bottom-32 -left-16 h-56 w-56 rounded-full bg-white/10 blur-3xl group-hover:scale-125 transition-transform duration-700" />

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="mb-6 inline-flex p-4 rounded-2xl bg-[hsl(var(--brand-primary))]/12 backdrop-blur-sm border border-[hsl(var(--brand-primary))]/20 group-hover:bg-[hsl(var(--brand-primary))]/20 transition-all"
              >
                <Target className="h-10 w-10 text-[hsl(var(--brand-primary))]" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-display text-center text-4xl sm:text-5xl font-extrabold leading-[0.95] tracking-tight text-black dark:text-white"
              >
                Misión
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mt-4 text-center text-sm sm:text-base text-black/95 dark:text-white/95 leading-relaxed"
              >
                Impulsar el desarrollo integral de la juventud pachucense mediante un programa de beneficios que facilite el acceso a bienes y servicios de calidad, promoviendo su bienestar, educación y participación activa en la sociedad.
              </motion.p>
            </div>
          </motion.article>

          {/* Visión */}
          <motion.article
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            whileHover={{ y: -12, transition: { duration: 0.3 } }}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/70 to-white/50 dark:from-slate-800/70 dark:to-slate-900/50 p-6 sm:p-8 text-foreground dark:text-white shadow-lg dark:shadow-2xl border border-white/20 dark:border-slate-700/30 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl dark:hover:shadow-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-white/15 blur-3xl group-hover:scale-125 transition-transform duration-700" />
            <div className="absolute -bottom-32 -left-16 h-56 w-56 rounded-full bg-white/10 blur-3xl group-hover:scale-125 transition-transform duration-700" />

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0, rotate: 180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-6 inline-flex p-4 rounded-2xl bg-[hsl(var(--brand-secondary))]/12 backdrop-blur-sm border border-[hsl(var(--brand-secondary))]/20 group-hover:bg-[hsl(var(--brand-secondary))]/20 transition-all"
              >
                <Eye className="h-10 w-10 text-[hsl(var(--brand-secondary))]" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="font-display text-center text-4xl sm:text-5xl font-extrabold leading-[0.95] tracking-tight text-black dark:text-white"
              >
                Visión
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-4 text-center text-sm sm:text-base text-black/95 dark:text-white/95 leading-relaxed"
              >
                Ser el programa de beneficios juveniles líder en el estado de Hidalgo, reconocido por su impacto positivo en la calidad de vida de los jóvenes y su contribución al fortalecimiento del tejido social y económico de Pachuca de Soto.
              </motion.p>
            </div>
          </motion.article>
        </div>
      </section>

      {/* OBJETIVOS - sección fijada con tarjetas a pantalla completa y paso por scroll */}
        <section id="objetivos" className="grid-pattern mx-auto w-full max-w-[1700px] px-6 py-16 sm:px-10 lg:px-16">
        <h2 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl">
          Objetivos del programa
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted-foreground">
          Mientras te desplazas, cada objetivo aparece a pantalla completa con un enfoque suave.
        </p>
        <div className="mt-8">
          {objetivos.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="sticky top-0 h-screen flex items-center justify-center">
              <motion.article
                initial={{ opacity: 0.5, scale: 0.94, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: false, amount: 0.7 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.02 }}
                className="relative mx-auto w-full max-w-4xl rounded-3xl border border-white/10 bg-white/40 p-8 text-center shadow-2xl backdrop-blur-2xl"
              >
                <div className="mx-auto mb-4 inline-flex rounded-2xl bg-[hsl(var(--brand-primary))/12] p-4 text-[hsl(var(--brand-primary))]">
                  <Icon className="h-8 w-8" />
                </div>
                <motion.h3
                  initial={{ opacity: 0, x: -80, y: 40 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, amount: 0.8 }}
                  transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
                  className="text-3xl sm:text-4xl font-extrabold"
                >
                  {title}
                </motion.h3>
                <p className="mx-auto mt-3 max-w-2xl text-base sm:text-lg text-foreground/80">
                  {desc}
                </p>
                {Array.isArray((objetivos[i] as any).bullets) && (
                  <ul className="mx-auto mt-5 max-w-xl space-y-2 text-left">
                    {(objetivos[i] as any).bullets.map((b: string) => (
                      <li key={b} className="relative pl-5 text-sm text-foreground/80 sm:text-base">
                        <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-[hsl(var(--brand-primary))]" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.article>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">Continúa deslizando para ver todos los objetivos</p>
      </section>

      {/* BENEFICIOS - headline grande + copy, y lista condensada */}
        <section className="grid-pattern mx-auto w-full max-w-[1700px] px-6 py-16 sm:px-10 lg:px-16">
        <div className="rounded-3xl border border-white/10 bg-white/70 p-8 shadow-2xl backdrop-blur-2xl">
          <motion.h2
            initial={{ opacity: 0, x: -120, y: 40 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-5xl font-extrabold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl"
          >
            Beneficios reales para los jóvenes.
          </motion.h2>
          <div className="mt-5 space-y-3 text-base text-foreground/80 sm:text-lg">
            <p>
              No son promesas: son descuentos y accesos negociados con comercios locales y aliados culturales.
              Todo verificado y fácil de usar con tu credencial digital.
            </p>
            <p>
              Obtén tarifas preferenciales en restaurantes, entretenimiento, educación, salud y más.
              Tu identidad se valida con un QR seguro; los beneficios se aplican al instante.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {beneficios.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: i * 0.05 }}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/60 p-4 shadow-md backdrop-blur-xl"
              >
                <div className="mt-0.5 rounded-xl bg-[hsl(var(--brand-primary))/12] p-2 text-[hsl(var(--brand-primary))]">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-foreground/80">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COMERCIOS DESTACADOS */}
        <section className="grid-pattern mx-auto w-full max-w-[1700px] px-6 py-16 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Comercios destacados
          </h2>
          <a
            href="/afiliados"
            className="text-sm font-semibold text-[hsl(var(--brand-primary))] hover:underline"
          >
            Ver todos
          </a>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destacados.map((c, i) => (
            <motion.article
              key={c.nombre}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.05 }}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/50 shadow-xl backdrop-blur-2xl"
            >
              <div className="relative h-44 w-full overflow-hidden">
                <img
                  src={c.img}
                  alt={c.nombre}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute left-3 top-3 inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900">
                  {c.categoria}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold">{c.nombre}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {c.descuento}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {c.direccion}
                  </span>
                  <a href={c.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[hsl(var(--brand-primary))] hover:underline font-semibold transition-colors">
                    <Eye className="h-3.5 w-3.5" />{" "}
                    {c.visitas} visitas en Maps
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* FAQ */}
        <section className="grid-pattern mx-auto w-full max-w-[1700px] px-6 py-16 sm:px-10 lg:px-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Preguntas frecuentes
            </h2>
            <p className="mt-2 max-w-prose text-foreground/80">
              Resolvemos tus dudas más comunes sobre la inscripción, uso de la
              credencial y beneficios disponibles.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/40 p-4 shadow-lg backdrop-blur-xl">
            <FAQAccordion items={faqs} />
          </div>
        </div>
      </section>

      {/* CTA */}
        <section className="grid-pattern mx-auto w-full max-w-[1700px] px-6 py-16 sm:px-10 lg:px-16">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl p-8 sm:p-12">
          {/* Background Image & Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1517602302552-471fe67acf66?q=80&w=2000&auto=format&fit=crop"
              alt="Pachuca Background"
              className="h-full w-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--brand-primary))]/90 via-[hsl(var(--brand-primary))]/85 to-[hsl(var(--brand-secondary))]/80" />
          </div>

          <div className="relative z-10 grid items-center gap-6 md:grid-cols-2 text-white">
            <div>
              <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Únete al programa
              </h3>
              <p className="mt-3 text-lg text-white/90">
                Obtén tu credencial digital y comienza a disfrutar de beneficios
                exclusivos en Pachuca de Soto.
              </p>
            </div>
            <div className="flex justify-end">
              <a
                href="/registro"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-lg transition-all hover:brightness-95 active:scale-95"
              >
                Registrarme ahora
              </a>
            </div>
          </div>
        </div>
      </section>
      </div>
    </main>
  );
}
