# Stay Lux & Pets Hotel — sitio web

Hotel boutique de lujo pet-friendly en Playa Brava, Punta del Este.
Proyecto académico de hotelería. Sitio 100 % JavaScript, sin servidor ni base de datos: listo para publicar en **GitHub Pages**.

## Cómo publicarlo en GitHub Pages

1. Creá un repositorio nuevo en GitHub (por ejemplo `staylux-pets-hotel`), público.
2. Subí **todo el contenido de esta carpeta** (Add file → Upload files). `index.html` tiene que quedar en la raíz.
3. Entrá a **Settings → Pages**. En *Source* elegí **Deploy from a branch**, rama `main`, carpeta `/ (root)`. Guardá.
4. En 1–2 minutos el sitio queda en `https://TU-USUARIO.github.io/staylux-pets-hotel/`.
5. Abrí `js/config.js` y cambiá `sitioUrl` por esa dirección (se usa para la imagen del sello en los emails).

> Para probarlo en tu computadora no alcanza con doble clic en `index.html`: el navegador bloquea la lectura de los archivos JSON. Abrí una terminal en la carpeta y ejecutá `python -m http.server 8000`, después entrá a `http://localhost:8000`.

## Estructura

```
index.html            Página (todas las secciones)
css/estilos.css       Estilos, tema luna y sol
js/config.js          Datos que podés editar (URL, emails, EmailJS)
js/plataforma.js      "Motor" de datos: tablas JSON, cuentas, imágenes, descargas, concierge
js/correo.js          Emails automáticos con sello de autenticidad
js/app.js             Lógica de la página: reservas, cobros, KPIs, administración
data/*.json           Tablas iniciales (una por archivo)
img/                  Logo y sello de autenticidad
```

## Cómo funciona la "base de datos" en archivos

Cada tabla es un archivo JSON con el formato `{ "id": { ...datos } }`.

| Archivo | Contenido |
|---|---|
| `data/packs.json` | Packs y su precio en puntos Lux Club |
| `data/eventos.json` | Eventos (fecha, hora, lugar, cupo) |
| `data/config.json` | Tarifas por habitación (alta/baja) y cargo 2.ª mascota |
| `data/seguridad.json` | Acceso de administración (email + contraseña cifrada SHA-256 con sal) |
| `data/imagenes.json` | Fotos asignadas a cada sección |

La primera vez que alguien abre el sitio, estas tablas se copian a su navegador (IndexedDB). A partir de ahí, todo lo que se carga en la web — huéspedes, reservas, fichas de mascotas, cobros, consultas, emails — se guarda en tablas nuevas dentro de ese navegador (`huespedes`, `cuentas`, `estados`, `consultas`, `notificaciones`, `correos`, `verificaciones`).

En **Administración → Base de datos** podés:
- Descargar la base completa como un solo archivo `.json` (copia de seguridad).
- Descargar cada tabla por separado.
- Cargar una copia (por ejemplo, para pasar los datos a otra computadora antes de la presentación).
- Volver a los datos iniciales de `data/`.

Para cambiar los datos iniciales de todos los visitantes, editá los archivos de `data/` en GitHub.

## Accesos

- **Huéspedes:** se registran en *Mi cuenta → Crear cuenta* con email y contraseña.
- **Administración:** *Mi cuenta → Administración* (o *Acceso del equipo* en el pie de página).
  Email `stayluxpetshotel@gmail.com` · contraseña `petshotel1234_`.

Para cambiar la contraseña de administración: generá una sal y el hash `SHA-256(sal + contraseña)` y reemplazalos en `data/seguridad.json`.

## Emails

Cada reserva, consulta, confirmación, asignación de habitación, cobro aprobado o rechazado genera un email con el sello de autenticidad y un código que se puede validar en *Verificar un email*.

- **Sin configurar:** los emails quedan en *Administración → Emails* (bandeja de salida), con vista previa y botón *Abrir en mi correo*.
- **Envío real (opcional, gratis hasta 200/mes) con EmailJS:**
  1. Creá una cuenta en emailjs.com.
  2. *Email Services → Add Service → Gmail* y conectá **stayluxpetshotelreservas@gmail.com**. Copiá el *Service ID*.
  3. *Email Templates → Create*: en *To Email* poné `{{to_email}}`, en *Bcc* `{{bcc}}`, en *Subject* `{{subject}}`, en *Reply To* `{{reply_to}}`, y en el cuerpo (modo código/HTML) solo `{{{html_message}}}`. Copiá el *Template ID*.
  4. *Account → Public Key*.
  5. Pegá los tres datos en `js/config.js` → `emailjs`.

## Tarjetas de prueba (los cobros se simulan)

| Número | Resultado |
|---|---|
| 4242 4242 4242 4242 | VISA crédito, aprobada |
| 5555 5555 5555 4444 | Mastercard crédito, aprobada |
| 3782 822463 10005 | AMEX crédito, aprobada |
| 4000 0000 0000 9995 | Rechazada: fondos insuficientes |
| 4000 0000 0000 0002 | Rechazada por el banco |
| 4000 0000 0000 0069 | Rechazada: vencida |
| 4000 0566 5566 5556 | Débito: no aceptada |

Nunca cargues una tarjeta real: el sitio es una demostración académica y no cumple PCI DSS.

## Limitaciones de un sitio sin servidor

- Los datos que se cargan en la web quedan en el navegador de cada persona. Una reserva hecha en el celular de un huésped no aparece en la computadora del hotel salvo que se exporte/importe la base. Para que todos compartan los mismos datos hace falta un servidor (por ejemplo, la versión PHP del proyecto o un servicio como Firebase).
- El repositorio es público: cualquiera puede ver el hash de la contraseña de administración. Cambiala después de la presentación.
- El concierge virtual responde con reglas fijas (tarifas, mascotas, pagos, packs, eventos, playas, horarios), no con inteligencia artificial.
- Las imágenes subidas desde el panel se guardan en el navegador. Para que las vea todo el mundo, subilas a `img/` en GitHub y escribí su ruta (`img/piscina.jpg`) en `data/imagenes.json`, en el formato `{ "inst-piscina": { "ids": ["img/piscina.jpg"] } }`.
