import { Facebook, MapPin, Phone, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 relative overflow-hidden bg-background shadow-[0_-8px_32px_rgba(0,0,0,0.25)] before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:from-[hsl(var(--brand-primary)/0.12)] before:via-[hsl(var(--brand-secondary)/0.12)] before:to-[hsl(var(--brand-primary)/0.12)] after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--brand-secondary)/0.20)_0%,_transparent_60%)] after:opacity-60">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50 bg-[repeating-linear-gradient(45deg,_hsl(var(--brand-primary)/0.06)_0_12px,_transparent_12px_24px),repeating-linear-gradient(-45deg,_hsl(var(--brand-secondary)/0.06)_0_12px,_transparent_12px_24px)]" />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Contacto e información */}
        <div className="space-y-3">
          <h3 className="font-display text-xl md:text-2xl font-semibold tracking-widest uppercase text-foreground">
            PRESIDENCIA MUNICIPAL DE PACHUCA DE SOTO
          </h3>
          <div className="text-base md:text-lg text-muted-foreground/90 leading-relaxed">
            <p>Plaza General Pedro María Anaya #1</p>
            <p>Col. Centro</p>
            <p>C.P. 42000</p>
          </div>

          <div>
            <h4 className="mb-2 font-display text-base md:text-lg font-semibold uppercase tracking-wider text-foreground/90">
              Contacto
            </h4>
            <ul className="space-y-2 text-base md:text-lg text-muted-foreground/90">
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 md:h-6 md:w-6" />
                <a href="tel:+527717171500" className="hover:text-foreground">
                  (771) 717 1500
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-5 w-5 md:h-6 md:w-6" /> Pachuca de Soto, Hidalgo, México
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-4 text-muted-foreground/90">
            <a
              href="https://www.facebook.com/pachucamunicipio"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Facebook"
              className="rounded-lg border border-white/10 p-2 hover:text-foreground"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://x.com/PachucaGob"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Twitter"
              className="rounded-lg border border-white/10 p-2 hover:text-foreground"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Mapa de Google */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-sm">
          <iframe
            title="Mapa: Presidencia Municipal de Pachuca"
            src="https://www.google.com/maps?q=Presidencia+Municipal+de+Pachuca+de+Soto&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[200px] w-full sm:h-[260px]"
            allowFullScreen
          />
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs sm:text-sm font-medium text-muted-foreground/90">
        © {new Date().getFullYear()} Presidencia Municipal de Pachuca de Soto — Política de Privacidad
      </div>
    </footer>
  );
}
