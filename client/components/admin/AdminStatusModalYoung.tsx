import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Check, X, Users, Mail, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface YoungMinor {
  minor_id: number;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  curp: string;
  status: "pending" | "approved" | "rejected";
  status_comment?: string;
}

interface YoungAdult {
  beneficiary_id: number;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  curp: string;
  grado_estudio?: string;
  ocupacion?: string;
  status: "pending" | "approved" | "rejected";
  status_comment?: string;
}

type YoungItem = YoungMinor | YoungAdult;

interface AdminStatusModalYoungProps {
  isOpen: boolean;
  onClose: () => void;
  item: YoungItem;
  itemType: "minor" | "adult";
  adminSecret: string;
  onSuccess: () => void;
}

export default function AdminStatusModalYoung({
  isOpen,
  onClose,
  item,
  itemType,
  adminSecret,
  onSuccess,
}: AdminStatusModalYoungProps) {
  const [newStatus, setNewStatus] = useState<"pending" | "approved" | "rejected">(item.status);
  const [comment, setComment] = useState(item.status_comment || "");
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const { toast } = useToast();

  const isMinor = itemType === "minor";
  const isAdult = itemType === "adult";
  const itemId = isMinor ? (item as YoungMinor).minor_id : (item as YoungAdult).beneficiary_id;
  const itemName = `${item.nombre} ${item.apellido_paterno}`;
  const endpoint = isMinor ? `/api/admin/young-minors/${itemId}` : `/api/admin/young-adults/${itemId}`;

  const handleSubmit = async () => {
    if (newStatus === item.status && comment === item.status_comment) {
      toast({
        title: "Sin cambios",
        description: "No hay cambios que guardar",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${endpoint}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({
          status: newStatus,
          comment: comment || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar estado");
      }

      toast({
        title: "Éxito",
        description: `${isMinor ? "Menor" : "Mayor"} actualizado correctamente.`,
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al procesar solicitud",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeletingLoading(true);
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "x-admin-secret": adminSecret,
        },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar");
      }

      toast({
        title: "Eliminado",
        description: `${isMinor ? "Menor" : "Mayor"} "${itemName}" ha sido eliminado correctamente.`,
      });

      setShowDeleteConfirm(false);
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar",
        variant: "destructive",
      });
    } finally {
      setDeletingLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-background border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 border-b border-white/10 bg-gradient-to-r from-[hsl(var(--brand-primary))/10] to-[hsl(var(--brand-secondary))/10] px-6 py-4 flex items-center justify-between backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
                  <h2 className="text-lg font-bold">
                    {isMinor ? "Revisar Menor de Edad" : "Revisar Joven Mayor"}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Item Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">{itemName}</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-muted-foreground">CURP</p>
                        <p className="font-mono font-semibold">{item.curp}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-semibold break-all">{item.email}</p>
                      </div>
                    </div>

                    {isAdult && (item as YoungAdult).grado_estudio && (
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="text-muted-foreground">Grado de Estudio</p>
                          <p className="font-semibold capitalize">{(item as YoungAdult).grado_estudio}</p>
                        </div>
                      </div>
                    )}

                    {isAdult && (item as YoungAdult).ocupacion && (
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="text-muted-foreground">Ocupación</p>
                          <p className="font-semibold">{(item as YoungAdult).ocupacion}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-muted-foreground">Estado Actual</p>
                        <p className="font-semibold capitalize">{item.status}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Selection */}
                <div className="space-y-3 border-t border-white/10 pt-6">
                  <label className="block text-sm font-semibold">Cambiar estado a:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(["pending", "approved", "rejected"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setNewStatus(s)}
                        className={`rounded-lg border-2 p-3 text-sm font-semibold transition-all ${
                          newStatus === s
                            ? s === "pending"
                              ? "border-yellow-500 bg-yellow-500/10 text-yellow-600"
                              : s === "approved"
                              ? "border-green-500 bg-green-500/10 text-green-600"
                              : "border-red-500 bg-red-500/10 text-red-600"
                            : "border-white/10 bg-white/5 text-foreground hover:border-white/20"
                        }`}
                      >
                        {s === "pending" ? "Pendiente" : s === "approved" ? "Aprobar" : "Rechazar"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className="space-y-3 border-t border-white/10 pt-6">
                  <label className="block text-sm font-semibold">Comentario (opcional):</label>
                  <Textarea
                    placeholder="Ej: Información incompleta, requiere documentos adicionales, etc..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                {/* Actions */}
                <div className="space-y-3 border-t border-white/10 pt-6">
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className={`flex-1 ${
                        newStatus === "approved"
                          ? "bg-green-600 hover:bg-green-700"
                          : newStatus === "rejected"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-yellow-600 hover:bg-yellow-700"
                      }`}
                    >
                      {loading ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </div>

                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={loading || deletingLoading}
                    variant="destructive"
                    className="w-full gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar {isMinor ? "menor" : "mayor"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !deletingLoading && setShowDeleteConfirm(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="bg-background border border-white/10 rounded-2xl shadow-2xl max-w-sm w-full">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-destructive">
                      <AlertCircle className="h-6 w-6 flex-shrink-0" />
                      <h3 className="text-lg font-bold">
                        {isMinor ? "Eliminar menor" : "Eliminar mayor"}
                      </h3>
                    </div>

                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                      <p className="text-sm text-destructive">
                        Esta acción es irreversible. Se eliminará permanentemente{" "}
                        <strong className="font-semibold">{itemName}</strong> y todos sus datos asociados de la base de
                        datos.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={deletingLoading}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleDelete}
                        disabled={deletingLoading}
                        variant="destructive"
                        className="flex-1"
                      >
                        {deletingLoading ? "Eliminando..." : "Sí, eliminar"}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
