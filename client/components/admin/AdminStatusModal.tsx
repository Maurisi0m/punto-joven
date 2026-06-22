import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Check, X, Building2, Users, MapPin, Mail, Expand, Trash2, Tag, Link2, PhoneCall, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageLightbox from "@/components/ui/image-lightbox";
import type { BusinessAccount, YoungBeneficiary } from "@shared/api";

interface AdminStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BusinessAccount | YoungBeneficiary;
  itemType: "business" | "beneficiary";
  adminSecret: string;
  onSuccess: () => void;
}

export default function AdminStatusModal({
  isOpen,
  onClose,
  item,
  itemType,
  adminSecret,
  onSuccess,
}: AdminStatusModalProps) {
  const [newStatus, setNewStatus] = useState<"pending" | "approved" | "rejected">(item.status);
  const [comment, setComment] = useState(item.status_comment || "");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const { toast } = useToast();

  const isBusiness = itemType === "business" && "business_name" in item;
  const isYoung = itemType === "beneficiary" && "nombre" in item;

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
      const endpoint = isBusiness
        ? `/api/admin/businesses/${(item as BusinessAccount).business_id}/status`
        : `/api/admin/beneficiaries/${(item as YoungBeneficiary).beneficiary_id}/status`;

      const response = await fetch(endpoint, {
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

      const result = await response.json();
      const emailMessage = result.emailSent
        ? "Email de notificación enviado"
        : newStatus === "pending"
        ? "Sin envío de email (estado pendiente)"
        : "No se pudo enviar el email de notificación";

      toast({
        title: "Éxito",
        description: `${isBusiness ? "Negocio" : "Beneficiario"} actualizado correctamente. ${emailMessage}`,
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
      const endpoint = isBusiness
        ? `/api/admin/businesses/${(item as BusinessAccount).business_id}`
        : `/api/admin/beneficiaries/${(item as YoungBeneficiary).beneficiary_id}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "x-admin-secret": adminSecret,
        },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar");
      }

      const result = await response.json();

      toast({
        title: "Eliminado",
        description: `${isBusiness ? "Negocio" : "Beneficiario"} "${result.businessName || result.nombre}" ha sido eliminado correctamente.`,
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
                  {isBusiness ? (
                    <Building2 className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
                  ) : (
                    <Users className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
                  )}
                  <h2 className="text-lg font-bold">
                    {isBusiness ? "Revisar Negocio" : "Revisar Joven Beneficiario"}
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
                  <h3 className="font-semibold text-lg">
                    {isBusiness ? (item as BusinessAccount).business_name : (item as YoungBeneficiary).nombre}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {isBusiness && (
                      <>
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="text-muted-foreground">Razón Social</p>
                            <p className="font-semibold">{(item as BusinessAccount).razon_social || (item as BusinessAccount).business_name}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Users className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="text-muted-foreground">Dueño / Responsable</p>
                            <p className="font-semibold">{(item as BusinessAccount).owner_name}</p>
                            {(item as BusinessAccount).cargo && <p className="text-muted-foreground text-xs mt-0.5">Cargo: {(item as BusinessAccount).cargo}</p>}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="text-muted-foreground">Email</p>
                            <p className="font-semibold break-all">{(item as BusinessAccount).email}</p>
                          </div>
                        </div>
                        {(item as BusinessAccount).phone && (
                          <div className="flex items-start gap-3">
                            <PhoneCall className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="text-muted-foreground">Teléfono</p>
                              <p className="font-semibold">{(item as BusinessAccount).phone}</p>
                            </div>
                          </div>
                        )}
                        {(item as BusinessAccount).tipoDescuento && (
                          <div className="flex items-start gap-3 sm:col-span-2">
                            <Tag className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="text-muted-foreground">Descuento o Beneficio Ofrecido</p>
                              <p className="font-bold text-green-700">{(item as BusinessAccount).tipoDescuento}</p>
                              {(item as BusinessAccount).restricciones && (
                                <p className="text-muted-foreground text-xs mt-1 bg-black/5 p-1.5 rounded">Términos: {(item as BusinessAccount).restricciones}</p>
                              )}
                            </div>
                          </div>
                        )}
                        {(item as BusinessAccount).category && (
                          <div className="flex items-start gap-3">
                            <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="text-muted-foreground">Categoría</p>
                              <p className="font-semibold">{(item as BusinessAccount).category}</p>
                            </div>
                          </div>
                        )}
                        {(item as BusinessAccount).redes_sociales && (
                          <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="text-muted-foreground">Red (Como se enteró)</p>
                              <p className="font-semibold capitalize">{(item as BusinessAccount).redes_sociales}</p>
                            </div>
                          </div>
                        )}
                        {(item as BusinessAccount).address && (
                          <div className="flex items-start gap-3 sm:col-span-2 border-t border-white/10 pt-3">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="text-muted-foreground">Dirección</p>
                              <p className="font-semibold">{(item as BusinessAccount).address}</p>
                              {(item as BusinessAccount).website && (
                                <a href={(item as BusinessAccount).website!} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-1 mt-1 text-xs">
                                  <Link2 className="w-3 h-3" /> Abrir Maps / Link
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {isYoung && (
                      <>
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="text-muted-foreground">CURP</p>
                            <p className="font-mono font-semibold">{(item as YoungBeneficiary).curp}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="text-muted-foreground">Email</p>
                            <p className="font-semibold break-all">{(item as YoungBeneficiary).email}</p>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-muted-foreground">Estado Actual</p>
                        <p className="font-semibold capitalize">{item.status}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Images */}
                  {isBusiness && (item as BusinessAccount).logo_url && (
                    <div className="border-t border-white/10 pt-6 space-y-4">
                      <p className="text-sm font-semibold">Archivos adjuntos</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            setSelectedImage({
                              src: (item as BusinessAccount).logo_url!,
                              alt: "Logo del negocio",
                            })
                          }
                          className="relative group"
                        >
                          <img
                            src={(item as BusinessAccount).logo_url!}
                            alt="Logo"
                            className="h-32 w-32 rounded-lg object-cover border-2 border-white/20 hover:border-white/40 transition-all"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Expand className="h-6 w-6 text-white" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 text-center font-semibold">Logo</p>
                        </motion.button>

                        {(item as BusinessAccount).local_photo_url && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              setSelectedImage({
                                src: (item as BusinessAccount).local_photo_url!,
                                alt: "Foto del establecimiento",
                              })
                            }
                            className="relative group"
                          >
                            <img
                              src={(item as BusinessAccount).local_photo_url!}
                              alt="Local"
                              className="h-32 w-32 rounded-lg object-cover border-2 border-white/20 hover:border-white/40 transition-all"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <Expand className="h-6 w-6 text-white" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 text-center font-semibold">
                              Establecimiento
                            </p>
                          </motion.button>
                        )}
                      </div>
                    </div>
                  )}
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
                    Eliminar {isBusiness ? "negocio" : "beneficiario"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Image Lightbox */}
          {selectedImage && (
            <ImageLightbox
              src={selectedImage.src}
              alt={selectedImage.alt}
              isOpen={!!selectedImage}
              onClose={() => setSelectedImage(null)}
            />
          )}

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
                        {isBusiness ? "Eliminar negocio" : "Eliminar beneficiario"}
                      </h3>
                    </div>

                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                      <p className="text-sm text-destructive">
                        Esta acción es irreversible. Se eliminará permanentemente{" "}
                        <strong className="font-semibold">
                          {isBusiness ? (item as BusinessAccount).business_name : (item as YoungBeneficiary).nombre}
                        </strong>{" "}
                        y todos sus datos asociados de la base de datos.
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
