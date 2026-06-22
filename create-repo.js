import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(__dirname);
const destDir = "C:\\Users\\mauro\\OneDrive\\Desktop\\punto-joven";

console.log("Iniciando creacion de repositorio local en el escritorio...");
console.log("Origen:", srcDir);
console.log("Destino:", destDir);

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    const base = path.basename(src);
    if (
      base === "node_modules" ||
      base === ".git" ||
      base === ".builder" ||
      base === ".idea" ||
      base === ".vscode" ||
      base === "dist"
    ) {
      return;
    }
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  // 1. Copiar archivos
  copyRecursiveSync(srcDir, destDir);
  console.log("Copia de archivos finalizada con exito.");

  // 2. Inicializar repositorio git
  console.log("Inicializando repositorio Git local...");
  execSync("git init", { cwd: destDir, stdio: "inherit" });
  execSync("git add .", { cwd: destDir, stdio: "inherit" });
  
  // Configurar usuario local para el commit
  execSync("git config user.name \"Mauro Juarez\"", { cwd: destDir, stdio: "inherit" });
  execSync("git config user.email \"maurojuarez2009@gmail.com\"", { cwd: destDir, stdio: "inherit" });
  
  execSync("git commit -m \"Initial commit - Punto Joven\"", { cwd: destDir, stdio: "inherit" });
  console.log("PROCESO FINALIZADO EXITOSAMENTE.");
  console.log("El nuevo repositorio se encuentra en:", destDir);
} catch (error) {
  console.error("Error durante la creacion del repositorio:", error);
}
