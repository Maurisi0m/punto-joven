import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Lock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) {
      setError("Por favor ingresa la clave de admin");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Verificar la clave haciendo una llamada a un endpoint protegido
      const response = await fetch("/api/admin/dashboard", {
        headers: { "x-admin-secret": secret },
      });

      if (!response.ok) {
        throw new Error("Clave de administrador inválida");
      }

      // Si es válido, guardar en localStorage y redirigir
      localStorage.setItem("admin_secret", secret);
      toast({
        title: "Éxito",
        description: "Acceso concedido al panel de administración",
      });
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al validar clave");
      setSecret("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/70 backdrop-blur-xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-full bg-[hsl(var(--brand-primary))]/10">
              <Shield className="h-6 w-6 text-[hsl(var(--brand-primary))]" />
            </div>
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
            <p className="text-sm text-muted-foreground">
              Ingresa tu clave de acceso administrativo
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-600"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold">Clave de Admin</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Ingresa tu ADMIN_SECRET"
                  value={secret}
                  onChange={(e) => {
                    setSecret(e.target.value);
                    setError(null);
                  }}
                  disabled={loading}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Esta clave se encuentra en tu archivo .env
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary))]/90 text-white font-semibold"
            >
              {loading ? "Verificando..." : "Acceder al Panel"}
            </Button>
          </form>

          {/* Footer */}
          <div className="border-t border-white/10 pt-6">
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>
                <strong>Nota:</strong> Esta clave se almacena localmente en tu navegador.
              </p>
              <p>
                Para salir del panel, cierra la sesión desde el dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 10 }}
          transition={{ delay: 0.2 }}
          className="mt-6 rounded-2xl border border-white/10 bg-white/50 p-4"
        >
          <h3 className="font-semibold text-sm mb-2">¿Primera vez?</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Si olvidaste tu clave, verifica el archivo .env en tu servidor.
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Variable:</strong> <code className="bg-black/20 px-2 py-1 rounded">ADMIN_SECRET</code>
          </p>
        </motion.div>
      </motion.div>
    </main>
  );
}
