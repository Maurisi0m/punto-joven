import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
// Lazy-load pages and heavy visual component to reduce initial bundle
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Afiliados = lazy(() => import("./pages/Afiliados"));
const BuscarTarjeta = lazy(() => import("./pages/BuscarTarjeta"));
const ValidarCredencial = lazy(() => import("./pages/ValidarCredencial"));
const Login = lazy(() => import("./pages/Login"));
const LoginJoven = lazy(() => import("./pages/LoginJoven"));
const Registro = lazy(() => import("./pages/Registro"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));

const NegocioDashboard = lazy(() => import("./pages/NegocioDashboard"));

import { ParallaxProvider } from "react-scroll-parallax";
// BackgroundParallax can be heavy (three.js / large visuals). Lazy-load its module.
const BackgroundParallax = lazy(() => import("@/components/BackgroundParallax"));

import Lenis from "lenis";
import { AnimatePresence, motion } from "framer-motion";
import { initMagnetHover } from "@/lib/magnet";
import { ThemeProvider } from "next-themes";

const queryClient = new QueryClient();

function RouteTransitions() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35 }}
      >
        {/* Suspense around routes: fallback preserves layout and doesn't block framer-motion transitions */}
        <Suspense fallback={<div className="min-h-[48vh] flex items-center justify-center">Cargando...</div>}>
          <Routes location={location}>
            <Route path="/" element={<Index />} />
            <Route path="/afiliados" element={<Afiliados />} />
            <Route path="/buscar-tarjeta" element={<BuscarTarjeta />} />
            <Route path="/validar/:token" element={<ValidarCredencial />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login-joven" element={<LoginJoven />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/dashboard-negocio" element={<NegocioDashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => {
  useEffect(() => {
    // Smooth scroll with Lenis
    const lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      lerp: 0.08,
    } as any);
    (window as any).lenis = lenis;

    // Smooth anchor links
    const onClick = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const a = t.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const hash = a.getAttribute("href");
      if (!hash || hash === "#" || hash.length < 2) return;
      const el = document.querySelector(hash);
      if (el) {
        e.preventDefault();
        // @ts-expect-error lenis scrollTo exists
        lenis.scrollTo(el, { offset: -12 });
      }
    };
    document.addEventListener("click", onClick);

    // Magnetic hover on buttons (global)
    const cleanupMagnet = initMagnetHover();

    return () => {
      document.removeEventListener("click", onClick);
      lenis?.destroy?.();
      cleanupMagnet();
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ParallaxProvider>
            {/* Lazy-load background with a placeholder to avoid layout shift and preserve visual effects */}
            <Suspense fallback={<div aria-hidden className="absolute inset-0 pointer-events-none" />}>
              <BackgroundParallax />
            </Suspense>
            <BrowserRouter>
              <Header />
              <RouteTransitions />
              <Footer />
            </BrowserRouter>
          </ParallaxProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
