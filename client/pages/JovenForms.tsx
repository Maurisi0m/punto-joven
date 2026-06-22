import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CameraCapture } from "@/components/CameraCapture";

// Función auxiliar para calcular edad
function ageFrom(date: string) {
  const d = new Date(date);
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

// Función para validar tamaño de archivo (máx 12MB)
function validateFileSize(files: FileList | undefined, maxMB: number = 12) {
  if (!files || files.length === 0) return true;
  const maxBytes = maxMB * 1024 * 1024;
  return files[0].size <= maxBytes;
}

// Schemas
const jovenMenorSchema = z.object({
  // Datos del padre/tutor
  tutor_nombre: z.string().min(2, "Mínimo 2 caracteres"),
  tutor_apellido_paterno: z.string().min(2, "Mínimo 2 caracteres"),
  tutor_apellido_materno: z.string().min(2, "Mínimo 2 caracteres"),
  tutor_fecha_nacimiento: z.string().min(1, "Requerido"),
  tutor_curp: z.string().length(18, "CURP debe tener 18 caracteres").regex(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i, "CURP inválida"),
  tutor_parentesco: z.string().min(2, "Selecciona un parentesco"),
  tutor_ine: z.instanceof(FileList).refine((f) => f?.length === 1, "INE del tutor requerida").refine((f) => validateFileSize(f, 12), "Máximo 12MB"),
  tutor_domicilio: z.string().min(5, "Mínimo 5 caracteres"),

  // Datos del menor
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  apellido_paterno: z.string().min(2, "Mínimo 2 caracteres"),
  apellido_materno: z.string().min(2, "Mínimo 2 caracteres"),
  fecha_nacimiento: z.string().refine((v) => {
    const age = ageFrom(v);
    return age >= 12 && age <= 17;
  }, "Debes tener entre 12 y 17 años"),
  curp: z.string().length(18, "CURP debe tener 18 caracteres").regex(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i, "CURP inválida"),
  credencial_escolar: z.instanceof(FileList).refine((f) => f?.length === 1, "Credencial escolar requerida").refine((f) => validateFileSize(f, 12), "Máximo 12MB"),
  phone: z.string().regex(/^\d{10}$/g, "10 dígitos requeridos").optional().or(z.literal("")),
  calle: z.string().min(5, "Mínimo 5 caracteres"),
  municipio: z.string().min(2, "Mínimo 2 caracteres"),
  estado: z.string().min(2, "Mínimo 2 caracteres"),
  pais: z.string().min(2, "Mínimo 2 caracteres"),

  // Credenciales
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  foto_credencial: z.instanceof(FileList).refine((f) => f?.length === 1, "Foto para credencial requerida").refine((f) => validateFileSize(f, 12), "Máximo 12MB"),

  // Términos
  acepta: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar términos" }),
  }),
});

const jovenMayorSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  apellido_paterno: z.string().min(2, "Mínimo 2 caracteres"),
  apellido_materno: z.string().min(2, "Mínimo 2 caracteres"),
  fecha_nacimiento: z.string().refine((v) => {
    const age = ageFrom(v);
    return age >= 18 && age <= 29;
  }, "Debes tener entre 18 y 29 años"),
  curp: z.string().length(18, "CURP debe tener 18 caracteres").regex(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i, "CURP inválida"),
  grado_estudio: z.enum(["secundaria", "bachillerato", "universidad", "posgrado"], {
    errorMap: () => ({ message: "Selecciona un nivel de estudio" }),
  }),
  ocupacion: z.string().min(2, "Mínimo 2 caracteres"),
  phone: z.string().regex(/^\d{10}$/g, "10 dígitos requeridos"),
  calle: z.string().min(5, "Mínimo 5 caracteres"),
  municipio: z.string().min(2, "Mínimo 2 caracteres"),
  estado: z.string().min(2, "Mínimo 2 caracteres"),
  pais: z.string().min(2, "Mínimo 2 caracteres"),
  ine: z.instanceof(FileList).refine((f) => f?.length === 1, "INE requerida").refine((f) => validateFileSize(f, 12), "Máximo 12MB"),
  comprobante_domicilio: z.instanceof(FileList).refine((f) => f?.length === 1, "Comprobante de domicilio requerido").refine((f) => validateFileSize(f, 12), "Máximo 12MB"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  foto_credencial: z.instanceof(FileList).refine((f) => f?.length === 1, "Foto para credencial requerida").refine((f) => validateFileSize(f, 12), "Máximo 12MB"),
  acepta: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar términos" }),
  }),
});

// UI Components
function Card({ children }: { children: React.ReactNode }) {
  return <div className="card-gradient-border rounded-3xl bg-gradient-to-br from-white/75 to-white/60 p-10 shadow-2xl backdrop-blur-xl">{children}</div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-[hsl(var(--brand-primary))/35] bg-white/50 p-5 transition-all hover:border-[hsl(var(--brand-primary))/60] hover:shadow-md">
      <label className="mb-4 block text-lg font-bold text-[hsl(var(--brand-primary))]">{label}</label>
      {children}
      {error && <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}

function BackSmall({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-semibold text-[hsl(var(--brand-primary))] hover:underline"
    >
      ← Atrás
    </button>
  );
}

function Next({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] px-6 py-2 text-base font-semibold text-white hover:brightness-110"
    >
      Siguiente →
    </button>
  );
}

function Steps({ step, setStep, total }: { step: number; setStep: (n: number) => void; total: number }) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => setStep(i)}
          className={`flex-1 rounded-full h-2 transition ${i === step ? "bg-[hsl(var(--brand-primary))]" : "bg-white/40"}`}
        />
      ))}
    </div>
  );
}

// JOVEN MENOR FORM (12-17 años)
export function JovenMenorForm() {
  const [step, setStep] = useState(0);
  const [photoSource, setPhotoSource] = useState<"file" | "camera">("file");
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof jovenMenorSchema>>({
    resolver: zodResolver(jovenMenorSchema),
  });

  const onSubmit = async (data: z.infer<typeof jovenMenorSchema>) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key.includes("ine") || key.includes("credencial") || key.includes("foto")) {
          if ((data as any)[key]?.length) {
            formData.append(key, (data as any)[key][0]);
          }
        } else {
          formData.append(key, (data as any)[key]);
        }
      });

      const res = await fetch("/api/joven/register-minor", {
        method: "POST",
        body: formData,
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message ?? "Error al registrar");

      toast.success("Registro exitoso. En breve recibirás un correo.");
      setTimeout(() => {
        window.location.href = "/";
      }, 400);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al registrar");
    }
  };

  const fecha_nacimiento = watch("fecha_nacimiento");
  const edad = useMemo(() => (fecha_nacimiento ? ageFrom(fecha_nacimiento) : undefined), [fecha_nacimiento]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
      <Steps step={step} setStep={setStep} total={5} />

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <Card>
              <h3 className="mb-8 text-center font-display text-3xl font-bold tracking-tight text-[hsl(var(--brand-primary))]">
                Datos del Padre/Tutor
              </h3>
              <div className="space-y-6">
                <Field label="Nombre" error={errors.tutor_nombre?.message}>
                  <input {...register("tutor_nombre")} className="input" placeholder="Ej. Juan" />
                </Field>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Apellido Paterno" error={errors.tutor_apellido_paterno?.message}>
                    <input {...register("tutor_apellido_paterno")} className="input" placeholder="Ej. López" />
                  </Field>
                  <Field label="Apellido Materno" error={errors.tutor_apellido_materno?.message}>
                    <input {...register("tutor_apellido_materno")} className="input" placeholder="Ej. García" />
                  </Field>
                </div>
                <Field label="Fecha de nacimiento" error={errors.tutor_fecha_nacimiento?.message}>
                  <input type="date" {...register("tutor_fecha_nacimiento")} className="input" />
                </Field>
              </div>
              <div className="flex justify-end pt-6">
                <Next onClick={() => setStep(1)} />
              </div>
            </Card>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <Card>
              <h3 className="mb-8 text-center font-display text-3xl font-bold tracking-tight text-[hsl(var(--brand-primary))]">
                Identificación del Tutor
              </h3>
              <div className="space-y-6">
                <Field label="CURP" error={errors.tutor_curp?.message}>
                  <input {...register("tutor_curp")} className="input uppercase" placeholder="EJ. LOPG000101HDFRML00" maxLength={18} />
                </Field>
                <Field label="Parentesco" error={errors.tutor_parentesco?.message}>
                  <select {...register("tutor_parentesco")} className="input">
                    <option value="">Selecciona</option>
                    <option value="padre">Padre</option>
                    <option value="madre">Madre</option>
                    <option value="abuelo">Abuelo/a</option>
                    <option value="tutor">Tutor Legal</option>
                  </select>
                </Field>
                <Field label="Domicilio" error={errors.tutor_domicilio?.message}>
                  <input {...register("tutor_domicilio")} className="input" placeholder="Calle y número" />
                </Field>
                <Field label="INE del Tutor (PNG, PDF, JPEG - Máx 12MB)" error={errors.tutor_ine?.message}>
                  <input type="file" {...register("tutor_ine")} className="input" accept=".png,.pdf,.jpeg,.jpg" />
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
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <Card>
              <h3 className="mb-8 text-center font-display text-3xl font-bold tracking-tight text-[hsl(var(--brand-primary))]">
                Datos del Menor
              </h3>
              <div className="space-y-6">
                <Field label="Nombre" error={errors.nombre?.message}>
                  <input {...register("nombre")} className="input" placeholder="Ej. María" />
                </Field>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Apellido Paterno" error={errors.apellido_paterno?.message}>
                    <input {...register("apellido_paterno")} className="input" placeholder="Ej. López" />
                  </Field>
                  <Field label="Apellido Materno" error={errors.apellido_materno?.message}>
                    <input {...register("apellido_materno")} className="input" placeholder="Ej. García" />
                  </Field>
                </div>
                <Field label="Fecha de nacimiento" error={errors.fecha_nacimiento?.message}>
                  <input type="date" {...register("fecha_nacimiento")} className="input" />
                  {edad !== undefined && <p className="mt-2 text-xs text-muted-foreground">Edad: {edad} años</p>}
                </Field>
                <Field label="CURP" error={errors.curp?.message}>
                  <input {...register("curp")} className="input uppercase" placeholder="EJ. LOPG000101HDFRML00" maxLength={18} />
                </Field>
              </div>
              <div className="flex justify-between pt-6">
                <BackSmall onClick={() => setStep(1)} />
                <Next onClick={() => setStep(3)} />
              </div>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <Card>
              <h3 className="mb-8 text-center font-display text-3xl font-bold tracking-tight text-[hsl(var(--brand-primary))]">
                Domicilio y Documentos
              </h3>
              <div className="space-y-6">
                <Field label="Calle y número" error={errors.calle?.message}>
                  <input {...register("calle")} className="input" placeholder="Ej. Avenida Benito Juárez 100" />
                </Field>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Municipio" error={errors.municipio?.message}>
                    <input {...register("municipio")} className="input" />
                  </Field>
                  <Field label="Estado" error={errors.estado?.message}>
                    <input {...register("estado")} className="input" />
                  </Field>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="País" error={errors.pais?.message}>
                    <input {...register("pais")} className="input" />
                  </Field>
                  <Field label="Teléfono (opcional)" error={errors.phone?.message}>
                    <input {...register("phone")} className="input" placeholder="10 dígitos" maxLength={10} />
                  </Field>
                </div>
                <Field label="Credencial Escolar (PNG, PDF, JPEG - Máx 12MB)" error={errors.credencial_escolar?.message}>
                  <input type="file" {...register("credencial_escolar")} className="input" accept=".png,.pdf,.jpeg,.jpg" />
                </Field>
              </div>
              <div className="flex justify-between pt-6">
                <BackSmall onClick={() => setStep(2)} />
                <Next onClick={() => setStep(4)} />
              </div>
            </Card>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <Card>
              <h3 className="mb-8 text-center font-display text-3xl font-bold tracking-tight text-[hsl(var(--brand-primary))]">
                Acceso y Credencial Digital
              </h3>
              <div className="space-y-6">
                <Field label="Correo electrónico" error={errors.email?.message}>
                  <input type="email" {...register("email")} className="input" placeholder="tu@email.com" />
                </Field>
                <Field label="Contraseña (mín. 8 caracteres)" error={errors.password?.message}>
                  <input type="password" {...register("password")} className="input" />
                </Field>

                <div>
                  <label className="mb-4 block text-lg font-bold text-[hsl(var(--brand-primary))]">
                    Foto para credencial digital (PNG, JPEG - Máx 12MB)
                  </label>
                  
                  <div className="flex gap-2 mb-4 p-1 bg-white/40 border border-white/20 rounded-xl max-w-sm">
                    <button
                      type="button"
                      onClick={() => setPhotoSource("file")}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${
                        photoSource === "file"
                          ? "bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] text-white shadow-md"
                          : "text-foreground/75 hover:bg-white/30"
                      }`}
                    >
                      Subir Archivo
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoSource("camera")}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${
                        photoSource === "camera"
                          ? "bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] text-white shadow-md"
                          : "text-foreground/75 hover:bg-white/30"
                      }`}
                    >
                      Usar Cámara
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {photoSource === "file" ? (
                      <motion.div
                        key="file-upload"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-3"
                      >
                        <div className="relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[hsl(var(--brand-primary))/35] bg-white/50 hover:bg-white/60 transition-colors">
                          <input
                            type="file"
                            accept=".png,.jpeg,.jpg"
                            onChange={(e) => {
                              if (e.target.files) {
                                setValue("foto_credencial", e.target.files);
                                toast.success("Foto seleccionada correctamente");
                              }
                            }}
                            className="absolute inset-0 cursor-pointer opacity-0"
                          />
                          <div className="flex flex-col items-center justify-center text-center p-4">
                            <svg className="mb-2 h-8 w-8 text-[hsl(var(--brand-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span className="text-sm font-semibold text-foreground">
                              {watch("foto_credencial")?.length > 0
                                ? "Cambiar foto seleccionada"
                                : "Haz clic o arrastra una foto aquí"}
                            </span>
                            <span className="text-xs text-muted-foreground mt-1">PNG, JPG o JPEG hasta 12MB</span>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="camera-capture"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                      >
                        <CameraCapture
                          label="Tómate una foto para tu credencial"
                          onCapture={(fileList) => {
                            setValue("foto_credencial", fileList);
                            toast.success("Foto capturada correctamente");
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {watch("foto_credencial")?.length > 0 && (
                    <p className="mt-2 text-sm text-green-600 font-semibold">Foto cargada: {watch("foto_credencial")[0].name}</p>
                  )}
                  {errors.foto_credencial && <p className="mt-3 text-sm text-red-600 font-medium">{errors.foto_credencial.message}</p>}
                </div>

                <motion.div className="rounded-2xl border-3 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 p-6">
                  <h4 className="mb-3 font-display text-xl font-bold text-orange-900">Declaración de Responsabilidad</h4>
                  <p className="mb-5 text-base text-orange-900 leading-relaxed">
                    Declaro que soy el padre/madre/tutor legal de este menor y autorizo su participación en el programa Punto Jóven.
                  </p>
                  <label className="flex items-start gap-3 text-base">
                    <input type="checkbox" {...register("acepta")} className="mt-1 h-5 w-5 rounded accent-[hsl(var(--brand-primary))]" />
                    <span className="font-semibold text-orange-900">Acepto los términos</span>
                  </label>
                  {errors.acepta && <p className="mt-3 text-sm text-red-600">{errors.acepta.message}</p>}
                </motion.div>
              </div>
              <div className="flex justify-between pt-6">
                <BackSmall onClick={() => setStep(3)} />
                <button disabled={isSubmitting} type="submit" className="btn-primary text-base">
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

// JOVEN MAYOR FORM (18-29 años)
export function JovenMayorForm() {
  const [step, setStep] = useState(0);
  const [photoSource, setPhotoSource] = useState<"file" | "camera">("file");
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof jovenMayorSchema>>({
    resolver: zodResolver(jovenMayorSchema),
  });

  const onSubmit = async (data: z.infer<typeof jovenMayorSchema>) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key.includes("ine") || key.includes("credencial") || key.includes("comprobante") || key.includes("foto")) {
          if ((data as any)[key]?.length) {
            formData.append(key, (data as any)[key][0]);
          }
        } else {
          formData.append(key, (data as any)[key]);
        }
      });

      const res = await fetch("/api/joven/register-adult", {
        method: "POST",
        body: formData,
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message ?? "Error al registrar");

      toast.success("Registro exitoso. En breve recibirás un correo.");
      setTimeout(() => {
        window.location.href = "/";
      }, 400);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al registrar");
    }
  };

  const fecha_nacimiento = watch("fecha_nacimiento");
  const edad = useMemo(() => (fecha_nacimiento ? ageFrom(fecha_nacimiento) : undefined), [fecha_nacimiento]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
      <Steps step={step} setStep={setStep} total={4} />

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <Card>
              <h3 className="mb-8 text-center font-display text-3xl font-bold tracking-tight text-[hsl(var(--brand-primary))]">
                Información Personal
              </h3>
              <div className="space-y-6">
                <Field label="Nombre" error={errors.nombre?.message}>
                  <input {...register("nombre")} className="input" placeholder="Ej. Juan" />
                </Field>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Apellido Paterno" error={errors.apellido_paterno?.message}>
                    <input {...register("apellido_paterno")} className="input" placeholder="Ej. López" />
                  </Field>
                  <Field label="Apellido Materno" error={errors.apellido_materno?.message}>
                    <input {...register("apellido_materno")} className="input" placeholder="Ej. García" />
                  </Field>
                </div>
                <Field label="Fecha de nacimiento" error={errors.fecha_nacimiento?.message}>
                  <input type="date" {...register("fecha_nacimiento")} className="input" />
                  {edad !== undefined && <p className="mt-2 text-xs text-muted-foreground">Edad: {edad} años</p>}
                </Field>
                <Field label="CURP" error={errors.curp?.message}>
                  <input {...register("curp")} className="input uppercase" placeholder="EJ. LOPG000101HDFRML00" maxLength={18} />
                </Field>
              </div>
              <div className="flex justify-end pt-6">
                <Next onClick={() => setStep(1)} />
              </div>
            </Card>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <Card>
              <h3 className="mb-8 text-center font-display text-3xl font-bold tracking-tight text-[hsl(var(--brand-primary))]">
                Educación y Ocupación
              </h3>
              <div className="space-y-6">
                <Field label="Grado máximo de estudio" error={errors.grado_estudio?.message}>
                  <select {...register("grado_estudio")} className="input">
                    <option value="">Selecciona una opción</option>
                    <option value="secundaria">Secundaria</option>
                    <option value="bachillerato">Bachillerato</option>
                    <option value="universidad">Universidad</option>
                    <option value="posgrado">Posgrado</option>
                  </select>
                </Field>
                <Field label="Ocupación" error={errors.ocupacion?.message}>
                  <input {...register("ocupacion")} className="input" placeholder="Ej. Estudiante, Desarrollador, Vendedor, etc." />
                </Field>
                <Field label="Teléfono" error={errors.phone?.message}>
                  <input {...register("phone")} className="input" placeholder="10 dígitos" maxLength={10} />
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
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <Card>
              <h3 className="mb-8 text-center font-display text-3xl font-bold tracking-tight text-[hsl(var(--brand-primary))]">
                Domicilio y Documentos
              </h3>
              <div className="space-y-6">
                <Field label="Calle y número" error={errors.calle?.message}>
                  <input {...register("calle")} className="input" placeholder="Ej. Avenida Benito Juárez 100" />
                </Field>
                <div className="grid gap-6 sm:grid-cols-3">
                  <Field label="Municipio" error={errors.municipio?.message}>
                    <input {...register("municipio")} className="input" />
                  </Field>
                  <Field label="Estado" error={errors.estado?.message}>
                    <input {...register("estado")} className="input" />
                  </Field>
                  <Field label="País" error={errors.pais?.message}>
                    <input {...register("pais")} className="input" />
                  </Field>
                </div>
                <Field label="INE (PNG, PDF, JPEG - Máx 12MB)" error={errors.ine?.message}>
                  <input type="file" {...register("ine")} className="input" accept=".png,.pdf,.jpeg,.jpg" />
                </Field>
                <Field label="Comprobante de Domicilio (PNG, PDF, JPEG - Máx 12MB)" error={errors.comprobante_domicilio?.message}>
                  <input type="file" {...register("comprobante_domicilio")} className="input" accept=".png,.pdf,.jpeg,.jpg" />
                </Field>
              </div>
              <div className="flex justify-between pt-6">
                <BackSmall onClick={() => setStep(1)} />
                <Next onClick={() => setStep(3)} />
              </div>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <Card>
              <h3 className="mb-8 text-center font-display text-3xl font-bold tracking-tight text-[hsl(var(--brand-primary))]">
                Acceso y Credencial Digital
              </h3>
              <div className="space-y-6">
                <Field label="Correo electrónico" error={errors.email?.message}>
                  <input type="email" {...register("email")} className="input" placeholder="tu@email.com" />
                </Field>
                <Field label="Contraseña (mín. 8 caracteres)" error={errors.password?.message}>
                  <input type="password" {...register("password")} className="input" />
                </Field>

                <div>
                  <label className="mb-4 block text-lg font-bold text-[hsl(var(--brand-primary))]">
                    Foto para credencial digital (PNG, JPEG - Máx 12MB)
                  </label>
                  
                  <div className="flex gap-2 mb-4 p-1 bg-white/40 border border-white/20 rounded-xl max-w-sm">
                    <button
                      type="button"
                      onClick={() => setPhotoSource("file")}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${
                        photoSource === "file"
                          ? "bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] text-white shadow-md"
                          : "text-foreground/75 hover:bg-white/30"
                      }`}
                    >
                      Subir Archivo
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoSource("camera")}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${
                        photoSource === "camera"
                          ? "bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] text-white shadow-md"
                          : "text-foreground/75 hover:bg-white/30"
                      }`}
                    >
                      Usar Cámara
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {photoSource === "file" ? (
                      <motion.div
                        key="file-upload"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-3"
                      >
                        <div className="relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[hsl(var(--brand-primary))/35] bg-white/50 hover:bg-white/60 transition-colors">
                          <input
                            type="file"
                            accept=".png,.jpeg,.jpg"
                            onChange={(e) => {
                              if (e.target.files) {
                                setValue("foto_credencial", e.target.files);
                                toast.success("Foto seleccionada correctamente");
                              }
                            }}
                            className="absolute inset-0 cursor-pointer opacity-0"
                          />
                          <div className="flex flex-col items-center justify-center text-center p-4">
                            <svg className="mb-2 h-8 w-8 text-[hsl(var(--brand-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span className="text-sm font-semibold text-foreground">
                              {watch("foto_credencial")?.length > 0
                                ? "Cambiar foto seleccionada"
                                : "Haz clic o arrastra una foto aquí"}
                            </span>
                            <span className="text-xs text-muted-foreground mt-1">PNG, JPG o JPEG hasta 12MB</span>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="camera-capture"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                      >
                        <CameraCapture
                          label="Tómate una foto para tu credencial"
                          onCapture={(fileList) => {
                            setValue("foto_credencial", fileList);
                            toast.success("Foto capturada correctamente");
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {watch("foto_credencial")?.length > 0 && (
                    <p className="mt-2 text-sm text-green-600 font-semibold">Foto cargada: {watch("foto_credencial")[0].name}</p>
                  )}
                  {errors.foto_credencial && <p className="mt-3 text-sm text-red-600 font-medium">{errors.foto_credencial.message}</p>}
                </div>

                <motion.div className="rounded-2xl border-3 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
                  <h4 className="mb-3 font-display text-xl font-bold text-blue-900">Declaración de Compromiso</h4>
                  <p className="mb-5 text-base text-blue-900 leading-relaxed">
                    Declaro que tengo entre 18 y 29 años y que la información proporcionada es verídica. Acepto formar parte del programa Punto Jóven.
                  </p>
                  <label className="flex items-start gap-3 text-base">
                    <input type="checkbox" {...register("acepta")} className="mt-1 h-5 w-5 rounded accent-[hsl(var(--brand-primary))]" />
                    <span className="font-semibold text-blue-900">Acepto los términos</span>
                  </label>
                  {errors.acepta && <p className="mt-3 text-sm text-red-600">{errors.acepta.message}</p>}
                </motion.div>
              </div>
              <div className="flex justify-between pt-6">
                <BackSmall onClick={() => setStep(2)} />
                <button disabled={isSubmitting} type="submit" className="btn-primary text-base">
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
