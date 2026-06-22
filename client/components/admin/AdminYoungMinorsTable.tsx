import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Eye, Check, X, AlertCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminStatusModalYoung from "./AdminStatusModalYoung";

interface YoungMinor {
  minor_id: number;
  token?: string;
  email: string;
  tutor_nombre: string;
  tutor_apellido_paterno: string;
  tutor_apellido_materno: string;
  tutor_curp: string;
  tutor_ine_url?: string;
  tutor_parentesco: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  curp: string;
  fecha_nacimiento: string;
  edad?: number;
  credencial_escolar_url?: string;
  foto_credencial_url?: string;
  municipio: string;
  estado: string;
  phone?: string;
  status: "pending" | "approved" | "rejected";
  status_comment?: string;
  created_at: string;
}

interface AdminYoungMinorsTableProps {
  minors: YoungMinor[];
  loading?: boolean;
  adminSecret?: string;
  onStatusChange?: () => void;
}

export default function AdminYoungMinorsTable({
  minors,
  loading = false,
  adminSecret = "",
  onStatusChange,
}: AdminYoungMinorsTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedMinor, setSelectedMinor] = useState<YoungMinor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <Check className="h-4 w-4" />;
      case "rejected":
        return <X className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Cargando menores de edad...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {minors.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No hay menores registrados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {minors.map((minor) => (
            <motion.div
              key={minor.minor_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-white/10 rounded-lg overflow-hidden bg-white/50 backdrop-blur"
            >
              <button
                onClick={() => setExpandedId(expandedId === minor.minor_id ? null : minor.minor_id)}
                className="w-full px-6 py-4 hover:bg-white/30 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {minor.nombre} {minor.apellido_paterno} {minor.apellido_materno}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Tutor: {minor.tutor_nombre} {minor.tutor_apellido_paterno}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {minor.municipio}, {minor.estado}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 ${getStatusColor(minor.status)}`}>
                    {getStatusIcon(minor.status)}
                    {minor.status === "approved" && "Aprobado"}
                    {minor.status === "rejected" && "Rechazado"}
                    {minor.status === "pending" && "Pendiente"}
                  </div>
                </div>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${expandedId === minor.minor_id ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {expandedId === minor.minor_id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-white/10"
                  >
                    <div className="p-6 space-y-6 bg-gradient-to-br from-white/30 to-white/10">
                      {/* Datos del menor */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Datos del Menor</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Nombre completo</p>
                            <p className="font-medium">{minor.nombre} {minor.apellido_paterno} {minor.apellido_materno}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">CURP</p>
                            <p className="font-medium">{minor.curp}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Fecha de nacimiento</p>
                            <p className="font-medium">{minor.fecha_nacimiento} ({minor.edad} años)</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Correo</p>
                            <p className="font-medium text-blue-600">{minor.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Datos del tutor */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Datos del Tutor/Padre</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Nombre completo</p>
                            <p className="font-medium">{minor.tutor_nombre} {minor.tutor_apellido_paterno} {minor.tutor_apellido_materno}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">CURP</p>
                            <p className="font-medium">{minor.tutor_curp}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-muted-foreground">Parentesco</p>
                            <p className="font-medium capitalize">{minor.tutor_parentesco}</p>
                          </div>
                        </div>
                      </div>

                      {/* Documentos */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Documentos y Fotos</h4>
                        {minor.tutor_ine_url || minor.credencial_escolar_url || minor.foto_credencial_url ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {minor.tutor_ine_url && (
                              <DocumentPreview
                                title="INE del Tutor"
                                url={minor.tutor_ine_url}
                                type="INE"
                                isImage={true}
                              />
                            )}
                            {minor.credencial_escolar_url && (
                              <DocumentPreview
                                title="Credencial Escolar"
                                url={minor.credencial_escolar_url}
                                type="Credencial"
                                isImage={true}
                              />
                            )}
                            {minor.foto_credencial_url && (
                              <DocumentPreview
                                title="Foto del Menor"
                                url={minor.foto_credencial_url}
                                type="Foto"
                                isImage={true}
                              />
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No hay documentos cargados</p>
                        )}
                      </div>

                      {/* Status */}
                      {minor.status !== "pending" && (
                        <div className="border-t border-white/10 pt-4">
                          <p className="text-sm text-muted-foreground mb-2">Comentario del admin:</p>
                          <p className="text-sm">{minor.status_comment || "Sin comentarios"}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="border-t border-white/10 pt-6 flex gap-3">
                        <Button
                          onClick={() => {
                            setSelectedMinor(minor);
                            setIsModalOpen(true);
                          }}
                          className="flex-1 bg-[hsl(var(--brand-primary))] hover:brightness-110"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Cambiar Estado
                        </Button>
                        {minor.status === "approved" && minor.token && (
                          <Button 
                            variant="outline"
                            onClick={() => {
                              window.open(`/buscar-tarjeta?token=${minor.token}`, "_blank");
                            }}
                            className="flex-1 border-[hsl(var(--brand-primary))] text-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary))/10]"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Credencial
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal for changing status */}
      {selectedMinor && (
        <AdminStatusModalYoung
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedMinor(null);
          }}
          item={selectedMinor}
          itemType="minor"
          adminSecret={adminSecret}
          onSuccess={() => {
            setIsModalOpen(false);
            setSelectedMinor(null);
            onStatusChange?.();
          }}
        />
      )}
    </div>
  );
}

function DocumentPreview({
  title,
  url,
  type,
  isImage = false,
}: {
  title: string;
  url: string;
  type: string;
  isImage?: boolean;
}) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="border border-white/20 rounded-lg p-4 bg-white/40">
      <p className="text-sm font-semibold text-foreground mb-3">{title}</p>
      {isImage ? (
        <div className="aspect-video bg-gray-100 rounded mb-3 overflow-hidden">
          <img src={url} alt={title} className="w-full h-full object-contain" />
        </div>
      ) : (
        <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400">
          <p className="text-sm">{type}</p>
        </div>
      )}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:underline"
      >
        <Eye className="h-4 w-4" />
        Ver documento
      </a>
    </div>
  );
}
