import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Eye, Check, X, AlertCircle, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminStatusModalYoung from "./AdminStatusModalYoung";

interface YoungAdult {
  beneficiary_id: number;
  token?: string;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  curp: string;
  fecha_nacimiento: string;
  edad?: number;
  grado_estudio: string;
  ocupacion: string;
  phone: string;
  calle: string;
  municipio: string;
  estado: string;
  pais: string;
  ine_url?: string;
  comprobante_domicilio_url?: string;
  foto_credencial_url?: string;
  status: "pending" | "approved" | "rejected";
  status_comment?: string;
  created_at: string;
}

interface AdminYoungAdultsTableProps {
  adults: YoungAdult[];
  loading?: boolean;
  adminSecret?: string;
  onStatusChange?: () => void;
}

export default function AdminYoungAdultsTable({
  adults,
  loading = false,
  adminSecret = "",
  onStatusChange,
}: AdminYoungAdultsTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedAdult, setSelectedAdult] = useState<YoungAdult | null>(null);
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

  const getGradoEstudioLabel = (grado: string) => {
    const labels: { [key: string]: string } = {
      secundaria: "Secundaria",
      bachillerato: "Bachillerato",
      universidad: "Universidad",
      posgrado: "Posgrado",
    };
    return labels[grado] || grado;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Cargando mayores de edad...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {adults.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No hay mayores de edad registrados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {adults.map((adult) => (
            <motion.div
              key={adult.beneficiary_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-white/10 rounded-lg overflow-hidden bg-white/50 backdrop-blur"
            >
              <button
                onClick={() => setExpandedId(expandedId === adult.beneficiary_id ? null : adult.beneficiary_id)}
                className="w-full px-6 py-4 hover:bg-white/30 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {adult.nombre} {adult.apellido_paterno} {adult.apellido_materno}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {adult.ocupacion} • {getGradoEstudioLabel(adult.grado_estudio)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {adult.municipio}, {adult.estado}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 ${getStatusColor(adult.status)}`}>
                    {getStatusIcon(adult.status)}
                    {adult.status === "approved" && "Aprobado"}
                    {adult.status === "rejected" && "Rechazado"}
                    {adult.status === "pending" && "Pendiente"}
                  </div>
                </div>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${expandedId === adult.beneficiary_id ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {expandedId === adult.beneficiary_id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-white/10"
                  >
                    <div className="p-6 space-y-6 bg-gradient-to-br from-white/30 to-white/10">
                      {/* Datos personales */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Datos Personales</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Nombre completo</p>
                            <p className="font-medium">{adult.nombre} {adult.apellido_paterno} {adult.apellido_materno}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">CURP</p>
                            <p className="font-medium">{adult.curp}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Edad</p>
                            <p className="font-medium">{adult.edad} años ({adult.fecha_nacimiento})</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Teléfono</p>
                            <p className="font-medium">{adult.phone}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Correo</p>
                            <p className="font-medium text-blue-600">{adult.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Educación y Ocupación */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Educación y Ocupación</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Grado máximo de estudio</p>
                            <p className="font-medium">{getGradoEstudioLabel(adult.grado_estudio)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Ocupación</p>
                            <p className="font-medium">{adult.ocupacion}</p>
                          </div>
                        </div>
                      </div>

                      {/* Domicilio */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Domicilio</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="col-span-2">
                            <p className="text-muted-foreground">Dirección</p>
                            <p className="font-medium">{adult.calle}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Municipio</p>
                            <p className="font-medium">{adult.municipio}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Estado</p>
                            <p className="font-medium">{adult.estado}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-muted-foreground">País</p>
                            <p className="font-medium">{adult.pais}</p>
                          </div>
                        </div>
                      </div>

                      {/* Documentos */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Documentos y Fotos</h4>
                        {adult.ine_url || adult.comprobante_domicilio_url || adult.foto_credencial_url ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {adult.ine_url && (
                              <DocumentPreview
                                title="INE"
                                url={adult.ine_url}
                                type="INE"
                                isImage={true}
                              />
                            )}
                            {adult.comprobante_domicilio_url && (
                              <DocumentPreview
                                title="Comprobante de Domicilio"
                                url={adult.comprobante_domicilio_url}
                                type="Comprobante"
                                isImage={true}
                              />
                            )}
                            {adult.foto_credencial_url && (
                              <DocumentPreview
                                title="Foto del Joven"
                                url={adult.foto_credencial_url}
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
                      {adult.status !== "pending" && (
                        <div className="border-t border-white/10 pt-4">
                          <p className="text-sm text-muted-foreground mb-2">Comentario del admin:</p>
                          <p className="text-sm">{adult.status_comment || "Sin comentarios"}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="border-t border-white/10 pt-6 flex gap-3">
                        <Button
                          onClick={() => {
                            setSelectedAdult(adult);
                            setIsModalOpen(true);
                          }}
                          className="flex-1 bg-[hsl(var(--brand-primary))] hover:brightness-110"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Cambiar Estado
                        </Button>
                        {adult.status === "approved" && adult.token && (
                          <Button 
                            variant="outline"
                            onClick={() => {
                              window.open(`/buscar-tarjeta?token=${adult.token}`, "_blank");
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
      {selectedAdult && (
        <AdminStatusModalYoung
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAdult(null);
          }}
          item={selectedAdult}
          itemType="adult"
          adminSecret={adminSecret}
          onSuccess={() => {
            setIsModalOpen(false);
            setSelectedAdult(null);
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
