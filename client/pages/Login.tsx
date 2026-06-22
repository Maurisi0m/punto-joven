import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Reveal } from "@/components/motion/Reveal";

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export default function Login() {
  const [status, setStatus] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setStatus(null);
    setBusinessName(null);
    try {
      const res = await fetch("/api/business/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.message ?? "Credenciales inválidas");
      }
      setStatus(body.status);
      setBusinessName(body.businessName);
      sessionStorage.setItem("business_id", body.businessId.toString());
      toast.success("Ingreso correcto");

      if (body.status === "approved") {
        setTimeout(() => navigate("/dashboard-negocio"), 800);
      }
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo iniciar sesión");
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <h1 className="text-3xl font-extrabold tracking-tight">Iniciar sesión</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Accede con el correo y contraseña que registraste para tu negocio y revisa el estatus de aprobación.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4 rounded-2xl border border-white/20 bg-white/70 p-6 shadow-lg backdrop-blur">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Correo electrónico</label>
            <input
              {...register("email")}
              type="email"
              className="input"
              placeholder="correo@negocio.com"
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Contraseña</label>
            <input
              {...register("password")}
              type="password"
              className="input"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full"
          >
            {isSubmitting ? "Validando..." : "Entrar"}
          </button>
        </form>

        {status && (
          <div className="mt-6 rounded-2xl border border-white/20 bg-white/60 p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Negocio: <span className="font-semibold text-foreground">{businessName}</span>
            </p>
            <p className="mt-1 text-sm">
              Estatus:{" "}
              <span className="font-semibold uppercase text-[hsl(var(--brand-primary))]">
                {status}
              </span>
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Si aparece pendiente, un administrador revisará tu solicitud. Si está aprobado, recibirás instrucciones adicionales.
            </p>
          </div>
        )}
      </Reveal>
    </main>
  );
}
