import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Building2, Users, BarChart3 } from "lucide-react";
import AdminStats from "@/components/admin/AdminStats";
import AdminBusinessTable from "@/components/admin/AdminBusinessTable";
import AdminBeneficiariesTable from "@/components/admin/AdminBeneficiariesTable";
import AdminYoungMinorsTable from "@/components/admin/AdminYoungMinorsTable";
import AdminYoungAdultsTable from "@/components/admin/AdminYoungAdultsTable";
import type { AdminDashboardStats } from "@shared/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [minors, setMinors] = useState<any[]>([]);
  const [adults, setAdults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const adminSecret = localStorage.getItem("admin_secret");

  useEffect(() => {
    if (!adminSecret) {
      setError("No tienes acceso al panel de admin");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashResponse, minorsResponse, adultsResponse] = await Promise.all([
          fetch("/api/admin/dashboard", {
            headers: { "x-admin-secret": adminSecret },
          }),
          fetch("/api/admin/young-minors", {
            headers: { "x-admin-secret": adminSecret },
          }),
          fetch("/api/admin/young-adults", {
            headers: { "x-admin-secret": adminSecret },
          }),
        ]);

        if (!dashResponse.ok) {
          throw new Error("No autorizado");
        }

        const dashData = await dashResponse.json();
        setStats(dashData);

        const minorsData = await minorsResponse.json().catch(() => ({ items: [] }));
        setMinors(minorsData.items || []);

        const adultsData = await adultsResponse.json().catch(() => ({ items: [] }));
        setAdults(adultsData.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [adminSecret, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  if (!adminSecret) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
          <p className="text-muted-foreground">No tienes permisos para acceder al panel de administración.</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-to-r from-[hsl(var(--brand-primary))/10] to-[hsl(var(--brand-secondary))/10] backdrop-blur-sm">
        <div className="max-w-[2000px] mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h1 className="text-4xl font-bold font-display">Panel de Administración</h1>
            <p className="text-muted-foreground">
              Gestiona y aprueba negocios y jóvenes beneficiarios del programa Compajefra
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[2000px] mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        {stats && (
          <AdminStats stats={stats} onRefresh={handleRefresh} />
        )}

        {/* Tables Tabs */}
        {stats && (
          <Tabs defaultValue="businesses" className="w-full">
            <TabsList className="w-full justify-start bg-white/50 rounded-2xl p-2 border border-white/10 h-auto gap-2 flex-wrap">
              <TabsTrigger value="businesses" className="gap-2 data-[state=active]:bg-[hsl(var(--brand-primary))] data-[state=active]:text-white">
                <Building2 className="h-4 w-4" />
                Negocios
                <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                  stats.businesses.pending > 0
                    ? 'bg-red-500/20 text-red-600'
                    : 'bg-blue-500/20 text-blue-600'
                }`}>
                  {stats.businesses.total}
                </span>
              </TabsTrigger>
              <TabsTrigger value="minors" className="gap-2 data-[state=active]:bg-[hsl(var(--brand-primary))] data-[state=active]:text-white">
                <Users className="h-4 w-4" />
                Menores (12-17)
                <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                  stats.youngMinors.pending > 0
                    ? 'bg-red-500/20 text-red-600'
                    : 'bg-blue-500/20 text-blue-600'
                }`}>
                  {stats.youngMinors.total}
                </span>
              </TabsTrigger>
              <TabsTrigger value="adults" className="gap-2 data-[state=active]:bg-[hsl(var(--brand-primary))] data-[state=active]:text-white">
                <Users className="h-4 w-4" />
                Mayores (18-29)
                <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                  stats.youngAdults.pending > 0
                    ? 'bg-red-500/20 text-red-600'
                    : 'bg-purple-500/20 text-purple-600'
                }`}>
                  {stats.youngAdults.total}
                </span>
              </TabsTrigger>
              <TabsTrigger value="beneficiaries" className="gap-2 data-[state=active]:bg-[hsl(var(--brand-primary))] data-[state=active]:text-white">
                <Users className="h-4 w-4" />
                Legado
                <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                  stats.beneficiaries.pending > 0
                    ? 'bg-red-500/20 text-red-600'
                    : 'bg-green-500/20 text-green-600'
                }`}>
                  {stats.beneficiaries.total}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="businesses" className="mt-6">
              <AdminBusinessTable adminSecret={adminSecret} onStatusChange={handleRefresh} />
            </TabsContent>

            <TabsContent value="minors" className="mt-6">
              <AdminYoungMinorsTable minors={minors} loading={loading} adminSecret={adminSecret} onStatusChange={handleRefresh} />
            </TabsContent>

            <TabsContent value="adults" className="mt-6">
              <AdminYoungAdultsTable adults={adults} loading={loading} adminSecret={adminSecret} onStatusChange={handleRefresh} />
            </TabsContent>

            <TabsContent value="beneficiaries" className="mt-6">
              <AdminBeneficiariesTable adminSecret={adminSecret} onStatusChange={handleRefresh} />
            </TabsContent>
          </Tabs>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin">
              <BarChart3 className="h-8 w-8 text-[hsl(var(--brand-primary))]" />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
