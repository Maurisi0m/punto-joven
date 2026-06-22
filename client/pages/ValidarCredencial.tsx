import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DigitalIDCard, type Beneficiary } from "@/components/DigitalIDCard";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

type UserData = {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  curp: string;
  email: string;
  foto_credencial_url?: string;
  status: "pending" | "approved" | "rejected";
  type: string;
};

export default function ValidarCredencial() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    fetch(`/api/public/validar/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Credencial no encontrada");
        }
        return res.json();
      })
      .then((data) => {
        setData(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[hsl(var(--brand-primary))]" />
        <p className="mt-4 text-lg font-medium text-foreground">Validando credencial...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
          <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-foreground">Error de Validación</h2>
        <p className="mt-2 text-muted-foreground">{error}</p>
      </div>
    );
  }

  const beneficiaryData: Beneficiary = {
    token: token || "",
    nombre: `${data.nombre} ${data.apellido_paterno} ${data.apellido_materno}`.trim(),
    curp: data.curp,
    email: data.email,
    fotoDataUrl: data.foto_credencial_url || null,
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-4xl flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[560px]"
      >
        {/* Status Banner */}
        <div
          className={`mb-8 flex items-center justify-center gap-3 rounded-2xl p-4 shadow-lg ${
            data.status === "approved"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : data.status === "pending"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {data.status === "approved" ? (
            <>
              <CheckCircle2 className="h-8 w-8" />
              <div>
                <h3 className="text-xl font-bold">CREDENCIAL VÁLIDA</h3>
                <p className="text-sm">El usuario está aprobado y activo.</p>
              </div>
            </>
          ) : data.status === "pending" ? (
            <>
              <AlertCircle className="h-8 w-8" />
              <div>
                <h3 className="text-xl font-bold">EN REVISIÓN</h3>
                <p className="text-sm">Esta credencial aún no está activa.</p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-8 w-8" />
              <div>
                <h3 className="text-xl font-bold">CREDENCIAL INVÁLIDA</h3>
                <p className="text-sm">El usuario ha sido rechazado o suspendido.</p>
              </div>
            </>
          )}
        </div>

        {/* Credencial View */}
        <DigitalIDCard data={beneficiaryData} />
      </motion.div>
    </div>
  );
}
