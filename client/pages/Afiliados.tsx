import { useMemo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  BookOpen,
  Building2,
  Car,
  Coffee,
  Dumbbell,
  Film,
  Clock,
  Globe,
  GraduationCap,
  IdCard,
  Heart,
  MapPin,
  Phone,
  Pill,
  Radar,
  Search,
  ShieldCheck,
  Store,
  ShoppingBag,
  Sparkles,
  Star,
  TicketPercent,
  Users,
} from "lucide-react"

import StatsCounter from "@/components/StatsCounter"
import { Reveal } from "@/components/motion/Reveal"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import type { ApprovedBusiness } from "@shared/api"

function AnimatedTitle({ text }) {
  return (
    <h1
      className="font-display uppercase font-extrabold leading-[0.9] text-5xl sm:text-6xl lg:text-7xl tracking-tight"
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{
            duration: 0.6,
            delay: i * 0.03,
            ease: "easeOut",
          }}
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {char}
        </motion.span>
      ))}
    </h1>
  )
}

interface ComercioTransformado {
  id: number;
  nombre: string;
  categoria: string;
  zona: string;
  descuento: string;
  descripcion: string;
  telefono: string;
  sitio: string;
  rating: number;
  img: string;
  coordenadas: { lat: number; lng: number };
  googleMapsUrl: string;
  approvedAt: string | null;
}

export default function Afiliados() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [selectedZone, setSelectedZone] = useState("todas")
  const [comercios, setComercios] = useState<ComercioTransformado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const recentValidationsCount = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return comercios.filter((c) => c.approvedAt && new Date(c.approvedAt) >= thirtyDaysAgo).length;
  }, [comercios]);

  // Fetch comercios aprobados
  useEffect(() => {
    const fetchComercios = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/business/approved")
        if (!response.ok) throw new Error("Error al cargar comercios")
        const data = await response.json()

        // Transformar datos de BD a formato esperado
        const transformed: ComercioTransformado[] = data.items.map((business: ApprovedBusiness) => {
          // Generar zona a partir de city y state
          const zona = business.city && business.state
            ? `${business.city}, ${business.state}`
            : business.city || business.state || "Sin especificar"

          // El link de Google Maps es el que el usuario ingresó en el formulario
          const googleMapsUrl = business.website || ""

          return {
            id: business.business_id,
            nombre: business.business_name,
            categoria: (business.category || "otros").toLowerCase(),
            zona,
            descuento: business.tipoDescuento || "Beneficios exclusivos",
            descripcion: business.restricciones || business.address || "Negocio afiliado",
            telefono: business.phone || "Sin teléfono",
            sitio: "Ubicación en maps",
            rating: 4.5, // Rating por defecto
            img: business.local_photo_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
            coordenadas: { lat: 20.1167, lng: -98.7333 }, // Pachuca default
            googleMapsUrl,
            approvedAt: business.approved_at || null,
          }
        })

        setComercios(transformed)
        setError(null)
      } catch (err) {
        console.error("Error:", err)
        setError("No se pudieron cargar los comercios")
        setComercios([])
      } finally {
        setLoading(false)
      }
    }

    fetchComercios()
  }, [])

  const categories = [
    { id: "todos", name: "Todas las categorías", icon: Building2 },
    { id: "restaurantes", name: "Restaurantes", icon: Coffee },
    { id: "tiendas", name: "Tiendas", icon: ShoppingBag },
    { id: "salud", name: "Salud y Belleza", icon: Heart },
    { id: "transporte", name: "Transporte", icon: Car },
    { id: "educacion", name: "Educación", icon: GraduationCap },
    { id: "deportes", name: "Deportes", icon: Dumbbell },
    { id: "entretenimiento", name: "Entretenimiento", icon: Film },
    { id: "farmacias", name: "Farmacias", icon: Pill },
    { id: "librerias", name: "Librerías", icon: BookOpen },
  ]

  const zones = [
    "todas",
    "Centro Histórico",
    "Zona Plateada",
    "Pachuca Norte",
    "Pachuca Sur",
    "Mineral de la Reforma",
  ]


  const filteredComercios = useMemo(() => {
    return comercios.filter((c) => {
      const term = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !term ||
        c.nombre.toLowerCase().includes(term) ||
        c.descripcion.toLowerCase().includes(term)
      const matchesCategory =
        selectedCategory === "todos" || c.categoria === selectedCategory
      const matchesZone = selectedZone === "todas" || c.zona === selectedZone
      return matchesSearch && matchesCategory && matchesZone
    })
  }, [comercios, searchTerm, selectedCategory, selectedZone])

  const bentoHighlights = [
    {
      name: "Convenios activos",
      className: "md:col-span-2",
      background: (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--brand-primary))/25] via-transparent to-[hsl(var(--brand-secondary))/20]" />
          <div className="absolute left-4 top-4 h-24 w-24 rounded-full bg-[hsl(var(--brand-primary))/25] blur-3xl" />
          <div className="absolute right-4 bottom-4 h-28 w-28 rounded-full bg-[hsl(var(--brand-secondary))/25] blur-3xl" />
        </div>
      ),
      Icon: TicketPercent,
      description:
        "Un vistazo rápido al estado de la red: comercios, zonas y satisfacción promedio.",
      href: "#listado",
      cta: "Explorar comercios",
    },
    {
      name: "Cobertura metropolitana",
      className: "md:col-span-1",
      background: (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-white/40 dark:from-neutral-900/40 dark:to-neutral-800/40" />
          <div className="absolute inset-2 rounded-2xl border border-white/30" />
        </div>
      ),
      Icon: Radar,
      description: "Zonas con presencia y dónde se concentran los beneficios.",
      href: "#filtros",
      cta: "Ver filtros por zona",
    },
    {
      name: "Atención validada",
      className: "md:col-span-1",
      background: (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/40 to-emerald-50/40 dark:from-emerald-900/40 dark:to-emerald-800/40" />
          <div className="absolute right-6 top-6 h-16 w-16 rounded-full bg-white/60 blur-2xl" />
        </div>
      ),
      Icon: ShieldCheck,
      description: "Cada comercio es validado y cuenta con contacto directo.",
      href: "#listado",
      cta: "Revisar tarjetas",
    },
  ]

  return (
    <main className="bg-background text-foreground">
      <section className="grid-pattern relative isolate overflow-hidden pb-12 pt-10 sm:pt-16 z-10">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[hsl(var(--brand-primary))/18] via-transparent to-[hsl(var(--brand-secondary))/18]" />
        <div className="absolute left-1/2 top-0 -z-10 h-64 w-[110%] -translate-x-1/2 text-[hsl(var(--brand-primary))]/20">
          <svg
            viewBox="0 0 1200 320"
            className="h-full w-full"
            preserveAspectRatio="none"
          >
            <path
              fill="currentColor"
              d="M0,96L60,106.7C120,117,240,139,360,138.7C480,139,600,117,720,133.3C840,149,960,203,1080,229.3C1200,256,1320,256,1440,240L1440,0L1320,0C1200,0,1080,0,960,0C840,0,720,0,600,0C480,0,360,0,240,0C120,0,0,0,0,0Z"
              opacity="0.25"
            />
            <path
              fill="currentColor"
              d="M0,64L60,85.3C120,107,240,149,360,181.3C480,213,600,235,720,224C840,213,960,171,1080,149.3C1200,128,1320,128,1380,128L1440,128L1440,0L1320,0C1200,0,1080,0,960,0C840,0,720,0,600,0C480,0,360,0,240,0C120,0,0,0,0,0Z"
              opacity="0.18"
            />
          </svg>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr,0.85fr]">
            <Reveal>
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-foreground/80 backdrop-blur">
                  <Sparkles className="h-4 w-4" />
                  Comercios afiliados 2025
                </span>
                <div className="space-y-2">
                  <AnimatedTitle text="Beneficios en" />
                  <AnimatedTitle text="Pachuca y" />
                  <AnimatedTitle text="la zona metropolitana" />
                </div>
                <p className="max-w-2xl text-base leading-relaxed text-foreground/80 sm:text-lg">
                  Encuentra los aliados que reconocen tu credencial juvenil.
                  Filtra por zona, categoría o palabra clave y descubre dónde
                  usar tus beneficios hoy mismo.
                </p>
                <div className="grid gap-3 sm:grid-cols-1">
                  <div className="rounded-2xl border border-white/10 bg-white/20 p-4 shadow-lg backdrop-blur">
                    <div className="text-xs text-foreground/70">Comercios Afiliados</div>
                    <div className="text-2xl font-extrabold">
                      <StatsCounter to={comercios.length} suffix="+" />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/30 p-6 shadow-2xl backdrop-blur">
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--brand-primary))/18] to-[hsl(var(--brand-secondary))/18]" />
                <div className="relative space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-white/60 p-3">
                      <Users className="h-6 w-6 text-[hsl(var(--brand-primary))]" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">
                        Red activa
                      </p>
                      <p className="text-lg font-semibold">Conexión segura</p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/75">
                    Cada negocio verifica tu folio y vigencia en segundos. Los
                    datos se protegen con protocolos cifrados para evitar fraudes.
                  </p>
                  <div className="rounded-2xl bg-white/70 p-4">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>Validaciones recientes</span>
                      <span className="text-[hsl(var(--brand-primary))]">
                        +{recentValidationsCount} este mes
                      </span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-black/5">
                      <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))]" />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <BentoGrid className="grid-cols-1 md:grid-cols-3">
              {bentoHighlights.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  className="relative"
                >
                  <BentoCard {...item} />
                </motion.div>
              ))}
            </BentoGrid>
          </Reveal>
        </div>
      </section>

      <div
        className="relative overflow-hidden"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(255, 255, 255, 0.6) 1px, transparent 1px), linear-gradient(rgba(255, 255, 255, 0.6) 1px, transparent 1px)',
          backgroundSize: '70px 70px',
          backgroundColor: 'hsl(var(--brand-primary) / 0.12)',
        }}
      >
        <section
          id="filtros"
          className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
        >
          <div className="rounded-3xl border border-white/10 bg-white/70 p-6 shadow-xl backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:w-1/2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre o descripción"
                  className="w-full rounded-xl border border-white/40 bg-white/70 px-10 py-3 text-sm shadow-inner outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Zonas
                </div>
                <div className="flex flex-wrap gap-2">
                  {zones.map((z) => (
                    <button
                      key={z}
                      onClick={() => setSelectedZone(z)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${selectedZone === z
                          ? "bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] text-white"
                          : "border border-white/40 bg-white/60 text-foreground/80 hover:border-foreground/20"
                        }`}
                    >
                      {z === "todas" ? "Todas" : z}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {categories.map(({ id, name, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedCategory(id)}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-semibold transition ${selectedCategory === id
                      ? "border-transparent bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] text-white shadow"
                      : "border-white/40 bg-white/60 text-foreground/80 hover:border-foreground/20"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section
          id="listado"
          className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Comercios afiliados
              </h2>
              <p className="text-sm text-muted-foreground">
                Resultados filtrados: {filteredComercios.length} de{" "}
                {comercios.length} totales
              </p>
            </div>
            <div className="rounded-full border border-white/20 bg-white/60 px-3 py-1 text-xs font-semibold text-foreground/70">
              Actualizado constantemente
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-[hsl(var(--brand-primary))]" />
                <p className="text-lg font-semibold">Cargando comercios...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-lg font-semibold text-red-900">{error}</p>
              <p className="text-sm text-red-700">Por favor intenta recargar la página</p>
            </div>
          )}

          {!loading && !error && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredComercios.map((c, i) => (
                <motion.article
                  key={c.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.03 }}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-white/70 shadow-lg backdrop-blur"
                >
                  <div className="relative h-44 w-full overflow-hidden">
                    <img
                      src={c.img}
                      alt={c.nombre}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                    <div className="absolute left-3 top-3 inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900">
                      {categories.find((cat) => cat.id === c.categoria)?.name ??
                        c.categoria}
                    </div>
                    <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-gray-900">
                      <Star className="h-3.5 w-3.5 text-yellow-500" />
                      {c.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="space-y-2 p-5">
                    <div>
                      <h3 className="text-lg font-bold">{c.nombre}</h3>
                      <p className="text-sm text-[hsl(var(--brand-primary))] font-semibold">
                        {c.descuento}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {c.descripcion}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{c.telefono}</span>
                      </div>
                      {c.googleMapsUrl && (
                        <a
                          href={c.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand-primary))/10] px-3 py-1 font-semibold text-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary))/20] transition-colors"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="text-xs">{c.zona}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {!loading && !error && filteredComercios.length === 0 && (
            <div className="mt-10 rounded-3xl border border-dashed border-white/30 bg-white/60 p-10 text-center shadow-inner backdrop-blur">
              <p className="text-lg font-semibold">
                No encontramos coincidencias con esos filtros.
              </p>
              <p className="text-sm text-muted-foreground">
                Prueba otra categoría o una zona diferente para ver más resultados.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
