import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { LOGO_URL } from "@/lib/constants";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { to: "/", label: "Inicio" },
    { to: "/afiliados", label: "Afiliados" },
    { to: "/buscar-tarjeta", label: "Buscar Tarjeta" },
    { to: "/login", label: "Iniciar Sesión" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group inline-flex items-center gap-3">
          <img src={LOGO_URL} alt="Pachuca" className="h-11 w-auto sm:h-12" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-wide text-muted-foreground group-hover:text-foreground transition-colors">
              Gobierno Municipal de
            </span>
            <span className="text-base font-extrabold tracking-tight text-foreground">
              Pachuca de Soto
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center">
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-foreground/5 px-1 py-1 shadow-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors",
                    isActive && "text-foreground bg-white/50",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/registro"
            className="hidden sm:inline-flex items-center justify-center rounded-xl bg-[hsl(var(--brand-primary))] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#88163e]/20 transition-all hover:brightness-110 active:scale-95"
          >
            Registrarme
          </Link>

          {mounted && (
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label="Toggle theme"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-foreground/80 hover:text-foreground hover:bg-white/10 transition-all"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>
          )}

          <button
            aria-label="Abrir menú"
            className="inline-flex md:hidden items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-foreground/80 hover:text-foreground"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 grid gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "block rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground",
                    isActive && "text-foreground bg-foreground/5",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/registro"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-[hsl(var(--brand-primary))] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#88163e]/20 transition-all hover:brightness-110"
            >
              Registrarme
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
