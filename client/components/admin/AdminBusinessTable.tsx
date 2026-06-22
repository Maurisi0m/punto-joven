import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, CheckCircle2, XCircle } from "lucide-react";
import AdminStatusModal from "./AdminStatusModal";
import type { BusinessAccount } from "@shared/api";

interface AdminBusinessTableProps {
  adminSecret: string;
  onStatusChange: () => void;
}

export default function AdminBusinessTable({ adminSecret, onStatusChange }: AdminBusinessTableProps) {
  const [businesses, setBusinesses] = useState<BusinessAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessAccount | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (status !== "all") params.append("status", status);
        if (search) params.append("search", search);

        const response = await fetch(`/api/admin/businesses?${params.toString()}`, {
          headers: { "x-admin-secret": adminSecret },
        });

        if (!response.ok) throw new Error("Error fetching businesses");
        const data = await response.json();
        setBusinesses(data.items);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [adminSecret, status, search]);

  const getStatusColor = (s: string) => {
    switch (s) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
      case "approved":
        return "bg-green-500/20 text-green-700 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-700 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-500/30";
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "approved":
        return <CheckCircle2 className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, dueño o email..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="approved">Aprobados</option>
          <option value="rejected">Rechazados</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/50 backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-gradient-to-r from-[hsl(var(--brand-primary))/5] to-[hsl(var(--brand-secondary))/5]">
                <th className="px-6 py-4 text-left font-semibold">Negocio</th>
                <th className="px-6 py-4 text-left font-semibold">Dueño</th>
                <th className="px-6 py-4 text-left font-semibold">Email</th>
                <th className="px-6 py-4 text-left font-semibold">Categoría</th>
                <th className="px-6 py-4 text-left font-semibold">Estado</th>
                <th className="px-6 py-4 text-left font-semibold">Registrado</th>
                <th className="px-6 py-4 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin text-[hsl(var(--brand-primary))]">
                        ⟳
                      </div>
                    </div>
                  </td>
                </tr>
              ) : businesses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No hay negocios que mostrar
                  </td>
                </tr>
              ) : (
                businesses.map((business, idx) => (
                  <motion.tr
                    key={business.business_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-3">
                        {business.logo_url && (
                          <img
                            src={business.logo_url}
                            alt={business.business_name}
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                        )}
                        <span className="truncate">{business.business_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{business.owner_name}</td>
                    <td className="px-6 py-4 text-xs">{business.email}</td>
                    <td className="px-6 py-4">{business.category || "-"}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`flex w-fit gap-2 ${getStatusColor(business.status)}`}>
                        {getStatusIcon(business.status)}
                        {business.status === "pending" ? "Pendiente" : business.status === "approved" ? "Aprobado" : "Rechazado"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {new Date(business.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedBusiness(business);
                          setShowModal(true);
                        }}
                        className="text-xs"
                      >
                        Revisar
                      </Button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedBusiness && (
        <AdminStatusModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedBusiness(null);
          }}
          item={selectedBusiness}
          itemType="business"
          adminSecret={adminSecret}
          onSuccess={() => {
            onStatusChange();
            setShowModal(false);
            setSelectedBusiness(null);
          }}
        />
      )}
    </div>
  );
}
