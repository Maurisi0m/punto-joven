import { Reveal } from "@/components/motion/Reveal";

export default function Perfil() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <h1 className="text-3xl font-extrabold tracking-tight">Mi perfil</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Panel con estadísticas, credencial digital y datos personales. Pídeme
          que lo conecte con guardado simulado cuando quieras.
        </p>
      </Reveal>
    </main>
  );
}
