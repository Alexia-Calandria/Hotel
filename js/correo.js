/* =====================================================================
   Stay Lux & Pets Hotel — emails automáticos
   ---------------------------------------------------------------------
   Cada vez que se guarda una reserva, una consulta o una actualización
   para el huésped, este archivo arma el email (con el sello de
   autenticidad y su código de verificación) y lo guarda en la tabla
   "correos" (bandeja de salida, visible en Administración → Emails).
   Si en js/config.js completás los datos de EmailJS, además lo envía
   de verdad desde stayluxpetshotelreservas@gmail.com.
   ===================================================================== */
(function () {
  "use strict";
  const CFG = window.SLP_CONFIG || {};
  const HOTEL = CFG.hotelEmail || "stayluxpetshotel@gmail.com";
  const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const f = (s) => { if (!s) return ""; const [y, m, d] = String(s).slice(0, 10).split("-"); return `${+d} ${MES[+m - 1]} ${y}`; };
  const usd = (n) => "USD " + Number(n || 0).toLocaleString("es-UY");
  const hora = (iso) => { try { return new Date(iso).toLocaleString("es-UY", { timeZone: "America/Montevideo", dateStyle: "short", timeStyle: "short" }); } catch (e) { return iso; } };
  const valido = (e) => /^\S+@\S+\.\S+$/.test(String(e || ""));
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const limpio = (lineas) => lineas.filter((l) => l !== null && l !== undefined && !/:\s*$/.test(l) && !/:\s*(undefined|null)?\s*$/.test(l)).join("\n");
  const FIRMA = "\n\nAnte cualquier duda, respondé este email o escribinos por WhatsApp al +598 99 123 456.\n\nSaludos,\nStay Lux & Pets Hotel\nLujo en buena compañía.";

  /* ---------- Plantilla HTML con el sello ---------- */
  function html(texto, ref, cod, selloSrc) {
    return `<!doctype html><html><body style="margin:0;background:#F4EFE4;padding:24px 12px;font-family:Helvetica,Arial,sans-serif;color:#1F2A2B"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid #E4D7BE;border-radius:12px"><tr><td style="background:#13262C;border-radius:12px 12px 0 0;padding:18px 24px;color:#E2C98F;font-family:Georgia,serif;font-size:20px;letter-spacing:1px">Stay Lux &amp; Pets Hotel</td></tr><tr><td style="padding:24px;font-size:15px;line-height:1.6">${esc(texto).replace(/\n/g, "<br>")}</td></tr><tr><td align="center" style="padding:8px 24px 28px;border-top:1px solid #EFE6D4"><img src="${selloSrc}" width="150" height="150" alt="Sello de autenticidad Stay Lux &amp; Pets Hotel" style="display:block;margin:18px auto 8px;border:0"><div style="font-family:Georgia,serif;font-size:13px;letter-spacing:2px;color:#8A6D34;text-transform:uppercase">Certificado de autenticidad</div><div style="font-size:13px;color:#5B6464;margin-top:6px">Referencia <b>${esc(ref)}</b> · Código de verificación <b style="letter-spacing:1px">${esc(cod)}</b></div><div style="font-size:12px;color:#5B6464;margin-top:6px">Verificalo en nuestra web, sección «Verificar un email».</div><div style="font-size:11px;color:#8b9191;margin-top:14px">Este mensaje fue emitido por Stay Lux &amp; Pets Hotel · Playa Brava, Punta del Este, Uruguay.<br>Nunca te pediremos tu contraseña ni el número completo de tu tarjeta por email.</div></td></tr></table></td></tr></table></body></html>`;
  }

  /* ---------- Textos ---------- */
  function reservaAlHotel(r) {
    const e = r.estadia || {}, h = r.huesped || {}, p = r.pago || {}, pl = r.plan || [];
    const l = ["Nueva reserva recibida — pendiente de confirmar", "", `CÓDIGO: ${r.codigo}`, `Recibida: ${hora(r.creado)}`, "", "ESTADÍA",
      `Habitación: ${e.habitacion} · ${e.huespedes} huéspedes`, `Fechas: ${f(e.llegada)} → ${f(e.salida)} (${e.noches} noches; ${e.nochesAlta} en temporada alta)`,
      `Llegada estimada: ${h.hora} h`, `Total estimado: ${usd(e.total)} + impuestos`, `  Habitación ${usd(e.totalHabitacion)} · Mascotas ${usd(e.totalMascotas)}`,
      `Puntos Lux Club: ${Number(e.puntos || 0).toLocaleString("es-UY")}`, "",
      `PLAN DE PAGO (tarjeta de crédito ${p.marca} terminada en ${p.ultimos4} · Titular: ${p.titular})`];
    pl.forEach((x) => l.push(`${x.n === 1 ? "1.er" : "2.º"} pago 50%: ${usd(x.monto)} el ${f(x.fecha)}${x.n === 2 ? " (check-in)" : ""}`));
    l.push("", "TITULAR", `${h.nombre} ${h.apellido}`, `${h.email} · ${h.tel}`, `${h.pais} · ${h.docTipo} ${h.docNum}`);
    if (h.acomp) l.push(`Acompañantes: ${h.acomp}`);
    if (h.pedidos) l.push(`Pedidos especiales: ${h.pedidos}`);
    (r.mascotas || []).forEach((m) => l.push("", `MASCOTA: ${m.nombre}`, `${m.especie} · ${m.raza} · ${m.sexo}, castrado/a: ${m.castrado}`, `${m.edad} años · ${m.peso} kg`,
      `Temperamento: ${m.temperamento} · ${m.sociable}`, `Alimentación: ${m.alimentacion}`, `Alergias/medicación: ${m.alergias || "ninguna"}`,
      `Veterinario: ${m.vetNombre} · ${m.vetTel}`, `Vacunas al día: ${m.vacunas ? "sí" : "no"} · Desparasitado: ${m.desparasitado ? "sí" : "no"}`, "Foto: ver en el panel de administración del sitio"));
    l.push("", "PARA HACER", "☐ Confirmar o rechazar en el panel de Administración", "☐ Asignar número de habitación en el panel", "☐ Programar el primer cobro en Administración → Cobros", "☐ Preparar cama, comedero y bebedero según la ficha");
    if ((r.mascotas || [])[0]) l.push(`☐ Preparar kit de bienvenida con el nombre de ${r.mascotas[0].nombre}`);
    return { para: HOTEL, asunto: `Nueva reserva ${r.codigo} · ${h.nombre} ${h.apellido} · ${f(e.llegada)} → ${f(e.salida)}`, texto: limpio(l), ref: r.codigo, tipo: "reserva_hotel" };
  }
  function reservaAcuse(r) {
    const e = r.estadia || {}, h = r.huesped || {}, p = r.pago || {}, pl = r.plan || [];
    const nombres = (r.mascotas || []).map((m) => m.nombre).filter(Boolean);
    const l = [`Hola ${h.nombre}:`, "", "¡Gracias por elegirnos! Recibimos tu solicitud de reserva y nuestro equipo la está revisando. Te avisamos por este medio apenas quede confirmada.", "",
      `Reserva: ${r.codigo}`, `Habitación: ${e.habitacion} · ${e.huespedes} huéspedes`, `Fechas: ${f(e.llegada)} → ${f(e.salida)} (${e.noches} noches)`,
      `Mascotas: ${nombres.length ? nombres.join(", ") : "sin mascota"}`, `Total estimado: ${usd(e.total)} + impuestos`, "",
      `Plan de pago (tarjeta de crédito ${p.marca} terminada en ${p.ultimos4}):`];
    pl.forEach((x) => l.push(`${x.n === 1 ? "1.er" : "2.º"} pago 50%: ${usd(x.monto)} el ${f(x.fecha)}${x.n === 2 ? " (en el check-in)" : ""}`));
    l.push("", "Podés seguir el estado de tu reserva en Mi cuenta, en nuestra web.");
    return { para: h.email, asunto: `Recibimos tu reserva ${r.codigo} · Stay Lux & Pets Hotel`, texto: limpio(l) + FIRMA, ref: r.codigo, tipo: "reserva_acuse" };
  }
  function consulta(c) {
    const l = ["Nueva consulta desde la web", "", `De: ${c.nombre}`, `Email: ${c.email}`, `Recibida: ${hora(c.creado)}`];
    if (c.fechas) l.push(`Fechas tentativas: ${c.fechas}`);
    if (c.mascota) l.push(`Mascota: ${c.mascota}`);
    l.push("", "MENSAJE", c.mensaje, "", `Respondé directamente a ${c.email} y marcala como "respondida" en Administración → Consultas.`);
    return { para: HOTEL, asunto: `Nueva consulta ${c.codigo} · ${c.nombre}`, texto: l.join("\n"), ref: c.codigo, tipo: "consulta" };
  }
  function notificacion(n) {
    let texto = n.texto, asunto = n.asunto;
    if (!texto) {
      asunto = `No pudimos procesar tu pago · Reserva ${n.codigo}`;
      texto = `Hola ${n.nombre}:\n\nNo pudimos efectuar el cobro de ${usd(n.monto)} correspondiente a tu reserva ${n.codigo} porque ${n.motivo}.\n\nSi deseás continuar con la reserva, actualizá tu tarjeta desde Mi cuenta en nuestra web. Recordá que debe ser una tarjeta de crédito; no aceptamos tarjetas de débito.` + FIRMA;
    }
    return { para: n.para, bcc: (n.copiaHotel || n.tipo === "pago_rechazado") ? HOTEL : "", asunto, texto, ref: n.codigo, tipo: n.tipo };
  }

  /* ---------- Envío real con EmailJS (opcional) ---------- */
  const ej = CFG.emailjs || {};
  const emailjsActivo = !!(ej.publicKey && ej.serviceId && ej.templateId);
  let sdk = null;
  function cargarSDK() {
    if (sdk) return sdk;
    sdk = new Promise((ok, mal) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4.4.1/dist/email.min.js";
      s.onload = () => ok(window.emailjs); s.onerror = () => mal(new Error("No se pudo cargar EmailJS"));
      document.head.appendChild(s);
    });
    return sdk;
  }
  async function enviarReal(m) {
    const lib = await cargarSDK();
    await lib.send(ej.serviceId, ej.templateId, {
      to_email: m.para, bcc: m.bcc || "", subject: m.asunto, html_message: m.html, text_message: m.textoPlano,
      reply_to: CFG.remitente || "stayluxpetshotelreservas@gmail.com",
    }, { publicKey: ej.publicKey });
  }

  /* ---------- Bandeja de salida ---------- */
  async function encolar(clave, m) {
    const B = window.SLP.bd;
    if ((await B.doc("avisos/" + clave).get()).exists) return;
    if (!valido(m.para)) return;
    const h = window.SLP.aleatorio(4).toUpperCase(), cod = h.slice(0, 4) + "-" + h.slice(4);
    const H = await window.SLP.sha256(`${String(m.ref).toUpperCase()}|${cod}`);
    const base = (CFG.sitioUrl || "").replace(/\/$/, "");
    const id = "M" + Date.now().toString(36).toUpperCase() + window.SLP.aleatorio(2).toUpperCase();
    const correo = {
      id, tipo: m.tipo, para: m.para, bcc: m.bcc || "", desde: CFG.remitente || "stayluxpetshotelreservas@gmail.com", asunto: m.asunto,
      textoPlano: m.texto + `\n\n—\nCertificado de autenticidad · Stay Lux & Pets Hotel\nReferencia ${m.ref} · Código de verificación ${cod}`,
      html: html(m.texto, m.ref, cod, base ? base + "/img/sello-email.png" : "img/sello-web.png"),
      ref: m.ref, codigoVerificacion: cod, creado: new Date().toISOString(), estado: emailjsActivo ? "enviando" : "en bandeja",
    };
    await B.doc("avisos/" + clave).set({ avisado: correo.creado, tipo: m.tipo, correo: id });
    await B.doc("verificaciones/" + H).set({ ref: m.ref, tipo: m.tipo, creado: correo.creado });
    await B.doc("correos/" + id).set(correo);
    if (emailjsActivo) {
      try { await enviarReal(correo); await B.doc("correos/" + id).update({ estado: "enviado", enviado: new Date().toISOString() }); }
      catch (e) { await B.doc("correos/" + id).update({ estado: "error", error: String((e && (e.text || e.message)) || e) }); }
    }
  }

  /* Se llama desde la base de datos cada vez que se guarda algo */
  function alGuardar(ruta, v) {
    const s = ruta.split("/");
    let tareas = [];
    if (s[0] === "huespedes" && s[2] === "reservas" && s.length === 4 && v && v.codigo) {
      tareas = [[v.codigo, reservaAlHotel(v)], [v.codigo + "-RECIBIDA", reservaAcuse(v)]];
    } else if (s[0] === "consultas" && s[2] === "mensajes" && s.length === 4 && v && v.codigo) {
      tareas = [[v.codigo, consulta(v)]];
    } else if (s[0] === "notificaciones" && s.length === 2 && v && v.id) {
      tareas = [[v.id, notificacion(v)]];
    }
    tareas.reduce((p, [k, m]) => p.then(() => encolar(k, m)), Promise.resolve()).catch((e) => console.warn("Email:", e));
  }
  async function reenviar(id) {
    const B = window.SLP.bd, d = await B.doc("correos/" + id).get();
    if (!d.exists || !emailjsActivo) return false;
    try { await enviarReal(d.data()); await B.doc("correos/" + id).update({ estado: "enviado", enviado: new Date().toISOString(), error: "" }); return true; }
    catch (e) { await B.doc("correos/" + id).update({ estado: "error", error: String((e && (e.text || e.message)) || e) }); return false; }
  }

  window.SLPCorreo = { alGuardar, reenviar, emailjsActivo };
})();
