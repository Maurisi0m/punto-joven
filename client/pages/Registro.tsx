import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  ArrowLeft,
  UploadCloud,
  IdCard,
  PhoneCall,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { JovenMenorForm, JovenMayorForm } from "./JovenForms";

const JOVEN_BG = "/assets/registro/joven-bg.png";
const NEGOCIO_BG = "/assets/registro/negocio-bg.png";
const JOVENES_MAYORES_BG = "/assets/registro/jovenesmayores.png";

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35 },
};

function ageFrom(date: string) {
  const d = new Date(date);
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

// Schemas
const jovenSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  apellido_paterno: z.string().min(2, "Mínimo 2 caracteres"),
  apellido_materno: z.string().min(2, "Mínimo 2 caracteres"),
  fecha_nacimiento: z.string().refine((v) => {
    const age = ageFrom(v);
    return age >= 14 && age <= 18;
  }, "Debes tener entre 14 y 18 años"),
  curp: z
    .string()
    .length(18, "CURP debe tener 18 caracteres")
    .regex(
      /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i,
      "CURP inválida",
    ),
  estudio: z.enum(["secundaria", "bachillerato", "universidad"], {
    errorMap: () => ({ message: "Selecciona un nivel de estudio" }),
  }),
  phone: z.string().regex(/^\d{10}$/g, "10 dígitos requeridos"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  calle: z.string().min(5, "Mínimo 5 caracteres"),
  colonia_depa: z.string().max(255).optional().or(z.literal("")),
  ciudad: z.string().min(2, "Mínimo 2 caracteres"),
  municipio: z.string().min(2, "Mínimo 2 caracteres"),
  estado: z.string().min(2, "Mínimo 2 caracteres"),
  acepta: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar términos" }),
  }),
});

// Schema para jóvenes MENORES de edad (12-17 años) - Requiere datos del padre/tutor
const jovenMenorSchema = z.object({
  // Datos del padre/tutor
  tutor_nombre: z.string().min(2, "Mínimo 2 caracteres"),
  tutor_apellido_paterno: z.string().min(2, "Mínimo 2 caracteres"),
  tutor_apellido_materno: z.string().min(2, "Mínimo 2 caracteres"),
  tutor_fecha_nacimiento: z.string().min(1, "Requerido"),
  tutor_curp: z
    .string()
    .length(18, "CURP debe tener 18 caracteres")
    .regex(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i, "CURP inválida"),
  tutor_parentesco: z.string().min(2, "Selecciona un parentesco"),
  tutor_ine: z.instanceof(FileList).refine((f) => f?.length === 1, "INE del tutor requerida"),
  tutor_domicilio: z.string().min(5, "Mínimo 5 caracteres"),

  // Datos del menor
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  apellido_paterno: z.string().min(2, "Mínimo 2 caracteres"),
  apellido_materno: z.string().min(2, "Mínimo 2 caracteres"),
  fecha_nacimiento: z.string().refine((v) => {
    const age = ageFrom(v);
    return age >= 12 && age <= 17;
  }, "Debes tener entre 12 y 17 años"),
  curp: z
    .string()
    .length(18, "CURP debe tener 18 caracteres")
    .regex(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i, "CURP inválida"),
  credencial_escolar: z.instanceof(FileList).refine((f) => f?.length === 1, "Credencial escolar requerida"),
  phone: z.string().regex(/^\d{10}$/g, "10 dígitos requeridos").optional().or(z.literal("")),
  calle: z.string().min(5, "Mínimo 5 caracteres"),
  municipio: z.string().min(2, "Mínimo 2 caracteres"),
  estado: z.string().min(2, "Mínimo 2 caracteres"),
  pais: z.string().min(2, "Mínimo 2 caracteres"),

  // Credenciales
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  foto_credencial: z.instanceof(FileList).refine((f) => f?.length === 1, "Foto para credencial requerida"),

  // Términos
  acepta: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar términos" }),
  }),
});

// Schema para jóvenes MAYORES de edad (18-29 años)
const jovenMayorSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  apellido_paterno: z.string().min(2, "Mínimo 2 caracteres"),
  apellido_materno: z.string().min(2, "Mínimo 2 caracteres"),
  fecha_nacimiento: z.string().refine((v) => {
    const age = ageFrom(v);
    return age >= 18 && age <= 29;
  }, "Debes tener entre 18 y 29 años"),
  curp: z
    .string()
    .length(18, "CURP debe tener 18 caracteres")
    .regex(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i, "CURP inválida"),
  grado_estudio: z.enum(["secundaria", "bachillerato", "universidad", "posgrado"], {
    errorMap: () => ({ message: "Selecciona un nivel de estudio" }),
  }),
  ocupacion: z.string().min(2, "Mínimo 2 caracteres"),
  phone: z.string().regex(/^\d{10}$/g, "10 dígitos requeridos"),
  calle: z.string().min(5, "Mínimo 5 caracteres"),
  municipio: z.string().min(2, "Mínimo 2 caracteres"),
  estado: z.string().min(2, "Mínimo 2 caracteres"),
  pais: z.string().min(2, "Mínimo 2 caracteres"),
  ine: z.instanceof(FileList).refine((f) => f?.length === 1, "INE requerida"),
  comprobante_domicilio: z.instanceof(FileList).refine((f) => f?.length === 1, "Comprobante de domicilio requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  foto_credencial: z.instanceof(FileList).refine((f) => f?.length === 1, "Foto para credencial requerida"),
  acepta: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar términos" }),
  }),
});

const negocioSchema = z
  .object({
    nombreComercial: z.string().min(2, "Mínimo 2 caracteres"),
    razonSocial: z.string().min(2, "Mínimo 2 caracteres"),
    giroNegocio: z.string().min(2, "Selecciona un giro"),
    otroGiro: z.string().optional(),
    direccion: z.string().min(5, "Mínimo 5 caracteres"),
    colonia: z.string().min(2, "Mínimo 2 caracteres"),
    referencia: z.string().min(5, "Mínimo 5 caracteres"),
    googleMapsLink: z.string().url("URL inválida"),
    nombreResponsable: z.string().min(3, "Mínimo 3 caracteres"),
    cargo: z.string().min(2, "Mínimo 2 caracteres"),
    telefono: z.string().regex(/^\d{10}$/g, "10 dígitos requeridos"),
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    redesSociales: z.string().min(2, "Selecciona una red social"),
    tipoDescuento: z.string().min(5, "Mínimo 5 caracteres"),
    restricciones: z.string().optional(),
    logo: z.instanceof(FileList).refine((f) => f?.length === 1, "Logo requerido"),
    fotoEstablecimiento: z
      .instanceof(FileList)
      .refine((f) => f?.length === 1, "Foto requerida"),
    acepta: z.literal(true, {
      errorMap: () => ({ message: "Debes aceptar términos" }),
    }),
  })
  .refine(
    (data) => {
      if (data.giroNegocio === "otro") return !!data.otroGiro;
      return true;
    },
    {
      message: "Especifica el giro del negocio",
      path: ["otroGiro"],
    },
  );

export default function Registro() {
  const [mode, setMode] = useState<"landing" | "joven-menor" | "joven-mayor" | "negocio" | "negocio-intro">("landing");
  const registroOptions = [
    {
      name: "Soy joven menor de edad",
      className: "md:col-span-2 min-h-[24rem] lg:min-h-[26rem]",
      background: (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={JOVEN_BG}
            alt="Jóvenes ingresando a edificio"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--brand-primary))/55] via-[hsl(var(--brand-secondary))/28] to-transparent mix-blend-multiply" />
          <div className="absolute -left-10 -top-12 h-52 w-52 rounded-full bg-white/50 blur-3xl" />
          <div className="absolute bottom-6 right-6 h-20 w-20 rounded-full bg-[hsl(var(--brand-primary))/40] blur-2xl" />
        </div>
      ),
      Icon: IdCard,
      description:
        "Para jóvenes de 12 a 17 años. Tu padre o tutor deberá completar el formulario con sus datos y los tuyos. Recibirás tu credencial digital después de la validación.",
      href: "#registro-joven-menor",
      cta: "Registrarme como joven menor",
      mode: "joven-menor" as const,
    },
    {
      name: "Soy comercio o negocio",
      className: "md:col-span-1 min-h-[24rem] lg:min-h-[26rem]",
      background: (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={NEGOCIO_BG}
            alt="Comercio afiliado"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--brand-secondary))/40] via-[hsl(var(--brand-primary))/30] to-transparent mix-blend-multiply" />
          <div className="absolute right-4 top-4 h-20 w-20 rounded-full bg-[hsl(var(--brand-secondary))/40] blur-2xl" />
        </div>
      ),
      Icon: Store,
      description:
        "Publica tus promociones y valida credenciales con respuesta inmediata y soporte dedicado.",
      href: "#registro-negocio",
      cta: "Registrar mi negocio",
      mode: "negocio" as const,
    },
    {
      name: "Soy joven mayor de edad",
      className: "md:col-span-1 min-h-[24rem] lg:min-h-[26rem]",
      background: (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={JOVENES_MAYORES_BG}
            alt="Jóvenes mayores"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--brand-primary))/40] via-[hsl(var(--brand-secondary))/30] to-transparent mix-blend-multiply" />
          <div className="absolute left-6 bottom-6 h-20 w-20 rounded-full bg-[hsl(var(--brand-primary))/40] blur-2xl" />
        </div>
      ),
      Icon: IdCard,
      description:
        "Para jóvenes de 18 a 29 años. Obtén tu credencial digital, QR y acceso a beneficios exclusivos. Registra tu INE y comprobante de domicilio.",
      href: "#registro-joven-mayor",
      cta: "Registrarme como joven mayor",
      mode: "joven-mayor" as const,
    },
  ];
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-white/40 to-white/20">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {mode === "landing" && (
            <motion.section key="landing" {...fade}>
              <h1 className="mb-8 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Elige cómo registrarte
              </h1>
              <BentoGrid className="grid-cols-1 md:grid-cols-3 auto-rows-[24rem] lg:auto-rows-[26rem]">
                {registroOptions.map(({ mode: nextMode, ...card }, index) => (
                  <motion.div
                    key={card.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                    className="relative"
                  >
                    <BentoCard
                      {...card}
                      onClick={(e) => {
                        if (nextMode) {
                          e.preventDefault();
                          if (nextMode === "negocio") {
                            setMode("negocio-intro");
                          } else if (nextMode === "joven-menor" || nextMode === "joven-mayor") {
                            setMode(nextMode);
                          } else {
                            setMode(nextMode);
                          }
                        }
                      }}
                    />
                    {card.name === "Soy joven menor de edad" && (
                      <div className="pointer-events-none absolute bottom-6 right-6 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-foreground/80 shadow">
                        Con datos del padre/madre/tutor
                      </div>
                    )}
                  </motion.div>
                ))}
              </BentoGrid>
            </motion.section>
          )}

          {mode === "joven-menor" && (
            <motion.section key="joven-menor" {...fade}>
              <Back onClick={() => setMode("landing")} />
              <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-4">
                <p className="text-sm font-semibold text-orange-900">
                  ⚠️ Importante: El padre, madre o tutor legal debe completar este formulario. Este registro requiere datos del tutor
                </p>
              </div>
              <h2 className="mb-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Registro de Joven con edad de 12 a 17 años
              </h2>
              <JovenMenorForm />
            </motion.section>
          )}

          {mode === "joven-mayor" && (
            <motion.section key="joven-mayor" {...fade}>
              <Back onClick={() => setMode("landing")} />
              <h2 className="mb-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Registro de Joven Mayor de Edad (18-29 años)
              </h2>
              <JovenMayorForm />
            </motion.section>
          )}

          {mode === "negocio-intro" && (
            <motion.section key="negocio-intro" {...fade}>
              <Back onClick={() => setMode("landing")} />
              <NegocioIntro onContinue={() => setMode("negocio")} />
            </motion.section>
          )}

          {mode === "negocio" && (
            <motion.section key="negocio" {...fade}>
              <Back onClick={() => setMode("negocio-intro")} />
              <h2 className="mb-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Registro de Comercio Afiliado
              </h2>
              <NegocioForm />
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function Back({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/50 px-3 py-2 text-sm font-semibold text-foreground/80 backdrop-blur hover:bg-white/70"
    >
      <ArrowLeft className="h-4 w-4" /> Volver
    </button>
  );
}

// JOVEN FORM
function JovenForm() {
  const [step, setStep] = useState(0);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof jovenSchema>>({
    resolver: zodResolver(jovenSchema),
  });

  const onSubmit = async (data: z.infer<typeof jovenSchema>) => {
    try {
      const res = await fetch("/api/joven/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.message ?? "No se pudo enviar el registro");
      }

      toast.success(
        body?.message ?? "Registro exitoso. En breve recibirás un correo."
      );
      setTimeout(() => {
        window.location.href = "/";
      }, 400);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "No se pudo registrar. Intenta de nuevo.");
    }
  };

  const fecha_nacimiento = watch("fecha_nacimiento");
  const edad = useMemo(
    () => (fecha_nacimiento ? ageFrom(fecha_nacimiento) : undefined),
    [fecha_nacimiento],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
      <Steps step={step} setStep={setStep} total={4} />

      {step === 0 && (
        <Card>
          <h3 className="mb-8 text-center font-display text-3xl font-bold tracking-tight text-[hsl(var(--brand-primary))]">
            Información Personal
          </h3>
          <div className="space-y-6">
            <Field label="Nombre" error={errors.nombre?.message}>
              <input
                {...register("nombre")}
                className="input"
                placeholder="Ej. María"
              />
            </Field>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Apellido Paterno" error={errors.apellido_paterno?.message}>
                <input
                  {...register("apellido_paterno")}
                  className="input"
                  placeholder="Ej. López"
                />
              </Field>
              <Field label="Apellido Materno" error={errors.apellido_materno?.message}>
                <input
                  {...register("apellido_materno")}
                  className="input"
                  placeholder="Ej. García"
                />
              </Field>
            </div>
            <Field label="Fecha de nacimiento" error={errors.fecha_nacimiento?.message}>
              <input
                type="date"
                {...register("fecha_nacimiento")}
                className="input"
              />
              {edad !== undefined && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Edad: {edad} años
                </p>
              )}
            </Field>
          </div>
          <div className="flex justify-end pt-6">
            <Next onClick={() => setStep(1)} />
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <h3 className="mb-8 text-center font-display text-3xl font-bold tracking-tight text-[hsl(var(--brand-primary))]">
            Datos de Identificación
          </h3>
          <div className="space-y-6">
            <Field label="CURP" error={errors.curp?.message}>
              <input
                {...register("curp")}
                className="input uppercase"
                placeholder="EJ. LOPG000101HDFRML00"
                maxLength={18}
              />
            </Field>
            <Field label="¿Qué estudias?" error={errors.estudio?.message}>
              <select {...register("estudio")} className="input">
                <option value="">Selecciona una opción</option>
                <option value="secundaria">Secundaria</option>
                <option value="bachillerato">Bachillerato</option>
                <option value="universidad">Universidad</option>
              </select>
            </Field>
            <Field label="Número telefónico" error={errors.phone?.message}>
              <input
                {...register("phone")}
                className="input"
                placeholder="10 dígitos"
                maxLength={10}
              />
            </Field>
          </div>
          <div className="flex justify-between pt-6">
            <BackSmall onClick={() => setStep(0)} />
            <Next onClick={() => setStep(2)} />
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <h3 className="mb-8 text-center font-display text-3xl font-bold tracking-tight text-[hsl(var(--brand-primary))]">
            Domicilio
          </h3>
          <div className="space-y-6">
            <Field label="Calle y número" error={errors.calle?.message}>
              <input
                {...register("calle")}
                className="input"
                placeholder="Ej. Avenida Benito Juárez 100"
              />
            </Field>
            <Field label="Colonia o Departamento (opcional)" error={errors.colonia_depa?.message}>
              <input
                {...register("colonia_depa")}
                className="input"
                placeholder="Ej. Centro Histórico"
              />
            </Field>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Ciudad" error={errors.ciudad?.message}>
                <input
                  {...register("ciudad")}
                  className="input"
                  placeholder="Ej. Pachuca de Soto"
                />
              </Field>
              <Field label="Municipio" error={errors.municipio?.message}>
                <input
                  {...register("municipio")}
                  className="input"
                  placeholder="Ej. Pachuca"
                />
              </Field>
            </div>
            <Field label="Estado" error={errors.estado?.message}>
              <input
                {...register("estado")}
                className="input"
                placeholder="Ej. Hidalgo"
              />
            </Field>
          </div>
          <div className="flex justify-between pt-6">
            <BackSmall onClick={() => setStep(1)} />
            <Next onClick={() => setStep(3)} />
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <h3 className="mb-8 text-center font-display text-3xl font-bold tracking-tight text-[hsl(var(--brand-primary))]">
            Acceso a tu Cuenta
          </h3>
          <div className="space-y-6">
            <Field label="Correo electrónico" error={errors.email?.message}>
              <input
                {...register("email")}
                className="input"
                placeholder="correo@ejemplo.com"
              />
            </Field>
            <Field label="Contraseña" error={errors.password?.message}>
              <input
                type="password"
                {...register("password")}
                className="input"
                placeholder="Mínimo 8 caracteres"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Úsala para iniciar sesión y ver si tu solicitud fue aprobada.
              </p>
            </Field>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border-3 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 p-6"
            >
              <h4 className="mb-3 font-display text-lg font-bold text-amber-900">
                Términos y Condiciones
              </h4>
              <p className="mb-5 text-sm text-amber-900 leading-relaxed">
                Declaro que tengo entre 12 y 18 años, que la información proporcionada
                es verídica y acepto formar parte del programa Punto Jóven, autorizando
                al Instituto Municipal para la Juventud a utilizar mis datos de manera
                responsable y confidencial.
              </p>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  {...register("acepta")}
                  className="mt-1 h-5 w-5 rounded accent-[hsl(var(--brand-primary))]"
                />
                <span className="font-semibold text-amber-900">
                  Acepto los términos y condiciones del programa
                </span>
              </label>
              {errors.acepta && (
                <p className="mt-3 text-sm text-red-600">{errors.acepta.message}</p>
              )}
            </motion.div>
          </div>

          <div className="flex justify-between pt-6">
            <BackSmall onClick={() => setStep(2)} />
            <button
              disabled={isSubmitting}
              type="submit"
              className="btn-primary"
            >
              {isSubmitting ? "Registrando..." : "Finalizar Registro"}
            </button>
          </div>
        </Card>
      )}
    </form>
  );
}

// NEGOCIO FORM
function NegocioForm() {
  const [step, setStep] = useState(0);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof negocioSchema>>({
    resolver: zodResolver(negocioSchema),
  });

  const giroNegocio = watch("giroNegocio");
  const redesSociales = watch("redesSociales");

  const onSubmit = async (data: z.infer<typeof negocioSchema>) => {
    try {
      const formData = new FormData();

      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("businessName", data.nombreComercial);
      formData.append("razonSocial", data.razonSocial);
      formData.append("ownerName", data.nombreResponsable);
      formData.append("cargo", data.cargo);
      formData.append("phone", data.telefono || "");
      formData.append("category", data.giroNegocio === "otro" ? data.otroGiro : data.giroNegocio);
      formData.append("redesSociales", data.redesSociales);
      formData.append("address", `${data.direccion}, Col. ${data.colonia}. Ref: ${data.referencia}`);
      formData.append("city", "");
      formData.append("state", "");
      formData.append("zip", "");
      formData.append("website", data.googleMapsLink);
      formData.append("tipoDescuento", data.tipoDescuento);
      formData.append("restricciones", data.restricciones || "");

      if (data.logo?.length) {
        formData.append("logo", data.logo[0]);
      }
      if (data.fotoEstablecimiento?.length) {
        formData.append("fotoEstablecimiento", data.fotoEstablecimiento[0]);
      }

      const res = await fetch("/api/business/register", {
        method: "POST",
        body: formData,
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.message ?? "No se pudo enviar la solicitud");
      }

      toast.success(
        body?.message ?? "Solicitud enviada. Te contactaremos por correo",
      );
      setTimeout(() => {
        window.location.href = "/";
      }, 400);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo enviar el registro. Intenta de nuevo.");
    }
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (v: string | null) => void,
  ) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("La imagen supera 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const giroOptions = [
    { value: "alimentos", label: "Alimentos y bebidas" },
    { value: "ropa", label: "Ropa y calzado" },
    { value: "educacion", label: "Educación / cursos" },
    { value: "servicios", label: "Servicios (peluquería, estética, taller, etc.)" },
    { value: "salud", label: "Salud y bienestar (gimnasios, spas, clínicas, ópticas, etc.)" },
    { value: "entretenimiento", label: "Entretenimiento y cultura" },
    { value: "tecnologia", label: "Tecnología / accesorios" },
    { value: "otro", label: "Otro" },
  ];

  const redesOptions = [
    { value: "tiktok", label: "TikTok" },
    { value: "instagram", label: "Instagram" },
    { value: "facebook", label: "Facebook" },
    { value: "twitter", label: "X (Twitter)" },
    { value: "reddit", label: "Reddit" },
    { value: "maps", label: "Google Maps" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8">
      <Steps step={step} setStep={setStep} total={4} />

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" {...fade}>
            <Card>
              <h3 className="mb-8 text-center font-display text-4xl font-bold tracking-tight text-[hsl(var(--brand-primary))]">
                Información Básica del Negocio
              </h3>
              <div className="grid gap-8 sm:grid-cols-2">
                <Field
                  label="Nombre comercial del establecimiento"
                  error={errors.nombreComercial?.message}
                >
                  <input
                    {...register("nombreComercial")}
                    className="input text-base"
                    placeholder="Ej. La Parroquia Centro"
                  />
                </Field>
                <Field
                  label="Razón social"
                  error={errors.razonSocial?.message}
                >
                  <input
                    {...register("razonSocial")}
                    className="input text-base"
                    placeholder="Ej. María López García"
                  />
                </Field>
              </div>
              <div className="mt-[41px] rounded-2xl border-2 border-[hsl(var(--brand-primary))/35] bg-white/50 p-5 transition-all hover:border-[hsl(var(--brand-primary))/60] hover:shadow-md">
                <label className="mb-4 block text-lg font-bold text-[hsl(var(--brand-primary))]">
                  Giro del negocio
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {giroOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setValue("giroNegocio", option.value)}
                      className={`rounded-xl border-2 px-4 py-3 text-left font-medium transition-all ${giroNegocio === option.value
                        ? "border-[hsl(var(--brand-primary))] bg-[hsl(var(--brand-primary))/10] text-[hsl(var(--brand-primary))]"
                        : "border-white/20 bg-white/40 text-foreground/80 hover:border-white/40 hover:bg-white/60"
                        }`}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
                {errors.giroNegocio && (
                  <p className="mt-3 text-sm text-red-600 font-medium">
                    {errors.giroNegocio.message}
                  </p>
                )}
              </div>
              {giroNegocio === "otro" && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <Field
                    label="Especifica el giro del negocio"
                    error={errors.otroGiro?.message}
                  >
                    <input
                      {...register("otroGiro")}
                      className="input text-base"
                      placeholder="Describe tu giro de negocio"
                    />
                  </Field>
                </motion.div>
              )}
              <div className="flex justify-end pt-4">
                <Next onClick={() => setStep(1)} />
              </div>
            </Card>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step1" {...fade}>
            <Card>
              <h3 className="mb-8 text-center font-display text-4xl font-bold tracking-tight text-[hsl(var(--brand-primary))]">
                Ubicación del Establecimiento
              </h3>
              <div className="space-y-8">
                <Field label="Dirección completa" error={errors.direccion?.message}>
                  <input
                    {...register("direccion")}
                    className="input text-base"
                    placeholder="Ej. Avenida Benito Juárez 100"
                  />
                </Field>
                <div className="grid gap-8 sm:grid-cols-2">
                  <Field label="Colonia o zona" error={errors.colonia?.message}>
                    <input
                      {...register("colonia")}
                      className="input text-base"
                      placeholder="Ej. Centro histórico"
                    />
                  </Field>
                  <Field
                    label="Referencia de ubicación"
                    error={errors.referencia?.message}
                  >
                    <input
                      {...register("referencia")}
                      className="input text-base"
                      placeholder="Ej. Cerca de la plaza principal"
                    />
                  </Field>
                </div>
                <Field
                  label="Link de ubicación de Google Maps"
                  error={errors.googleMapsLink?.message}
                >
                  <input
                    {...register("googleMapsLink")}
                    className="input text-base"
                    placeholder="https://maps.google.com/..."
                  />
                </Field>
              </div>
              <div className="flex justify-between pt-6">
                <BackSmall onClick={() => setStep(0)} />
                <Next onClick={() => setStep(2)} />
              </div>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" {...fade}>
            <Card>
              <h3 className="mb-8 text-center font-display text-4xl font-bold tracking-tight text-[hsl(var(--brand-primary))]">
                Responsable del Negocio
              </h3>
              <div className="space-y-8">
                <div className="grid gap-8 sm:grid-cols-2">
                  <Field
                    label="Nombre completo del responsable"
                    error={errors.nombreResponsable?.message}
                  >
                    <input
                      {...register("nombreResponsable")}
                      className="input text-base"
                      placeholder="Ej. María Fernanda López"
                    />
                  </Field>
                  <Field label="Cargo" error={errors.cargo?.message}>
                    <input
                      {...register("cargo")}
                      className="input text-base"
                      placeholder="Ej. Gerente, Propietario"
                    />
                  </Field>
                </div>
                <div className="grid gap-8 sm:grid-cols-2">
                  <Field label="Número telefónico" error={errors.telefono?.message}>
                    <input
                      {...register("telefono")}
                      className="input text-base"
                      placeholder="10 dígitos"
                    />
                  </Field>
                  <Field label="Correo electrónico" error={errors.email?.message}>
                    <input
                      {...register("email")}
                      className="input text-base"
                      placeholder="correo@negocio.com"
                    />
                  </Field>
                </div>
                <div className="rounded-2xl border-2 border-[hsl(var(--brand-primary))/35] bg-white/50 p-5 transition-all hover:border-[hsl(var(--brand-primary))/60] hover:shadow-md">
                  <label className="mb-4 block text-lg font-bold text-[hsl(var(--brand-primary))]">
                    Redes sociales del negocio
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {redesOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setValue("redesSociales", option.value)}
                        className={`rounded-xl border-2 px-4 py-3 text-left font-medium transition-all ${redesSociales === option.value
                          ? "border-[hsl(var(--brand-secondary))] bg-[hsl(var(--brand-secondary))/10] text-[hsl(var(--brand-secondary))]"
                          : "border-white/20 bg-white/40 text-foreground/80 hover:border-white/40 hover:bg-white/60"
                          }`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                  {errors.redesSociales && (
                    <p className="mt-3 text-sm text-red-600 font-medium">
                      {errors.redesSociales.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-between pt-6">
                <BackSmall onClick={() => setStep(1)} />
                <Next onClick={() => setStep(3)} />
              </div>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" {...fade}>
            <Card>
              <h3 className="mb-8 text-center font-display text-4xl font-bold tracking-tight text-[hsl(var(--brand-primary))]">
                Beneficios e Imágenes
              </h3>
              <div className="space-y-8">
                <Field
                  label="Tipo de beneficiario o descuento que ofrecerán"
                  error={errors.tipoDescuento?.message}
                >
                  <input
                    {...register("tipoDescuento")}
                    className="input text-base"
                    placeholder="Ej. 15% de descuento en toda la tienda, Consumo gratis al gastar $500, etc."
                  />
                </Field>
                <Field
                  label="Restricciones o condiciones (opcional)"
                  error={errors.restricciones?.message}
                >
                  <textarea
                    {...register("restricciones")}
                    className="input resize-none text-base"
                    rows={4}
                    placeholder="Ej. Válido de lunes a viernes, no acumulable con otras ofertas, etc."
                  />
                </Field>
                <Field
                  label="Asigna una contraseña para tu cuenta"
                  error={errors.password?.message}
                >
                  <input
                    type="password"
                    {...register("password")}
                    className="input text-base"
                    placeholder="Mínimo 8 caracteres"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Úsala para iniciar sesión y ver si tu negocio fue aprobado.
                  </p>
                </Field>

                <div className="rounded-2xl border-2 border-[hsl(var(--brand-primary))/35] bg-white/50 p-5 transition-all hover:border-[hsl(var(--brand-primary))/60] hover:shadow-md">
                  <label className="mb-4 block text-lg font-bold text-[hsl(var(--brand-primary))]">
                    Imágenes y Documentos
                  </label>
                  <div className="grid gap-8 sm:grid-cols-2">
                    <div className="space-y-3">
                      <label className="text-base font-semibold">
                        Logotipo del negocio
                      </label>
                      <div className="grid h-56 place-items-center rounded-2xl border-3 border-dashed border-[hsl(var(--brand-primary))/40] bg-gradient-to-br from-[hsl(var(--brand-primary))/5] to-white/40 text-center text-sm text-muted-foreground">
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="logo-preview"
                            className="h-full w-full rounded-2xl object-contain p-2"
                          />
                        ) : (
                          <div className="px-6">
                            <UploadCloud className="mx-auto mb-2 h-8 w-8" />
                            <p className="font-medium">JPG, JPEG o PNG (máx 5MB)</p>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        className="block w-full text-sm"
                        {...register("logo", {
                          onChange: (e) => {
                            handleImageChange(e, setLogoPreview);
                          }
                        })}
                      />
                      {errors.logo && (
                        <p className="text-sm text-red-600 font-medium">{errors.logo.message}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="text-base font-semibold">
                        Foto del establecimiento o producto principal
                      </label>
                      <div className="grid h-56 place-items-center rounded-2xl border-3 border-dashed border-[hsl(var(--brand-secondary))/40] bg-gradient-to-br from-[hsl(var(--brand-secondary))/5] to-white/40 text-center text-sm text-muted-foreground">
                        {fotoPreview ? (
                          <img
                            src={fotoPreview}
                            alt="foto-preview"
                            className="h-full w-full rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="px-6">
                            <UploadCloud className="mx-auto mb-2 h-8 w-8" />
                            <p className="font-medium">JPG, JPEG o PNG (máx 5MB)</p>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        className="block w-full text-sm"
                        {...register("fotoEstablecimiento", {
                          onChange: (e) => {
                            handleImageChange(e, setFotoPreview);
                          }
                        })}
                      />
                      {errors.fotoEstablecimiento && (
                        <p className="text-sm text-red-600 font-medium">
                          {errors.fotoEstablecimiento.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border-3 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 p-6"
                >
                  <h4 className="mb-3 font-display text-xl font-bold text-amber-900">
                    Declaración de compromiso
                  </h4>
                  <p className="mb-5 text-base text-amber-900 leading-relaxed">
                    Declaro que la información proporcionada es verídica y acepto
                    formar parte del programa Punto Jóven, autorizando al Instituto
                    Municipal para la Juventud de Pachuca a utilizar el nombre e
                    imagen de mi negocio para fines de difusión del programa.
                  </p>
                  <label className="flex items-start gap-3 text-base">
                    <input
                      type="checkbox"
                      {...register("acepta")}
                      className="mt-1 h-5 w-5 rounded accent-[hsl(var(--brand-primary))]"
                    />
                    <span className="font-semibold text-amber-900">Acepto los términos</span>
                  </label>
                  {errors.acepta && (
                    <p className="mt-3 text-sm text-red-600">{errors.acepta.message}</p>
                  )}
                </motion.div>
              </div>

              <div className="flex justify-between pt-6">
                <BackSmall onClick={() => setStep(2)} />
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="btn-primary text-base"
                >
                  {isSubmitting ? "Enviando..." : "Enviar solicitud"}
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

// NEGOCIO INTRO SECTION
function NegocioIntro({ onContinue }: { onContinue: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-4xl"
    >
      {/* Main Card */}
      <div className="card-gradient-border rounded-3xl bg-gradient-to-br from-white/80 to-white/60 p-8 sm:p-12 shadow-2xl backdrop-blur-xl overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-[hsl(var(--brand-secondary))/15] blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-[hsl(var(--brand-primary))/15] blur-3xl" />

        <div className="relative z-10 space-y-8">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center"
          >
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fce1f4688001c4a1985ce4f6d708c72b7%2Fc0d19e0d14bf41e39f0ec977a69aeedd?format=webp&width=800"
              alt="Punto Jóven Logo"
              className="h-20 sm:h-28 w-auto drop-shadow-lg"
            />
          </motion.div>

          {/* Header */}
          <div className="text-center space-y-3">
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[hsl(var(--brand-primary))]">
              Formulario de Registro
            </h2>
            <p className="text-lg sm:text-xl font-semibold text-[hsl(var(--brand-secondary))]">
              Programa Aliados
            </p>
          </div>

          {/* Main message */}
          <div className="rounded-2xl border-2 border-[hsl(var(--brand-primary))/25] bg-gradient-to-br from-[hsl(var(--brand-primary))/8] to-[hsl(var(--brand-secondary))/8] p-8 space-y-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--brand-primary))]">
              ¡Forma parte de Punto Jóven!
            </h3>

            <div className="space-y-4 text-base sm:text-lg text-foreground leading-relaxed">
              <p>
                <span className="font-semibold text-[hsl(var(--brand-primary))]">
                  El Instituto Municipal para la Juventud de Pachuca
                </span>
                {" "}te invita a sumarte a esta red de negocios aliados que brindan descuentos y beneficios exclusivos a jóvenes del municipio.
              </p>

              <p>
                Con tu participación, podrás{" "}
                <span className="font-semibold text-[hsl(var(--brand-secondary))]">
                  promocionar tu negocio gratuitamente
                </span>
                , atraer nuevos clientes y ser identificado con el distintivo oficial{" "}
                <span className="font-bold text-[hsl(var(--brand-primary))]">
                  "Establecimiento Punto Jóven"
                </span>
                .
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <p className="text-lg font-semibold text-[hsl(var(--brand-primary))]">
              ¿Qué sigue?
            </p>
            <div className="rounded-2xl border-2 border-emerald-300/50 bg-gradient-to-br from-emerald-50/60 to-green-50/40 p-6 space-y-4">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <p className="text-base text-emerald-900 font-medium pt-1">
                  Completa este formulario con los datos de tu establecimiento
                </p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <p className="text-base text-emerald-900 font-medium pt-1">
                  Una vez validada tu información, el Instituto se pondrá en contacto contigo
                </p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <p className="text-base text-emerald-900 font-medium pt-1">
                  Formaliza tu registro y comienza a disfrutar de los beneficios
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <motion.button
              onClick={onContinue}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 btn-primary text-lg py-4 px-6"
            >
              Continuar con el Registro
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// UI helpers
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="card-gradient-border rounded-3xl bg-gradient-to-br from-white/75 to-white/60 p-10 shadow-2xl backdrop-blur-xl">
      {children}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border-2 border-[hsl(var(--brand-primary))/35] bg-white/50 p-5 transition-all hover:border-[hsl(var(--brand-primary))/60] hover:shadow-md">
      <label className="mb-4 block text-lg font-bold text-[hsl(var(--brand-primary))]">{label}</label>
      {children}
      {error && <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}

function Steps({
  step,
  setStep,
  total,
}: {
  step: number;
  setStep: (n: number) => void;
  total: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {Array.from({ length: total }).map((_, i) => (
          <motion.button
            key={i}
            type="button"
            onClick={() => setStep(i)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`h-3 flex-1 rounded-full transition-all ${i === step
              ? "bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))]"
              : i < step
                ? "bg-[hsl(var(--brand-primary))]"
                : "bg-foreground/15"
              }`}
          />
        ))}
      </div>
      <p className="text-center text-sm font-medium text-foreground/70">
        Paso {step + 1} de {total}
      </p>
    </div>
  );
}

function Next({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="btn-primary text-base px-6 py-3"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Continuar
    </motion.button>
  );
}

function BackSmall({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="rounded-xl border-2 border-white/30 bg-white/60 px-5 py-2 text-base font-semibold hover:bg-white/80 transition-all"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Atrás
    </motion.button>
  );
}

// minimal tailwind utilities
// Using classes composed here for brevity
declare module "react" {
  // no-op to avoid TS isolatedModules complaint for file-level declarations
  interface CSSProperties { }
}

// tailwind component classes
// .input and .btn-primary are utility shortcuts
// (composed of existing Tailwind utilities)
const _unused = 0;
