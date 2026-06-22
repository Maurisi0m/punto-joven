import { QRCodeCanvas } from "qrcode.react";
import { cn } from "@/lib/utils";
import { LOGO_URL } from "@/lib/constants";

export type Beneficiary = {
  token: string;
  nombre: string;
  curp: string;
  email: string;
  fotoDataUrl?: string | null;
  createdAt?: string;
};

type Props = {
  data: Beneficiary;
  className?: string;
  small?: boolean;
};

export function DigitalIDCard({ data, className, small }: Props) {
  const { token, nombre, curp, email, fotoDataUrl } = data;
  const payload = `${window.location.origin}/validar/${token}`;

  return (
    <div
      className={cn(
        "relative w-full max-w-[520px] sm:max-w-[560px] p-[2px] rounded-3xl bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] shadow-[0_20px_60px_-20px_rgba(136,22,62,0.35)]",
        className,
      )}
    >
      <div className="relative rounded-3xl border border-white/15 bg-white/60 text-foreground shadow-2xl overflow-hidden backdrop-blur-2xl min-h-[420px]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[hsl(var(--brand-primary))/10] blur-md" />
          <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-[hsl(var(--brand-secondary))/10] blur-md" />
        </div>
        <div className="flex items-center justify-between px-7 pt-7">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Pachuca" className="h-10 w-auto" />
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Pachuca de Soto
              </p>
              <h3 className="text-base font-bold leading-tight">
                Punto Joven
              </h3>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-[hsl(var(--brand-secondary))]">
            2026–2027
          </span>
        </div>

        <div className="grid grid-cols-[128px_1fr] gap-6 px-7 py-6">
          <div className="h-32 w-32 rounded-xl overflow-hidden border bg-white/70 ring-2 ring-[hsl(var(--brand-primary))/35] grid place-items-center">
            {fotoDataUrl ? (
              <img
                src={fotoDataUrl}
                alt={nombre}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-[hsl(var(--brand-primary))/40] text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--brand-primary))]">
                Sin foto
              </div>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-[11px] uppercase text-muted-foreground">
              Nombre
            </p>
            <p className="font-semibold leading-tight">{nombre}</p>
            <p className="mt-2 text-[11px] uppercase text-muted-foreground">
              CURP
            </p>
            <p className="font-mono text-sm tracking-tight">{curp}</p>
            <p className="mt-2 text-[11px] uppercase text-muted-foreground">
              Correo
            </p>
            <p className="truncate text-sm" title={email}>
              {email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 px-7 pb-7">
          <div
            className={cn(
              "rounded-2xl border bg-white p-2 shadow-md",
              small ? "size-28" : "size-32",
            )}
          >
            <QRCodeCanvas
              value={payload}
              size={small ? 96 : 116}
              includeMargin={false}
              level="M"
            />
          </div>
          <div className="flex-1">
            <p className="text-[11px] uppercase text-muted-foreground">Token</p>
            <p className="break-all font-mono text-sm">{token}</p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Presenta este código para validar tu beneficio.
            </p>
          </div>
        </div>

        <div className="bg-[hsl(var(--brand-primary))] px-7 py-3 text-center text-xs font-semibold tracking-wide text-white">
          Beneficios y descuentos para la juventud de Pachuca
        </div>
      </div>
    </div>
  );
}
