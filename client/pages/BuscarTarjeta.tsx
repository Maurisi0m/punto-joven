import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { DigitalIDCard, type Beneficiary } from "@/components/DigitalIDCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, AlertCircle } from "lucide-react";

export default function BuscarTarjeta() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credencial, setCredencial] = useState<Beneficiary | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setLoading(true);
    setError(null);
    setCredencial(null);

    try {
      const response = await fetch(`/api/joven/credencial/${token.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se encontró la credencial o aún no ha sido aprobada.");
      }

      setCredencial(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 min-h-[80vh]">
      <Reveal>
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--brand-primary))]">
            Buscar Tarjeta Digital
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
            Ingresa tu token único para visualizar y descargar tu
            credencial digital.
          </p>
        </div>

        <form onSubmit={handleSearch} className="max-w-md mx-auto mb-12">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Ej. e14fec63-..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !token.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </form>

        {credencial && (
          <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
            <DigitalIDCard data={credencial} />
          </div>
        )}
      </Reveal>
    </main>
  );
}
