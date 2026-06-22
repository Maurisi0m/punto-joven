import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export default function LoginJoven() {
  const [status, setStatus] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setStatus(null);
    setNombre(null);
    try {
      const res = await fetch("/api/joven/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.message ?? "Credenciales inválidas");
      }
      setStatus(body.status);
      setNombre(body.nombre);
      toast.success("Ingreso correcto");
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo iniciar sesión");
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Jóvenes - Iniciar Sesión
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Accede con el correo y contraseña que registraste para revisar el estatus de tu solicitud como beneficiario del programa Punto Jóven.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-4 rounded-2xl border border-white/20 bg-white/70 p-6 shadow-lg backdrop-blur"
        >
          <div className="space-y-2">
            <label className="text-sm font-semibold">Correo electrónico</label>
            <input
              {...register("email")}
              type="email"
              className="input"
              placeholder="correo@ejemplo.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Contraseña</label>
            <input
              {...register("password")}
              type="password"
              className="input"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
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
              Beneficiario: <span className="font-semibold text-foreground">{nombre}</span>
            </p>
            <p className="mt-1 text-sm">
              Estatus:{" "}
              <span
                className={`font-semibold uppercase ${
                  status === "approved"
                    ? "text-green-600"
                    : status === "rejected"
                      ? "text-red-600"
                      : "text-[hsl(var(--brand-primary))]"
                }`}
              >
                {status === "approved" && "✓ Aprobado"}
                {status === "pending" && "En Revisión"}
                {status === "rejected" && "✗ Rechazado"}
              </span>
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {status === "approved" && (
                <>
                  ¡Felicidades! Tu solicitud fue aprobada. Recibirás instrucciones
                  para acceder a tus beneficios por correo.
                </>
              )}
              {status === "pending" && (
                <>
                  Tu solicitud está siendo revisada. Serás notificado por correo
                  cuando se haya completado la evaluación.
                </>
              )}
              {status === "rejected" && (
                <>
                  Desafortunadamente, tu solicitud fue rechazada. Si tienes dudas,
                  contacta al equipo de soporte.
                </>
              )}
            </p>
          </div>
        )}
      </Reveal>
    </main>
  );
}
