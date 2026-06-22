import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Store, UploadCloud, MapPin, Link2, Tag, AlertCircle } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Card } from "@/components/ui/card";

const updateSchema = z.object({
  tipoDescuento: z.string().min(5, "Mínimo 5 caracteres"),
  restricciones: z.string().optional(),
  address: z.string().min(5, "Mínimo 5 caracteres"),
  website: z.string().url("URL de mapa inválida"),
});

export default function NegocioDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Para preview de imágenes si el usuario las cambia
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof updateSchema>>({
    resolver: zodResolver(updateSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const businessId = sessionStorage.getItem("business_id");
      if (!businessId) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("/api/business/profile", {
          headers: { "x-business-id": businessId }
        });
        if (!res.ok) throw new Error("No autorizado");
        
        const data = await res.json();
        setProfile(data);
        reset({
          tipoDescuento: data.tipoDescuento || "",
          restricciones: data.restricciones || "",
          address: data.address || "",
          website: data.website || "",
        });
      } catch (err) {
        sessionStorage.removeItem("business_id");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [navigate, reset]);

  const onSubmit = async (values: z.infer<typeof updateSchema>) => {
    try {
      const formData = new FormData();
      formData.append("address", values.address);
      formData.append("website", values.website);
      formData.append("tipoDescuento", values.tipoDescuento);
      formData.append("restricciones", values.restricciones || "");

      if (logoFile) formData.append("logo", logoFile);
      if (fotoFile) formData.append("fotoEstablecimiento", fotoFile);

      const res = await fetch("/api/business/profile", {
        method: "PUT",
        headers: { "x-business-id": sessionStorage.getItem("business_id")! },
        body: formData,
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.message || "No se pudo actualizar");
      }

      // Actualizar el perfil local
      setProfile((prev: any) => ({
        ...prev,
        logo_url: body.logo_url || (prev ? prev.logo_url : ""),
        local_photo_url: body.local_photo_url || (prev ? prev.local_photo_url : ""),
        tipoDescuento: values.tipoDescuento,
        restricciones: values.restricciones,
        address: values.address,
        website: values.website,
      }));

      // Limpiar los estados de archivo cargados
      setLogoFile(null);
      setLogoPreview(null);
      setFotoFile(null);
      setFotoPreview(null);

      toast.success("Perfil actualizado y visible en afiliados.");
    } catch (err: any) {
      toast.error(err?.message || "Error al actualizar perfil");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isLogo: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen supera los 5MB permitidos");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (isLogo) {
        setLogoFile(file);
        setLogoPreview(reader.result as string);
      } else {
        setFotoFile(file);
        setFotoPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Cargando perfil...</div>;
  }

  if (profile?.status !== "approved") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 text-center shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-600 mb-4" />
          <h2 className="text-xl font-bold text-yellow-900">Configuración bloqueada</h2>
          <p className="mt-2 text-yellow-800">Tu negocio actualmente tiene el estatus: <strong>{profile?.status}</strong>.</p>
          <p className="mt-1 text-sm text-yellow-700">Solo los negocios aprobados pueden editar su banner público.</p>
          <button onClick={() => navigate("/")} className="mt-6 btn-primary">Volver al inicio</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-white/40 to-white/20 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="mb-8 flex items-center gap-3">
            <Store className="h-8 w-8 text-[hsl(var(--brand-primary))]" />
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Mis Datos del Negocio</h1>
              <p className="text-muted-foreground mt-1">Configura cómo la gente ve tu negocio en la página de afiliados</p>
            </div>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Formulario de Update */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card className="p-6 bg-white/70 backdrop-blur border-white/20 shadow-xl rounded-2xl">
                  
                  <div className="space-y-5">
                    {/* Oferta y descuento */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[hsl(var(--brand-primary))]" /> Tipo de Descuento/Oferta
                      </label>
                      <input 
                        {...register("tipoDescuento")} 
                        className="input" 
                        placeholder="Ej: 20% de descuento en menú" 
                      />
                      {errors.tipoDescuento && <p className="text-sm text-red-600">{errors.tipoDescuento.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Términos y Restricciones</label>
                      <textarea 
                        {...register("restricciones")} 
                        className="input min-h-[80px]" 
                        placeholder="Ej: Valido sólo martes y jueves..." 
                      />
                    </div>

                    {/* Localizacion */}
                    <div className="pt-4 border-t border-white/10 space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[hsl(var(--brand-primary))]" /> Ubicación Pública
                        </label>
                        <input 
                          {...register("address")} 
                          className="input" 
                          placeholder="Calle y Num, Colonia, Ciudad" 
                        />
                        {errors.address && <p className="text-sm text-red-600">{errors.address.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold flex items-center gap-2">
                          <Link2 className="w-4 h-4 text-[hsl(var(--brand-primary))]" /> Link hacia Google Maps
                        </label>
                        <input 
                          {...register("website")} 
                          className="input" 
                          placeholder="https://maps.google.com/..." 
                        />
                        {errors.website && <p className="text-sm text-red-600">{errors.website.message}</p>}
                      </div>
                    </div>

                    {/* Imagenes */}
                    <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Actualizar Logo</label>
                        <div className="relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/40 bg-white/50 hover:bg-white/60 transition-colors">
                          <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, true)} className="absolute inset-0 cursor-pointer opacity-0" />
                          {logoPreview || profile.logo_url ? (
                            <img src={logoPreview || profile.logo_url} alt="Logo preview" className="absolute inset-0 h-full w-full object-contain p-2" />
                          ) : (
                            <>
                              <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                              <span className="text-sm font-medium">Subir nuevo logo</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Foto del Establecimiento</label>
                        <div className="relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/40 bg-white/50 hover:bg-white/60 transition-colors">
                          <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, false)} className="absolute inset-0 cursor-pointer opacity-0" />
                          {fotoPreview || profile.local_photo_url ? (
                            <img src={fotoPreview || profile.local_photo_url} alt="Local preview" className="absolute inset-0 h-full w-full object-cover rounded-lg" />
                          ) : (
                            <>
                              <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                              <span className="text-sm font-medium">Actualizar foto local</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-4">
                      {isSubmitting ? "Guardando datos..." : "Guardar Cambios"}
                    </button>
                  </div>
                </Card>
              </form>
            </div>

            {/* Vista Previa Layout Afiliados */}
            <div className="hidden lg:block relative">
              <div className="sticky top-24">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground text-center">Así luce en la app</h3>
                
                {/* Mock Card UI same as in Afiliados */}
                <div className="overflow-hidden rounded-3xl border border-white/20 bg-white shadow-xl group">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img 
                      src={fotoPreview || profile.local_photo_url} 
                      alt="Banner Preview" 
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    
                    {/* Badge */}
                    <div className="absolute right-4 top-4">
                      <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md border border-white/30">
                        {profile.category}
                      </span>
                    </div>

                    {/* Logo & title floating inside image overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-white/20 bg-white p-1 shadow-xl">
                        <img src={logoPreview || profile.logo_url} alt="Logo Preview" className="h-full w-full rounded-xl object-contain" />
                      </div>
                      <div className="flex-1 pb-1">
                        <h3 className="font-display leading-tight text-xl font-bold tracking-tight text-white mb-1">
                          {profile.business_name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Reveal>
      </div>
    </main>
  );
}
