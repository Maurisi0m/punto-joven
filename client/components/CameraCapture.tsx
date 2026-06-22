import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CameraCaptureProps {
  onCapture: (fileList: FileList) => void;
  label?: string;
}

export function CameraCapture({ onCapture, label = "Captura tu foto" }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const openCamera = async () => {
    setIsOpen(true);
    setIsLoading(true);
    setError(null);

    try {
      // Solicitar acceso a la cámara
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setHasPermission(true);
      toast.success("Cámara activada correctamente");
    } catch (err: any) {
      console.error("Error accediendo a la cámara:", err);
      setHasPermission(false);

      // Mejores mensajes de error
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError(
          "Permiso denegado. Por favor, autoriza el acceso a la cámara en la configuración de tu navegador."
        );
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError(
          "No se encontró cámara en tu dispositivo. Asegúrate de tener una cámara conectada."
        );
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setError(
          "No se puede acceder a la cámara. Puede estar en uso por otra aplicación."
        );
      } else if (err.name === "OverconstrainedError") {
        setError(
          "Tu cámara no cumple con los requisitos. Intenta de nuevo."
        );
      } else {
        setError(
          `Error al acceder a la cámara: ${err.message || "Error desconocido"}`
        );
      }
      toast.error("Error al acceder a la cámara");
    } finally {
      setIsLoading(false);
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsOpen(false);
    setCapturedImage(null);
    setError(null);
    setHasPermission(null);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const context = canvasRef.current.getContext("2d");
      if (!context) return;

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      // Dibujar la imagen del video en el canvas
      context.drawImage(videoRef.current, 0, 0);

      // Obtener la imagen como data URL
      const imageData = canvasRef.current.toDataURL("image/jpeg", 0.95);
      setCapturedImage(imageData);
      toast.success("Foto capturada");
    } catch (err) {
      console.error("Error capturando foto:", err);
      toast.error("Error al capturar la foto");
    }
  };

  const confirmCapture = () => {
    if (!capturedImage || !canvasRef.current) return;

    try {
      canvasRef.current.toBlob(
        (blob) => {
          if (blob) {
            // Crear un File desde el blob
            const file = new File([blob], "camera-photo.jpg", {
              type: "image/jpeg",
            });

            // Crear un FileList-like usando DataTransfer
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);

            // Pasar el FileList al callback
            onCapture(dataTransfer.files);
            toast.success("Foto guardada");
            closeCamera();
          }
        },
        "image/jpeg",
        0.95
      );
    } catch (err) {
      console.error("Error guardando foto:", err);
      toast.error("Error al guardar la foto");
    }
  };

  return (
    <div className="space-y-4">
      {/* Botón para abrir cámara */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            type="button"
            onClick={openCamera}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[hsl(var(--brand-primary))/40] bg-gradient-to-br from-[hsl(var(--brand-primary))/5] to-white/40 py-6 px-4 transition-all hover:border-[hsl(var(--brand-primary))/60] hover:bg-white/60 disabled:opacity-50"
          >
            <Camera className="h-6 w-6 text-[hsl(var(--brand-primary))]" />
            <span className="font-semibold text-foreground">
              {isLoading ? "Abriendo cámara..." : "Abrir cámara"}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Modal de cámara */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeCamera}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] p-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{label}</h3>
                <button
                  onClick={closeCamera}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-4">
                {error ? (
                  // Mostrar error
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex gap-4 items-start p-6 bg-red-50 rounded-2xl border-2 border-red-300">
                      <AlertCircle className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-red-900 mb-2">
                          Error de Cámara
                        </h4>
                        <p className="text-red-800">{error}</p>
                        <div className="mt-4 flex gap-3">
                          <button
                            onClick={() => {
                              setError(null);
                              openCamera();
                            }}
                            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Intentar de nuevo
                          </button>
                          <button
                            onClick={closeCamera}
                            className="px-4 py-2 bg-red-200 text-red-900 font-semibold rounded-lg hover:bg-red-300 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : !capturedImage ? (
                  // Mostrar video en vivo
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-black aspect-video">
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <div className="animate-spin">
                            <Camera className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      )}
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                      Posiciona tu cara en el centro y haz clic en "Tomar foto"
                    </p>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={closeCamera}
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 bg-gray-100 font-semibold text-gray-700 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="h-5 w-5" />
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={takePhoto}
                        className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] font-semibold text-white hover:brightness-110 transition-all flex items-center justify-center gap-2"
                      >
                        <Camera className="h-5 w-5" />
                        Tomar foto
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  // Mostrar foto capturada
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-video">
                      <img
                        src={capturedImage}
                        alt="Foto capturada"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                      ¿Deseas usar esta foto?
                    </p>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCapturedImage(null)}
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-amber-300 bg-amber-50 font-semibold text-amber-700 hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                      >
                        Recapturar
                      </button>
                      <button
                        type="button"
                        onClick={confirmCapture}
                        className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 font-semibold text-white hover:brightness-110 transition-all flex items-center justify-center gap-2"
                      >
                        <Check className="h-5 w-5" />
                        Usar foto
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Canvas oculto */}
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
