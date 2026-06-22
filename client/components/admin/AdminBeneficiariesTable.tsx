import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import AdminStatusModal from "./AdminStatusModal";
import type { YoungBeneficiary } from "@shared/api";

interface AdminBeneficiariesTableProps {
  adminSecret: string;
  onStatusChange: () => void;
}

export default function AdminBeneficiariesTable({ adminSecret, onStatusChange }: AdminBeneficiariesTableProps) {
  const [beneficiaries, setBeneficiaries] = useState<YoungBeneficiary[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<YoungBeneficiary | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [noBeneficiaries, setNoBeneficiaries] = useState(false);

  useEffect(() => {
    const fetchBeneficiaries = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (status !== "all") params.append("status", status);
        if (search) params.append("search", search);

        const response = await fetch(`/api/admin/beneficiaries?${params.toString()}`, {
          headers: { "x-admin-secret": adminSecret },
        });

        if (response.status === 404 || response.status === 500) {
          setNoBeneficiaries(true);
          setBeneficiaries([]);
          return;
        }

        if (!response.ok) throw new Error("Error fetching beneficiaries");
        const data = await response.json();
        setBeneficiaries(data.items || []);
        setNoBeneficiaries(false);
      } catch (error) {
        console.error("Error:", error);
        setNoBeneficiaries(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficiaries();
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

  if (noBeneficiaries && !loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/50 backdrop-blur-xl shadow-xl p-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aún no hay Jóvenes Beneficiarios</h3>
        <p className="text-muted-foreground mb-4">
          El formulario para jóvenes beneficiarios aún no está disponible.
        </p>
        <p className="text-sm text-muted-foreground">
          Los registros aparecerán aquí una vez que el formulario esté implementado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, CURP o email..."
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
                <th className="px-6 py-4 text-left font-semibold">Nombre</th>
                <th className="px-6 py-4 text-left font-semibold">CURP</th>
                <th className="px-6 py-4 text-left font-semibold">Email</th>
                <th className="px-6 py-4 text-left font-semibold">Folio</th>
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
              ) : beneficiaries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No hay jóvenes beneficiarios que mostrar
                  </td>
                </tr>
              ) : (
                beneficiaries.map((beneficiary, idx) => (
                  <motion.tr
                    key={beneficiary.beneficiary_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-3">
                        {beneficiary.foto_url && (
                          <img
                            src={beneficiary.foto_url}
                            alt={beneficiary.nombre}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        )}
                        <span className="truncate">{beneficiary.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono">{beneficiary.curp}</td>
                    <td className="px-6 py-4 text-xs">{beneficiary.email}</td>
                    <td className="px-6 py-4 text-xs font-mono font-bold">
                      {beneficiary.token || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`flex w-fit gap-2 ${getStatusColor(beneficiary.status)}`}>
                        {getStatusIcon(beneficiary.status)}
                        {beneficiary.status === "pending" ? "Pendiente" : beneficiary.status === "approved" ? "Aprobado" : "Rechazado"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {new Date(beneficiary.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedBeneficiary(beneficiary);
                          setShowModal(true);
                        }}
                        className="text-xs"
                      >
                        Revisar
                      </Button>
                      {beneficiary.status === "approved" && beneficiary.token && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/buscar-tarjeta?token=${beneficiary.token}`, "_blank")}
                          className="text-xs border-[hsl(var(--brand-primary))] text-[hsl(var(--brand-primary))]"
                        >
                          Credencial
                        </Button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedBeneficiary && (
        <AdminStatusModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedBeneficiary(null);
          }}
          item={selectedBeneficiary}
          itemType="beneficiary"
          adminSecret={adminSecret}
          onSuccess={() => {
            onStatusChange();
            setShowModal(false);
            setSelectedBeneficiary(null);
          }}
        />
      )}
    </div>
  );
}
