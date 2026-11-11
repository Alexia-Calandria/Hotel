/* =====================================================================
   Stay Lux & Pets Hotel — plataforma local (sin servidor)
   ---------------------------------------------------------------------
   Simula una base de datos con "tablas" guardadas como archivos JSON:
   - Las tablas iniciales están en la carpeta data/ (un archivo .json por tabla).
   - La primera vez que se abre el sitio, se copian al navegador (IndexedDB).
   - Desde ahí, cada reserva, consulta o cambio se guarda en el navegador.
   - El administrador puede descargar toda la base como archivo JSON y
     volver a cargarla (Administración → Base de datos).
   Este archivo también reemplaza los servicios que antes daba el servidor:
   cuentas con contraseña, imágenes subidas, descargas y concierge.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- Tablas: archivo JSON → colección ---------- */
  const TABLAS = [
    { archivo: "data/packs.json",      coleccion: "packs" },
    { archivo: "data/eventos.json",    coleccion: "eventos" },
    { archivo: "data/config.json",     coleccion: "config" },
    { archivo: "data/seguridad.json",  coleccion: "seguridad" },
    { archivo: "data/imagenes.json",   coleccion: "imagenes" },
  ];
  const VERSION_DATOS = "1";

  /* ---------- Almacén: IndexedDB con copia en memoria ---------- */
  const NOMBRE_BD = "staylux-pets-hotel";
  let idb = null;
  const memoria = new Map();              // ruta completa → datos del documento
  const oyentes = new Set();              // suscripciones onSnapshot
  const canal = ("BroadcastChannel" in window) ? new BroadcastChannel("staylux-bd") : null;

  function abrirIDB() {
    return new Promise((ok, mal) => {
      if (!("indexedDB" in window)) return ok(null);
      const r = indexedDB.open(NOMBRE_BD, 1);
      r.onupgradeneeded = () => { r.result.createObjectStore("docs"); };
      r.onsuccess = () => ok(r.result);
      r.onerror = () => ok(null);
    });
  }
  function idbTodo() {
    return new Promise((ok) => {
      if (!idb) return ok([]);
      const out = [], tx = idb.transaction("docs", "readonly"), st = tx.objectStore("docs");
      const cur = st.openCursor();
      cur.onsuccess = () => { const c = cur.result; if (c) { out.push([c.key, c.value]); c.continue(); } else ok(out); };
      cur.onerror = () => ok(out);
    });
  }
  function idbPoner(ruta, valor) {
    if (!idb) { respaldoLocal(); return Promise.resolve(); }
    return new Promise((ok, mal) => {
      const tx = idb.transaction("docs", "readwrite");
      if (valor === undefined) tx.objectStore("docs").delete(ruta); else tx.objectStore("docs").put(valor, ruta);
      tx.oncomplete = () => ok();
      tx.onerror = () => mal({ code: "quota_exceeded", message: "No hay más espacio en el navegador para guardar datos." });
    });
  }
  function idbVaciar() {
    if (!idb) { try { localStorage.removeItem("slp_bd"); } catch (e) {} return Promise.resolve(); }
    return new Promise((ok) => { const tx = idb.transaction("docs", "readwrite"); tx.objectStore("docs").clear(); tx.oncomplete = () => ok(); tx.onerror = () => ok(); });
  }
  /* Sin IndexedDB (modo privado muy restrictivo): se usa localStorage */
  function respaldoLocal() { try { localStorage.setItem("slp_bd", JSON.stringify([...memoria])); } catch (e) {} }

  const clonar = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
  const segmentos = (ruta) => String(ruta).split("/").filter(Boolean);

  function avisarCambio(ruta, remoto) {
    oyentes.forEach((o) => { try { o.verificar(ruta); } catch (e) {} });
    if (!remoto && canal) canal.postMessage({ ruta, valor: memoria.has(ruta) ? memoria.get(ruta) : null, borrado: !memoria.has(ruta) });
  }
  if (canal) canal.onmessage = (ev) => {
    const m = ev.data || {};
    if (m.recargar) { location.reload(); return; }
    if (m.borrado) memoria.delete(m.ruta); else memoria.set(m.ruta, m.valor);
    avisarCambio(m.ruta, true);
  };

  async function escribir(ruta, valor) {
    if (valor === undefined) memoria.delete(ruta); else memoria.set(ruta, clonar(valor));
    await idbPoner(ruta, valor === undefined ? undefined : clonar(valor));
    avisarCambio(ruta);
    if (window.SLPCorreo && valor !== undefined) { try { window.SLPCorreo.alGuardar(ruta, clonar(valor)); } catch (e) { console.warn(e); } }
  }

  /* ---------- API de documentos y colecciones ---------- */
  function instantaneaDoc(ruta) {
    const existe = memoria.has(ruta);
    return { id: segmentos(ruta).pop(), exists: existe, data: () => clonar(memoria.get(ruta)) };
  }
  function docsDe(coleccion) {
    const base = segmentos(coleccion), n = base.length, out = [];
    const vistos = new Set();
    memoria.forEach((v, k) => {
      const s = segmentos(k);
      if (s.length <= n || !base.every((b, i) => b === s[i])) return;
      const id = s[n];
      if (s.length === n + 1) { vistos.add(id); out.push({ id, data: () => clonar(v) }); }
    });
    /* documentos "padre" que solo tienen subtablas (ej. consultas/<id>/mensajes) */
    memoria.forEach((v, k) => {
      const s = segmentos(k);
      if (s.length > n + 1 && base.every((b, i) => b === s[i]) && !vistos.has(s[n])) { vistos.add(s[n]); out.push({ id: s[n], data: () => ({}) }); }
    });
    out.sort((a, b) => a.id.localeCompare(b.id));
    return out;
  }
  function doc(ruta) {
    ruta = segmentos(ruta).join("/");
    return {
      id: segmentos(ruta).pop(),
      async get() { return instantaneaDoc(ruta); },
      async set(datos) { await escribir(ruta, datos); },
      async update(cambios) {
        if (!memoria.has(ruta)) throw { code: "not_found", message: "El documento no existe." };
        await escribir(ruta, Object.assign(clonar(memoria.get(ruta)), clonar(cambios)));
      },
      async delete() { await escribir(ruta, undefined); },
      onSnapshot(fn) {
        const o = { verificar: (r) => { if (r === ruta) fn(instantaneaDoc(ruta)); } };
        oyentes.add(o); setTimeout(() => fn(instantaneaDoc(ruta)), 0);
        return () => oyentes.delete(o);
      },
      collection(sub) { return coleccion(ruta + "/" + sub); },
    };
  }
  function coleccion(ruta) {
    ruta = segmentos(ruta).join("/");
    const snap = () => { const d = docsDe(ruta); return { docs: d, size: d.length, empty: !d.length }; };
    return {
      async get() { return snap(); },
      doc(id) { return doc(ruta + "/" + id); },
      onSnapshot(fn) {
        const pref = ruta + "/", n = segmentos(ruta).length + 1;
        const o = { verificar: (r) => { if (r.startsWith(pref) && segmentos(r).length === n) fn(snap()); } };
        oyentes.add(o); setTimeout(() => fn(snap()), 0);
        return () => oyentes.delete(o);
      },
    };
  }
  const bd = { doc, collection: coleccion };

  /* ---------- Carga inicial: tablas JSON → navegador ---------- */
  async function cargarTablas(forzar) {
    const errores = [];
    if (!forzar && memoria.has("_sistema/semilla")) return errores;   // ya se cargaron una vez
    for (const t of TABLAS) {
      try {
        const r = await fetch(t.archivo, { cache: "no-store" });
        if (!r.ok) throw new Error(r.status);
        const filas = await r.json();
        for (const [id, datos] of Object.entries(filas)) {
          const ruta = t.coleccion + "/" + id;
          if (forzar || !memoria.has(ruta)) { memoria.set(ruta, datos); await idbPoner(ruta, datos); }
        }
      } catch (e) { errores.push(t.archivo); }
    }
    if (!errores.length) { const m = { cargado: new Date().toISOString(), version: VERSION_DATOS }; memoria.set("_sistema/semilla", m); await idbPoner("_sistema/semilla", m); }
    return errores;
  }

  /* ---------- Sesión y cuentas (contraseñas con SHA-256 + sal) ---------- */
  const LS = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} },
  };
  function aleatorio(bytes) { return [...crypto.getRandomValues(new Uint8Array(bytes))].map((x) => x.toString(16).padStart(2, "0")).join(""); }
  async function sha256(t) { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join(""); }
  let DISPOSITIVO = LS.get("slp_dispositivo");
  if (!DISPOSITIVO) { DISPOSITIVO = "d_" + aleatorio(10); LS.set("slp_dispositivo", DISPOSITIVO); }

  const cuentas = {
    usuarioActual() { return LS.get("slp_sesion"); },
    dispositivo() { return DISPOSITIVO; },
    async registrar(email, password) {
      email = String(email).trim().toLowerCase();
      const ruta = "cuentas/" + encodeURIComponent(email);
      if (memoria.has(ruta)) throw { code: "existe", message: "Ya existe una cuenta con ese email. Iniciá sesión." };
      const uid = "u_" + aleatorio(10), sal = aleatorio(12);
      await escribir(ruta, { email, uid, sal, hash: await sha256(sal + password), creado: new Date().toISOString() });
      LS.set("slp_sesion", uid);
      return uid;
    },
    async ingresar(email, password) {
      email = String(email).trim().toLowerCase();
      const c = memoria.get("cuentas/" + encodeURIComponent(email));
      if (!c || (await sha256(c.sal + password)) !== c.hash) throw { code: "credenciales", message: "Email o contraseña incorrectos." };
      LS.set("slp_sesion", c.uid);
      return c.uid;
    },
    salir() { LS.set("slp_sesion", null); },
  };

  /* ---------- Archivos subidos (imágenes) ---------- */
  function leerComoDataURL(blob) {
    return new Promise((ok, mal) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.onerror = () => mal({ code: "invalid_request" }); fr.readAsDataURL(blob); });
  }
  const archivos = {
    async upload(blob) {
      if (!blob || !/^image\//.test(blob.type || "")) throw { code: "invalid_request", message: "Ese archivo no es una imagen." };
      if (blob.size > 6 * 1024 * 1024) throw { code: "payload_too_large", message: "La imagen es demasiado grande." };
      const id = "a" + aleatorio(12);
      await escribir("archivos/" + id, { dataUrl: await leerComoDataURL(blob), tipo: blob.type, creado: new Date().toISOString() });
      return { id, url: fuente(id) };
    },
    async delete(id) { await escribir("archivos/" + id, undefined); return { deleted: true }; },
    async list() { return { assets: docsDe("archivos").map((d) => ({ id: d.id })) }; },
  };
  /* Devuelve la dirección de una imagen: archivo del repositorio (img/...) o imagen subida */
  function fuente(id) {
    if (!id) return "";
    if (/^(img\/|https?:|data:)/.test(id)) return id;
    const a = memoria.get("archivos/" + id);
    return a ? a.dataUrl : "";
  }

  /* ---------- Descargas de archivos ---------- */
  const descargas = {
    async save({ filename, data }) {
      const blob = data instanceof Blob ? data : new Blob([data], { type: /\.csv$/i.test(filename) ? "text/csv;charset=utf-8" : "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      return "saved";
    },
  };

  /* ---------- Concierge por reglas (sin IA ni servidor) ---------- */
  function conciergeLocal(mensajes) {
    const q = String((mensajes[mensajes.length - 1] || {}).content || "").toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "");
    const C = window.SLPConcierge || {};
    const tem = (...p) => p.some((x) => q.includes(x));
    if (tem("hola", "buen dia", "buenas")) return "¡Hola! Soy el concierge de Stay Lux & Pets Hotel. Puedo contarte de tarifas, habitaciones, requisitos para tu mascota, packs, Lux Club o cómo llegar. ¿Qué te gustaría saber?";
    if (tem("precio", "tarifa", "cuanto", "cuesta", "vale", "suite", "premium", "boutique", "luxury", "penthouse"))
      return `Tarifas por noche (USD, doble, desayuno incluido, impuestos aparte): ${C.tarifas || ""}. Temporada alta del 15/12 al 15/3. La primera mascota no paga; la segunda abona USD ${C.pet2 || 25} por noche. Podés calcular tu estadía exacta en Reservar.`;
    if (tem("perro", "gato", "mascota", "vacuna", "requisito", "llevar", "libreta", "correa"))
      return "Recibimos perros y gatos, hasta 2 por habitación. Necesitamos la ficha de tu mascota al reservar y la libreta sanitaria con vacunas y desparasitación al día en el check-in. En áreas comunes van con correa y no pueden quedar solas por mucho tiempo: para eso está la guardería.";
    if (tem("argentina", "brasil", "chile", "extranjero", "frontera", "pais", "viajo desde"))
      return "Para entrar a Uruguay con tu mascota desde otro país, consultá los requisitos del MGAP (servicio veterinario oficial de Uruguay) y del servicio veterinario de tu país de origen. Nosotros te orientamos, pero esa información oficial es la que vale en frontera.";
    if (tem("lux club", "punto", "canje", "fideliz"))
      return "Lux Club es gratis: sumás 10 puntos por cada USD en habitación (mínimo 1.000 por estadía). Niveles Arena, Oliva y Champagne. Canjeás noches desde 15.000 puntos (Boutique) o packs desde la página Packs con tu sesión iniciada.";
    if (tem("pack", "escapada", "workation", "promo", "oferta"))
      return `Nuestros packs: ${C.packs || "consultá la página Packs"}.`;
    if (tem("evento", "taller", "adopcion", "yoga", "actividad"))
      return `Próximos eventos: ${C.eventos || "pronto anunciamos nuevos eventos"}. Los ves en la página Eventos.`;
    if (tem("playa", "brava", "mansa", "parada"))
      return "Las playas habilitadas para mascotas por la Intendencia de Maldonado son las paradas 25 a 27 de Playa Brava y 39 y 40 de Playa Mansa, siempre con collar y correa. Estamos a pasos de Brava.";
    if (tem("spa", "piscina", "sauna", "masaje", "restaurante", "comer", "menu", "cowork", "wifi", "gimnasio", "guarderia", "paseo", "veterin"))
      return "Tenemos restaurante de autor con menú pet, spa con sauna y piscina climatizada en la planta alta, gimnasio, coworking, spa pet, paseos, guardería diurna, circuito de agility y veterinaria de convenio 24 h.";
    if (tem("check", "horario", "hora", "llegar", "salida"))
      return "Check-in desde las 15 h y check-out hasta las 11 h. La recepción atiende las 24 horas. En el check-in recibís el kit de bienvenida para tu mascota.";
    if (tem("pago", "tarjeta", "cobro", "debito", "credito", "cancel"))
      return "Aceptamos tarjeta de crédito (no débito). Se cobra 50% siete días antes del check-in y 50% en el check-in. Podés cancelar sin cargo hasta 7 días antes de la llegada.";
    if (tem("reserv"))
      return "Podés reservar desde el botón Reservar: elegís fechas y habitación, cargás tus datos, la ficha de tu mascota con foto y tu tarjeta de crédito. El equipo confirma la reserva y te avisa por email.";
    if (tem("donde", "direccion", "ubicacion", "como llego"))
      return "Estamos en la Rambla Lorenzo Batlle Pacheco, Parada 26, Playa Brava, Punta del Este. Tenemos estacionamiento propio.";
    return "No tengo ese dato a mano. Escribinos a reservas@staylux.com.uy o por WhatsApp al +598 99 123 456 y el equipo te responde enseguida.";
  }
  async function concierge(mensajes, opciones) {
    await new Promise((z) => setTimeout(z, 450));
    const text = conciergeLocal(mensajes);
    if (opciones && opciones.onText) opciones.onText({ text, delta: text });
    return { text, truncated: false };
  }

  /* ---------- Usuario actual (para la página) ---------- */
  const usuario = {
    async id() { return cuentas.usuarioActual(); },
    async isOwner() { return false; },
    async canEdit() { return true; },     // el acceso real lo da la contraseña de administración
    async can() { return true; },
  };

  /* ---------- Exportar / importar la base como archivo ---------- */
  const base = {
    exportar() {
      const tablas = {};
      memoria.forEach((v, k) => { const s = segmentos(k); const col = s.slice(0, -1).join("/"); (tablas[col] = tablas[col] || {})[s[s.length - 1]] = v; });
      return { sistema: "Stay Lux & Pets Hotel", version: VERSION_DATOS, exportado: new Date().toISOString(), tablas };
    },
    resumen() {
      const t = {};
      memoria.forEach((v, k) => { const top = segmentos(k)[0]; t[top] = (t[top] || 0) + 1; });
      return t;
    },
    tabla(nombre) {
      const out = {};
      memoria.forEach((v, k) => { const s = segmentos(k); if (s[0] === nombre) out[s.slice(1).join("/")] = v; });
      return out;
    },
    async importar(obj) {
      if (!obj || !obj.tablas || obj.sistema !== "Stay Lux & Pets Hotel") throw { message: "El archivo no es una copia de la base de Stay Lux & Pets Hotel." };
      memoria.clear(); await idbVaciar();
      for (const [col, filas] of Object.entries(obj.tablas)) for (const [id, v] of Object.entries(filas)) { const r = col + "/" + id; memoria.set(r, v); await idbPoner(r, v); }
      LS.set("slp_datos", VERSION_DATOS);
      if (canal) canal.postMessage({ recargar: true });
    },
    async reiniciar() {
      memoria.clear(); await idbVaciar();
      await cargarTablas(true);
      LS.set("slp_datos", VERSION_DATOS);
      if (canal) canal.postMessage({ recargar: true });
    },
    bytes() { let n = 0; memoria.forEach((v, k) => { n += k.length + JSON.stringify(v).length; }); return n; },
  };

  /* ---------- Arranque ---------- */
  const listo = (async () => {
    idb = await abrirIDB();
    if (idb) (await idbTodo()).forEach(([k, v]) => memoria.set(k, v));
    else { try { (JSON.parse(localStorage.getItem("slp_bd")) || []).forEach(([k, v]) => memoria.set(k, v)); } catch (e) {} }
    const errores = await cargarTablas(false);
    LS.set("slp_datos", VERSION_DATOS);
    if (errores.length && !memoria.size) console.warn("No se pudieron leer las tablas:", errores);
    return errores;
  })();

  /* Interfaz común que usa la página (claude.use) */
  const servicios = { db: bd, user: usuario, assets: archivos, downloads: descargas, sample: concierge };
  window.claude = { use: async (nombre) => { await listo; return servicios[nombre] || null; } };
  window.SLP = { listo, cuentas, base, fuente, sha256, aleatorio, bd };
})();
