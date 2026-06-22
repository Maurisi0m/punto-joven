import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

if (!SMTP_USER || !SMTP_PASS) {
  console.error("Error: SMTP_USER y SMTP_PASS deben estar configurados en el archivo .env");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS.replace(/\s/g, ""),
  },
});

async function run() {
  console.log("Iniciando envio de correo de prueba...");
  console.log(`Host: ${SMTP_HOST}`);
  console.log(`Puerto: ${SMTP_PORT}`);
  console.log(`Usuario: ${SMTP_USER}`);

  try {
    const info = await transporter.sendMail({
      from: SMTP_USER,
      to: SMTP_USER,
      subject: "Correo de prueba - Plataforma Punto Joven",
      text: "Este es un correo electronico de prueba para verificar la conexion SMTP.",
      html: "<p>Este es un correo electronico de prueba para verificar la conexion SMTP.</p>",
    });

    console.log("Conexion exitosa. El correo ha sido enviado.");
    console.log(`ID del mensaje: ${info.messageId}`);
  } catch (error) {
    console.error("Error al enviar el correo de prueba:");
    console.error(error instanceof Error ? error.message : error);
  }
}

run();
