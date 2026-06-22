import { motion } from "framer-motion";
import { Building2, Users, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import type { AdminDashboardStats } from "@shared/api";

interface AdminStatsProps {
  stats: AdminDashboardStats;
  onRefresh: () => void;
}

export default function AdminStats({ stats, onRefresh }: AdminStatsProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const statsData = [
    // NEGOCIOS
    {
      label: "Negocios Totales",
      value: stats.businesses.total,
      icon: Building2,
      color: "from-blue-500/10 to-blue-600/10",
      textColor: "text-blue-600",
      bgColor: "bg-blue-500/20",
      section: "Negocios",
    },
    {
      label: "Negocios Pendientes",
      value: stats.businesses.pending,
      icon: AlertCircle,
      color: "from-yellow-500/10 to-yellow-600/10",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-500/20",
      section: "Negocios",
    },
    {
      label: "Negocios Aprobados",
      value: stats.businesses.approved,
      icon: CheckCircle2,
      color: "from-green-500/10 to-green-600/10",
      textColor: "text-green-600",
      bgColor: "bg-green-500/20",
      section: "Negocios",
    },

    // JÓVENES MENORES (12-17)
    {
      label: "Menores (12-17) Totales",
      value: stats.youngMinors.total,
      icon: Users,
      color: "from-indigo-500/10 to-indigo-600/10",
      textColor: "text-indigo-600",
      bgColor: "bg-indigo-500/20",
      section: "Jóvenes Menores",
    },
    {
      label: "Menores Pendientes",
      value: stats.youngMinors.pending,
      icon: AlertCircle,
      color: "from-orange-500/10 to-orange-600/10",
      textColor: "text-orange-600",
      bgColor: "bg-orange-500/20",
      section: "Jóvenes Menores",
    },
    {
      label: "Menores Aprobados",
      value: stats.youngMinors.approved,
      icon: CheckCircle2,
      color: "from-emerald-500/10 to-emerald-600/10",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-500/20",
      section: "Jóvenes Menores",
    },

    // JÓVENES MAYORES (18-29)
    {
      label: "Mayores (18-29) Totales",
      value: stats.youngAdults.total,
      icon: Users,
      color: "from-purple-500/10 to-purple-600/10",
      textColor: "text-purple-600",
      bgColor: "bg-purple-500/20",
      section: "Jóvenes Mayores",
    },
    {
      label: "Mayores Pendientes",
      value: stats.youngAdults.pending,
      icon: AlertCircle,
      color: "from-rose-500/10 to-rose-600/10",
      textColor: "text-rose-600",
      bgColor: "bg-rose-500/20",
      section: "Jóvenes Mayores",
    },
    {
      label: "Mayores Aprobados",
      value: stats.youngAdults.approved,
      icon: CheckCircle2,
      color: "from-cyan-500/10 to-cyan-600/10",
      textColor: "text-cyan-600",
      bgColor: "bg-cyan-500/20",
      section: "Jóvenes Mayores",
    },
  ];

  // Agrupar estadísticas por sección
  const sections = ["Negocios", "Jóvenes Menores", "Jóvenes Mayores"];
  const statsBySection = sections.map(section => ({
    section,
    items: statsData.filter(s => (s as any).section === section)
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Resumen de Estadísticas</h2>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand-primary))]/10 px-4 py-2 text-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary))]/20 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {statsBySection.map((group) => (
        <div key={group.section} className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">{group.section}</h3>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {group.items.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  variants={item}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} border border-white/10 p-6 shadow-lg backdrop-blur-sm transition-all hover:border-white/20 hover:shadow-xl`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 space-y-3">
                    <div className={`inline-flex rounded-xl ${stat.bgColor} p-3`}>
                      <Icon className={`h-5 w-5 ${stat.textColor}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      ))}
    </div>
  );
}
