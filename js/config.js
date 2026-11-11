/* =====================================================================
   Stay Lux & Pets Hotel — configuración del sitio
   Editá este archivo y subilo al repositorio.
   ===================================================================== */
window.SLP_CONFIG = {
  /* Dirección pública del sitio (GitHub Pages). Se usa para la imagen del sello en los emails. */
  sitioUrl: "https://TU-USUARIO.github.io/staylux-pets-hotel",

  /* Cuenta que envía los emails al huésped */
  remitente: "stayluxpetshotelreservas@gmail.com",

  /* Cuenta del hotel que recibe los avisos de reservas y consultas */
  hotelEmail: "stayluxpetshotel@gmail.com",

  /* Envío real de emails con EmailJS (gratis hasta 200 por mes).
     Dejalo vacío y los emails quedan en Administración → Emails.
     Pasos en el README. */
  emailjs: {
    publicKey: "",
    serviceId: "",
    templateId: "",
  },
};
