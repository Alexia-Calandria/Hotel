/* Stay Lux & Pets Hotel — lógica de la página */
(function(){
const ROOMS=[
  {id:"boutique",name:"Boutique",units:15,high:220,low:150,tag:"Parejas y viajeros solos",cap:2,feat:["Cama queen y cama premium para mascota","Comedero, bebedero y kit de higiene","Escritorio y Wi-Fi de alta velocidad"]},
  {id:"premium",name:"Premium",units:25,high:280,low:190,tag:"Familias y estadías largas",cap:4,feat:["Cama king o dos queen","Rincón de descanso para la mascota","Mayor superficie para familias"]},
  {id:"luxury",name:"Luxury",units:10,high:380,low:260,tag:"Terraza privada",cap:2,feat:["Terraza privada para salir con tu mascota","Amenities premium","Ideal para workation"]},
  {id:"suite",name:"Suite",units:4,high:520,low:360,tag:"Tercera planta",cap:4,feat:["Living separado y dos ambientes","Servicio de mayordomo para la mascota","Vista abierta al mar"]},
  {id:"penthouse",name:"Penthouse",units:1,high:950,low:650,tag:"Cuarta planta completa",cap:4,feat:["Piso entero con terraza 360°","Check-in privado en la habitación","Spa pet y paseo diario incluidos"]}
];
let PET2=25;const REDEEM={boutique:15000,premium:20000,luxury:28000,suite:38000,penthouse:68000};
const fmt=n=>n.toLocaleString("es-UY");
const $=id=>document.getElementById(id);


/* ===== modo sol / luna ===== */
function setTema(t){const sol=t==="sol";if(sol)document.documentElement.setAttribute("data-tema","sol");else document.documentElement.removeAttribute("data-tema");
  document.querySelectorAll("[data-tema]").forEach(b=>{if(b.tagName==="BUTTON")b.setAttribute("aria-pressed",String(b.dataset.tema===(sol?"sol":"luna")))});
  try{localStorage.setItem("slp_tema",sol?"sol":"luna")}catch(e){}}
document.addEventListener("click",e=>{const b=e.target.closest("button[data-tema]");if(b)setTema(b.dataset.tema)});
try{if(localStorage.getItem("slp_tema")==="sol")setTema("sol")}catch(e){}
/* drawer + router */
const mb=$("menuBtn"),dr=$("drawer"),scrim=$("scrim");
const setDrawer=o=>{dr.classList.toggle("open",o);scrim.hidden=!o;mb.setAttribute("aria-expanded",o);dr.setAttribute("aria-hidden",!o);if(o)setTimeout(()=>$("drawerClose").focus(),50);else mb.focus({preventScroll:true})};
mb.onclick=()=>setDrawer(true);$("drawerClose").onclick=()=>setDrawer(false);scrim.onclick=()=>setDrawer(false);
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&dr.classList.contains("open"))setDrawer(false)});
const VIEWS=[...document.querySelectorAll(".view")].map(v=>v.dataset.view);
function route(){
  let v=(location.hash||"#inicio").slice(1);if(!VIEWS.includes(v))v="inicio";
  document.querySelectorAll(".view").forEach(el=>el.hidden=el.dataset.view!==v);
  dr.querySelectorAll("a").forEach(a=>a.getAttribute("href")==="#"+v?a.setAttribute("aria-current","page"):a.removeAttribute("aria-current"));
  if(dr.classList.contains("open"))setDrawer(false);
  window.scrollTo(0,0);
  onView(v);
}
window.addEventListener("hashchange",route);

/* rooms */
const art=i=>{const hues=["#E4D7BE","#D9DCC4","#C9D3CC","#E8DCC0","#D7C7A3"];return `<svg viewBox="0 0 300 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="300" height="120" fill="${hues[i]}"/><path d="M0 92 Q150 ${70+i*4} 300 88 V120 H0Z" fill="#1E4A4F" opacity=".14"/><rect x="${40+i*18}" y="34" width="70" height="58" rx="35" fill="none" stroke="#B8975A" stroke-width="2"/><line x1="${75+i*18}" y1="34" x2="${75+i*18}" y2="92" stroke="#B8975A" stroke-width="1.2"/><rect x="${150}" y="70" width="${90+i*6}" height="22" rx="6" fill="#5F6B3A" opacity=".35"/><ellipse cx="${200+i*4}" cy="96" rx="20" ry="5" fill="#B8975A" opacity=".55"/></svg>`};

/* ===== datos compartidos ===== */
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const iso=d=>{const z=new Date(d.getTime()-d.getTimezoneOffset()*60000);return z.toISOString().slice(0,10)};
const today=new Date();today.setHours(12,0,0,0);
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const isHigh=d=>{const m=d.getMonth()+1,day=d.getDate();return (m===12&&day>=15)||m===1||m===2||(m===3&&day<15)};
const fdate=s=>{if(!s)return"";const d=new Date(s+"T12:00");return d.toLocaleDateString("es-UY",{day:"numeric",month:"short",year:"numeric"})};
const LS={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const PAW='<svg viewBox="0 0 24 24"><use href="#i-paw"/></svg>';
const roomById=id=>ROOMS.find(r=>r.id===id)||ROOMS[1];

function quoteOf(b){
  const a=new Date(b.llegada+"T12:00"),z=new Date(b.salida+"T12:00"),room=roomById(b.room);
  if(isNaN(a)||isNaN(z)||z<=a)return{err:"Elegí una fecha de salida posterior a la llegada."};
  if(a<today)return{err:"La fecha de llegada ya pasó."};
  if(b.guests>room.cap)return{err:`La categoría ${room.name} admite hasta ${room.cap} huéspedes. Probá con Premium o Suite.`};
  let nights=0,hi=0,room$=0;for(let d=new Date(a);d<z;d.setDate(d.getDate()+1)){nights++;if(isHigh(d)){hi++;room$+=room.high}else room$+=room.low}
  if(nights>30)return{err:"Para estadías de más de 30 noches escribinos y armamos una tarifa a medida."};
  const pet$=b.pets===2?PET2*nights:0;
  return{nights,hi,room$,pet$,total:room$+pet$,pts:Math.max(1000,room$*10),room};
}

/* ===== backend: cuenta (identidad Claude) + base de datos ===== */
let db=null,usr=null,uid=null,profile=null,isAdmin=false,platformAdmin=false,ready=false,returnTo=null,acctTab="in";
const loggedIn=()=>!!(profile&&SLP.cuentas.usuarioActual());
/* uid = cuenta del huésped si inició sesión; si no, el id de este dispositivo (para consultas) */
async function cargarSesion(){const u=SLP.cuentas.usuarioActual();uid=u||SLP.cuentas.dispositivo();profile=null;
  if(db&&u){try{const s=await db.doc("huespedes/"+u).get();profile=s.exists?s.data():null}catch(e){}}}
async function initBackend(){
  if(window.claude&&claude.use){
    try{[db,usr]=await Promise.all([claude.use("db"),claude.use("user")])}catch(e){}
    platformAdmin=true;
    let ok=false;try{ok=sessionStorage.getItem("slp_admin")===SLP.cuentas.dispositivo()}catch(e){}isAdmin=ok;
    await cargarSesion();
  }
  ready=true;renderChip();onView(currentView());initImages();initContent();refreshMine();
}
function renderChip(){
  const c=$("acctChip");
  if(loggedIn()){const ini=((profile.nombre||"")[0]||"")+((profile.apellido||"")[0]||"");c.innerHTML=`<span class="ini">${esc(ini.toUpperCase())}</span><span class="lbl">Mi cuenta</span>${typeof misMensajes!=="undefined"&&misMensajes.some(m=>!m.leido)?'<i class="dot-new" aria-label="Mensajes nuevos"></i>':""}`}
  else c.innerHTML=`<svg viewBox="0 0 24 24"><path class="ico" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21c1-4 4-6 8-6s7 2 8 6"/></svg><span class="lbl">Ingresar</span>`;
  $("adminLink").hidden=!isAdmin;
}
const noBackend=()=>`<div class="panel acct-wrap"><h3>El sistema no pudo iniciar</h3><p class="muted">Abrí el sitio desde GitHub Pages o con un servidor local (no con doble clic sobre index.html). Si estás en modo incógnito estricto, el navegador puede bloquear el guardado de datos.</p></div>`;
const writeErr=e=>e&&e.code==="invalid_argument"?"Tu acceso a esta página no permite guardar datos. Pedí acceso de colaborador al hotel.":e&&e.code==="quota_exceeded"?"El sistema alcanzó su capacidad de almacenamiento.":"No pudimos guardar los datos. Revisá tu conexión e intentá de nuevo.";

function renderCuenta(){
  const box=$("cuentaBox");
  if(!ready){box.innerHTML='<p class="muted">Conectando…</p>';return}
  if(!db||!uid){$("cuentaTitle").textContent="Mi cuenta";box.innerHTML=noBackend();return}
  if(acctTab==="adm"&&!isAdmin){$("cuentaTitle").textContent="Acceso de administración";box.innerHTML=`<div class="acct-wrap"><div id="acctPane"></div><p class="small muted" style="margin-top:14px"><a href="#cuenta" data-back-acct>Volver a Mi cuenta</a></p></div>`;box.querySelector("[data-back-acct]").onclick=e=>{e.preventDefault();acctTab="in";renderCuenta()};renderAdminLogin($("acctPane"));return}
  if(loggedIn())return renderPerfil(box);
  $("cuentaTitle").textContent="Iniciá sesión o creá tu cuenta";
  box.innerHTML=`<div class="acct-wrap"><div class="tabs" role="tablist">
    <button class="tab ${acctTab==="in"?"on":""}" data-tab="in" role="tab">Iniciar sesión</button>
    <button class="tab ${acctTab==="up"?"on":""}" data-tab="up" role="tab">Crear cuenta</button>
    <button class="tab ${acctTab==="adm"?"on":""}" data-tab="adm" role="tab">Administración</button></div>
    ${returnTo==="reservar"?'<p class="gate small" style="margin-bottom:14px">Iniciá sesión o creá tu cuenta para continuar con tu reserva. Lo que cargaste queda guardado.</p>':""}
    <div id="acctPane"></div><p class="small muted" style="margin-top:18px">¿Sos parte del equipo? Usá la pestaña <b>Administración</b>.</p></div>`;
  box.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{acctTab=b.dataset.tab;renderCuenta()});
  const pane=$("acctPane");
  if(acctTab==="adm"){renderAdminLogin(pane);return}
  if(acctTab==="in"){
    pane.innerHTML=`<form class="panel" id="loginForm" novalidate>
      <div class="field"><label for="lMail">Email</label><input id="lMail" type="email" autocomplete="email"></div>
      <div class="field"><label for="lPass">Contraseña</label><input id="lPass" type="password" autocomplete="current-password"></div>
      <div class="err" id="lErr" hidden></div>
      <div class="actions"><button class="btn btn-gold" type="submit">Iniciar sesión</button><button type="button" class="btn btn-ghost" data-go="up">Crear cuenta</button></div></form>`;
    pane.querySelector("[data-go]").onclick=()=>{acctTab="up";renderCuenta()};
    $("loginForm").onsubmit=async e=>{e.preventDefault();const m=$("lMail").value.trim().toLowerCase(),pw=$("lPass").value,er=$("lErr");er.hidden=true;
      if(!/^\S+@\S+\.\S+$/.test(m)||!pw){er.textContent="Ingresá tu email y tu contraseña.";er.hidden=false;return}
      try{await SLP.cuentas.ingresar(m,pw);await cargarSesion();
        if(!profile){er.textContent="No encontramos los datos de esa cuenta.";er.hidden=false;return}
        afterLogin("Sesión iniciada")}catch(x){er.textContent=x.message||"Email o contraseña incorrectos.";er.hidden=false;$("lPass").value=""}};
  }else{
    pane.innerHTML=`<form class="panel" id="signForm" novalidate>
      <div class="grid2">
        <div class="field"><label for="sNom">Nombre</label><input id="sNom" autocomplete="given-name"></div>
        <div class="field"><label for="sApe">Apellido</label><input id="sApe" autocomplete="family-name"></div>
        <div class="field"><label for="sMail">Email</label><input id="sMail" type="email" autocomplete="email"></div>
        <div class="field"><label for="sTel">Teléfono</label><input id="sTel" type="tel" autocomplete="tel" placeholder="+598 99 000 000"></div>
        <div class="field"><label for="sPais">País de residencia</label><select id="sPais">${["Uruguay","Argentina","Brasil","Chile","Paraguay","Estados Unidos","España","Otro"].map(p=>`<option>${p}</option>`).join("")}</select></div>
        <div class="field"><label for="sDoc">Documento</label><div style="display:flex;gap:6px"><select id="sDocT" style="width:auto"><option>CI</option><option>DNI</option><option>Pasaporte</option><option>RG/CPF</option></select><input id="sDoc"></div></div>
        <div class="field"><label for="sPass">Contraseña (mín. 8 caracteres)</label><input id="sPass" type="password" autocomplete="new-password"></div>
        <div class="field"><label for="sPass2">Repetí la contraseña</label><input id="sPass2" type="password" autocomplete="new-password"></div>
      </div>
      <label class="check"><input type="checkbox" id="sOk"><span>Acepto los términos del hotel y el tratamiento de mis datos para gestionar mis reservas.</span></label>
      <div class="err" id="sErr" hidden></div>
      <div class="actions"><button class="btn btn-gold" type="submit" id="sBtn">Crear cuenta</button></div></form>`;
    $("signForm").onsubmit=async e=>{e.preventDefault();const er=$("sErr"),v=id=>$(id).value.trim();
      const d={nombre:v("sNom"),apellido:v("sApe"),email:v("sMail").toLowerCase(),tel:v("sTel"),pais:$("sPais").value,docTipo:$("sDocT").value,docNum:v("sDoc"),creado:new Date().toISOString(),mascotas:[]};
      const miss=!d.nombre?"tu nombre":!d.apellido?"tu apellido":!/^\S+@\S+\.\S+$/.test(d.email)?"un email válido":!d.tel?"tu teléfono":!d.docNum?"tu documento":$("sPass").value.length<8?"una contraseña de al menos 8 caracteres":$("sPass").value!==$("sPass2").value?"que las contraseñas coincidan":!$("sOk").checked?"la aceptación de los términos":"";
      if(miss){er.textContent="Falta "+miss+".";er.hidden=false;return}
      $("sBtn").disabled=true;er.hidden=true;
      try{const nu=await SLP.cuentas.registrar(d.email,$("sPass").value);uid=nu;await db.doc("huespedes/"+nu).set(d);profile=d;afterLogin("Cuenta creada")}
      catch(x){er.textContent=x.code==="existe"?x.message:writeErr(x);er.hidden=false;$("sBtn").disabled=false}};
  }
}
async function sha256(t){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}
function renderAdminLogin(pane){
  pane.innerHTML=`<form class="panel" id="admForm" novalidate><h3>Ingreso de administración</h3><p class="small muted">Solo para el equipo de Stay Lux &amp; Pets Hotel.</p>
    <div class="field"><label for="aMail">Email de administración</label><input id="aMail" type="email" autocomplete="username" placeholder="TuGmaill@gmail.com"></div>
    <div class="field"><label for="aPass">Contraseña</label><input id="aPass" type="password" autocomplete="current-password"></div>
    <div class="err" id="aErr" hidden></div><div class="actions"><button class="btn btn-gold" type="submit" id="aBtn">Ingresar</button></div></form>`;
  $("admForm").onsubmit=async e=>{e.preventDefault();const er=$("aErr"),btn=$("aBtn"),m=$("aMail").value.trim().toLowerCase(),pw=$("aPass").value;er.hidden=true;
    if(!db){er.textContent="El acceso no está disponible en esta vista.";er.hidden=false;return}
    btn.disabled=true;
    try{const d=await db.doc("seguridad/admin").get();const a=d.exists?d.data():null;
      if(!a||m!==String(a.email).toLowerCase()||await sha256(a.salt+pw)!==a.hash){er.textContent="Email o contraseña incorrectos.";er.hidden=false;btn.disabled=false;$("aPass").value="";return}
      try{sessionStorage.setItem("slp_admin",SLP.cuentas.dispositivo())}catch(x){}isAdmin=true;acctTab="in";adm.loaded=false;renderChip();renderImages();renderPacks();renderEventos();toast("Sesión de administración iniciada");location.hash="#admin";onView("admin")}
    catch(x){er.textContent="No se pudo verificar el acceso. Intentá de nuevo.";er.hidden=false;btn.disabled=false}};
}
function salirAdmin(){try{sessionStorage.removeItem("slp_admin")}catch(e){}isAdmin=false;adm.loaded=false;renderChip();renderImages();renderPacks();renderEventos();toast("Saliste de administración");location.hash="#inicio"}
document.addEventListener("click",e=>{if(e.target.closest("[data-salir-admin]")){e.preventDefault();salirAdmin()}});
function afterLogin(msg){renderChip();refreshMine();toast(msg);if(returnTo){const r=returnTo;returnTo=null;if(r==="reservar"){bk.step=1}location.hash="#"+r}else renderCuenta()}

async function renderPerfil(box){
  $("cuentaTitle").textContent="Hola, "+profile.nombre;
  const pets=profile.mascotas||[];
  box.innerHTML=`<div class="acct-grid">
    <div class="panel"><h3>Mis datos</h3>
      <dl class="kv"><dt>Nombre</dt><dd>${esc(profile.nombre)} ${esc(profile.apellido)}</dd><dt>Email</dt><dd>${esc(profile.email)}</dd><dt>Teléfono</dt><dd>${esc(profile.tel)}</dd><dt>País</dt><dd>${esc(profile.pais)}</dd><dt>Documento</dt><dd>${esc(profile.docTipo)} ${esc(profile.docNum)}</dd></dl>
      <div class="pts-box" id="ptsBox"><span class="small muted">Lux Club</span><b>…</b></div>
      <h3 style="margin-top:8px">Mis mascotas</h3>
      ${pets.length?pets.map(m=>`<div class="mini-pet">${m.foto?`<img src="${m.foto}" alt="">`:""}<div><b>${esc(m.nombre)}</b><div class="small muted">${esc(m.especie)} · ${esc(m.raza)} · ${esc(m.peso)} kg</div></div></div>`).join(""):'<p class="small muted">Las fichas se guardan al completar tu primera reserva.</p>'}
      <div class="actions"><a class="btn btn-gold" href="#reservar">Nueva reserva</a><button class="btn btn-ghost" id="logout" type="button">Cerrar sesión</button></div>
      ${isAdmin?'<a class="small" href="#admin">Ir al panel de administración</a>':platformAdmin?'<a class="small" href="#cuenta" data-go-adm2>Ingresar como administración</a>':""}
    </div>
    <div style="display:grid;gap:24px;min-width:0"><div class="panel"><h3>Mensajes del hotel</h3><div id="buzon" class="res-list"><p class="muted small">Cargando…</p></div></div>
    <div class="panel"><h3>Mis reservas</h3><div id="mine" class="res-list"><p class="muted small">Cargando…</p></div></div></div></div>`;
  const ga=box.querySelector("[data-go-adm2]");if(ga)ga.onclick=e=>{e.preventDefault();acctTab="adm";renderCuenta()};
  $("logout").onclick=async()=>{SLP.cuentas.salir();await cargarSesion();misReservas=[];renderChip();renderKeycard();renderImages();toast("Sesión cerrada");renderCuenta()};
  try{
    const list=await loadMine();await loadMisCanjes();await loadMensajes();renderKeycard();renderPts();renderBuzon();
    const el=$("mine");if(!el)return;
    el.innerHTML=list.length?list.map(r=>{const pl=planDe(r),rech=pl.some(x=>cobroDe(r,x.n).estado==="rechazado");return `<div class="my-res"><div class="pet-card" style="grid-template-columns:1fr auto;border:0;padding:0"><div><b>${esc(r.estadia.habitacion)} · ${r.estadia.noches} noches</b><div class="muted">${fdate(r.estadia.llegada)} → ${fdate(r.estadia.salida)}</div><div class="muted">Código ${esc(r.codigo)} · USD ${fmt(r.estadia.total)}${r.habitacionNro?" · Hab. "+esc(r.habitacionNro):""}</div><div class="muted">${esc(r.pago?.marca||"")} •••• ${esc(r.pago?.ultimos4||"")}</div></div><span class="pill ${esc(r.estado)}">${esc(r.estado)}</span></div>
      <div class="my-plan">${pl.map(x=>{const cb=cobroDe(r,x.n);return `<span>${x.n===1?"1.er":"2.º"} pago USD ${fmt(x.monto)} · ${fdate(x.fecha)} · <b class="${cb.estado==="cobrado"?"ok":cb.estado==="rechazado"?"err":""}">${cb.estado==="cobrado"?"cobrado":cb.estado==="rechazado"?"rechazado":"pendiente"}</b></span>`}).join("")}</div>
      ${rech?(updOpen===r.codigo?cardUpdateForm(r):`<button type="button" class="btn btn-gold" data-upd-open="${esc(r.codigo)}" style="justify-self:start;padding:8px 14px">Actualizar tarjeta</button>`):""}</div>`}).join(""):'<div class="empty">Todavía no tenés reservas. <a href="#reservar">Hacé la primera</a>.</div>';
    if(updOpen)bindCard("u"+updOpen.replace(/\W/g,""));
  }catch(e){const el=$("mine");if(el)el.innerHTML='<p class="err">No pudimos cargar tus reservas.</p>'}
}
async function attachEstados(list){await Promise.all(list.map(async r=>{try{const s=await db.doc("estados/"+r.codigo).get();if(s.exists){const d=s.data();if(d.estado)r.estado=d.estado;if(d.habitacionNro)r.habitacionNro=d.habitacionNro;if(d.cobros)r.cobros=d.cobros}}catch(e){}}))}
let misReservas=[];
async function loadMine(){
  if(!db||!uid||!loggedIn()){misReservas=[];return misReservas}
  const q=await db.collection(`huespedes/${uid}/reservas`).get();const list=q.docs.map(d=>({...d.data()}));
  await attachEstados(list);list.sort((a,b)=>String(b.creado).localeCompare(String(a.creado)));misReservas=list;return list;
}
/* tarjeta-llave personalizada */
function renderKeycard(){
  const N=$("kcNames"),L=$("kcRoomLbl"),R=$("kcRoom"),T=$("kcNote");if(!N)return;
  R.classList.remove("sm");
  if(!loggedIn()){N.innerHTML="Familia Ruiz &amp; Milo";L.textContent="Habitación";R.textContent="214";T.textContent="“Bienvenidos, Milo y familia. Los estábamos esperando.”";return}
  const hoy=iso(today);
  const prox=misReservas.filter(r=>r.estado!=="cancelada"&&r.estadia&&r.estadia.salida>=hoy).sort((a,b)=>a.estadia.llegada.localeCompare(b.estadia.llegada))[0];
  const pets=(prox&&prox.mascotas&&prox.mascotas.length?prox.mascotas:profile.mascotas||[]).map(m=>m.nombre).filter(Boolean);
  const petTxt=pets.length>1?pets.slice(0,-1).join(", ")+" y "+pets[pets.length-1]:pets[0]||"";
  N.textContent=profile.nombre+(petTxt?" & "+petTxt:"");
  if(prox){
    const enCurso=prox.estadia.llegada<=hoy;
    if(prox.habitacionNro){L.textContent="Habitación";R.textContent=prox.habitacionNro}
    else{L.textContent=prox.estado==="confirmada"?"Confirmada":"Reserva";R.textContent=prox.estadia.habitacion;R.classList.add("sm")}
    const quien=petTxt?`${petTxt} y ${profile.nombre}`:profile.nombre;
    T.textContent=enCurso?`“Bienvenidos, ${quien}. Que disfruten la estadía.”`:prox.estado==="confirmada"?`“${quien}, los esperamos el ${fdate(prox.estadia.llegada)}.”`:`“${quien}, recibimos su reserva para el ${fdate(prox.estadia.llegada)}. En breve la confirmamos.”`;
  }else{
    L.textContent="Lux Club";R.textContent="Arena";R.classList.add("sm");
    T.textContent=petTxt?`“Hola, ${profile.nombre}. ¿Cuándo nos visitan con ${petTxt}?”`:`“Hola, ${profile.nombre}. Te esperamos en Punta del Este.”`;
  }
}
async function refreshMine(){try{await loadMine();await loadMisCanjes();await loadMensajes()}catch(e){}renderKeycard();renderPacks();renderChip()}
function renderPts(){const b=$("ptsBox");if(!b)return;b.innerHTML=`<span class="small muted">Lux Club · Nivel ${nivelLux()}</span><b>${fmt(saldoPuntos())} puntos</b><span class="small muted">Ganaste ${fmt(puntosGanados())} con reservas confirmadas${puntosUsados()?` · usaste ${fmt(puntosUsados())}`:""}</span>${misCanjes.length?`<div class="cj-mini">${misCanjes.map(c=>`<span>${esc(c.titulo)} · ${fmt(c.puntos)} pts <span class="pill ${c.estado==="aprobado"?"confirmada":c.estado==="rechazado"?"cancelada":"pendiente"}">${esc(c.estado)}</span></span>`).join("")}</div>`:""}<a class="small" href="#packs">Canjear puntos por packs</a>`}

/* ===== reserva paso a paso ===== */
const bk={step:0,llegada:iso(addDays(today,14)),salida:iso(addDays(today,17)),room:"premium",guests:2,pets:1,huesped:null,mascotas:[],pago:null,enviado:null};
const steps=()=>["Estadía","Huésped",...(bk.pets?["Mascotas"]:[]),"Pago","Confirmar"];
function renderWiz(){
  const S=steps();if(bk.step>=S.length)bk.step=S.length-1;
  $("wizSteps").innerHTML=S.map((s,i)=>`<li class="${bk.enviado||i<bk.step?"done":i===bk.step?"on":""}"><span>${i+1}</span>${s}</li>`).join("");
  if(bk.enviado)return wDone();
  ({"Estadía":wEstadia,"Huésped":wHuesped,"Mascotas":wMascotas,"Pago":wPago,"Confirmar":wConfirmar})[S[bk.step]]();
  $("wizBody").querySelectorAll("[data-back]").forEach(b=>b.onclick=()=>{bk.step--;renderWiz();scrollWiz()});
}
const scrollWiz=()=>{const t=$("wizSteps").getBoundingClientRect().top+scrollY-90;scrollTo(0,Math.max(0,t))};
const next=()=>{bk.step++;renderWiz();scrollWiz()};
const nav=(back=true,label="Continuar")=>`<div class="err" id="wErr" hidden></div><div class="actions">${back?'<button type="button" class="btn btn-ghost" data-back>Volver</button>':"<span></span>"}<button type="submit" class="btn btn-gold" id="wNext">${label}</button></div>`;
const wErr=t=>{const e=$("wErr");e.textContent=t;e.hidden=false};

function quoteHTML(q){return `<div><div class="q-l">Estadía</div><div class="q-v">${q.nights} ${q.nights===1?"noche":"noches"} · ${q.room.name}</div></div>
  <div><div class="q-l">Habitación</div><div class="q-v">USD ${fmt(q.room$)}</div></div>
  <div><div class="q-l">Mascotas</div><div class="q-v">${bk.pets===0?"—":bk.pets===1?"1ª sin cargo":"USD "+fmt(q.pet$)}</div></div>
  <div class="q-total"><div class="q-l">Total estimado</div><div class="q-v">USD ${fmt(q.total)}</div></div>
  <div><div class="q-l">Lux Club</div><div class="q-v">+${fmt(q.pts)} puntos</div></div>
  <p class="quote-msg">${q.hi?`${q.hi} de ${q.nights} noches en temporada alta. `:"Todas las noches en temporada baja. "}Desayuno incluido; impuestos no incluidos.</p>`}

function wEstadia(){
  const w=$("wizBody");
  w.innerHTML=`<form id="wf" novalidate><h3>¿Cuándo nos visitan?</h3>
    <div class="booking-grid">
      <div class="field"><label for="bIn">Llegada</label><input type="date" id="bIn" min="${iso(today)}" value="${bk.llegada}"></div>
      <div class="field"><label for="bOut">Salida</label><input type="date" id="bOut" value="${bk.salida}"></div>
      <div class="field"><label for="bRoom">Habitación</label><select id="bRoom">${ROOMS.map(r=>`<option value="${r.id}" ${r.id===bk.room?"selected":""}>${r.name}</option>`).join("")}</select></div>
      <div class="field"><label for="bGuests">Huéspedes</label><select id="bGuests">${[1,2,3,4].map(n=>`<option ${n===bk.guests?"selected":""}>${n}</option>`).join("")}</select></div>
      <div class="field"><label for="bPets">Mascotas</label><select id="bPets">${["Sin mascota","1 mascota","2 mascotas"].map((t,i)=>`<option value="${i}" ${i===bk.pets?"selected":""}>${t}</option>`).join("")}</select></div>
    </div>
    <div class="quote show" id="quote" aria-live="polite" style="margin-top:16px"></div>
    <div id="gate"></div>${nav(false)}</form>`;
  const upd=()=>{bk.llegada=$("bIn").value;bk.salida=$("bOut").value;bk.room=$("bRoom").value;bk.guests=+$("bGuests").value;bk.pets=+$("bPets").value;
    const q=quoteOf(bk);$("quote").innerHTML=q.err?`<p class="quote-msg" style="color:#B4483B">${q.err}</p>`:quoteHTML(q)};
  w.querySelectorAll("input,select").forEach(i=>i.addEventListener("change",upd));upd();
  $("wf").onsubmit=e=>{e.preventDefault();upd();const q=quoteOf(bk);if(q.err)return wErr(q.err);
    bk.mascotas.length=Math.min(bk.mascotas.length,bk.pets);
    if(db&&uid&&!loggedIn()){$("gate").innerHTML=`<div class="gate"><b>Para continuar, iniciá sesión</b><span class="small">Así guardamos tu reserva y la ficha de tu mascota en tu cuenta.</span><div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn btn-gold" data-acct="in">Iniciar sesión</button><button type="button" class="btn btn-ghost" data-acct="up">Crear cuenta</button></div></div>`;
      $("gate").querySelectorAll("[data-acct]").forEach(b=>b.onclick=()=>{acctTab=b.dataset.acct;returnTo="reservar";location.hash="#cuenta"});return}
    next()};
}

function wHuesped(){
  const h=bk.huesped||{nombre:profile?.nombre||"",apellido:profile?.apellido||"",email:profile?.email||"",tel:profile?.tel||"",pais:profile?.pais||"Uruguay",docTipo:profile?.docTipo||"CI",docNum:profile?.docNum||"",hora:"15:00",pedidos:""};
  $("wizBody").innerHTML=`<form id="wf" novalidate><h3>Datos del titular de la reserva</h3>
    <div class="grid2" style="margin-top:14px">
      <div class="field"><label for="hNom">Nombres</label><input id="hNom" value="${esc(h.nombre)}" autocomplete="given-name"></div>
      <div class="field"><label for="hApe">Apellidos</label><input id="hApe" value="${esc(h.apellido)}" autocomplete="family-name"></div>
      <div class="field"><label for="hMail">Email</label><input id="hMail" type="email" value="${esc(h.email)}"></div>
      <div class="field"><label for="hTel">Teléfono / WhatsApp</label><input id="hTel" type="tel" value="${esc(h.tel)}"></div>
      <div class="field"><label for="hPais">País de residencia</label><input id="hPais" value="${esc(h.pais)}"></div>
      <div class="field"><label for="hDoc">Documento (${esc(h.docTipo)})</label><input id="hDoc" value="${esc(h.docNum)}"></div>
      <div class="field"><label for="hHora">Hora estimada de llegada</label><select id="hHora">${["12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"].map(t=>`<option ${t===h.hora?"selected":""}>${t}</option>`).join("")}</select></div>
      <div class="field"><label for="hAcomp">Acompañantes</label><input id="hAcomp" placeholder="Nombres de los demás huéspedes" value="${esc(h.acomp||"")}"></div>
      <div class="field span2"><label for="hPed">Pedidos especiales</label><textarea id="hPed" placeholder="Cuna, dieta especial, celebración…">${esc(h.pedidos)}</textarea></div>
    </div>${nav()}</form>`;
  $("wf").onsubmit=e=>{e.preventDefault();const v=id=>$(id).value.trim();
    const d={nombre:v("hNom"),apellido:v("hApe"),email:v("hMail"),tel:v("hTel"),pais:v("hPais"),docTipo:h.docTipo,docNum:v("hDoc"),hora:$("hHora").value,acomp:v("hAcomp"),pedidos:v("hPed")};
    const miss=!d.nombre?"los nombres":!d.apellido?"los apellidos":!/^\S+@\S+\.\S+$/.test(d.email)?"un email válido":!d.tel?"un teléfono":!d.docNum?"el documento":"";
    if(miss)return wErr("Falta "+miss+".");bk.huesped=d;next()};
}

const PET_FIELDS=["nombre","especie","raza","edad","peso","sexo","castrado","temperamento","sociable","alimentacion","alergias","vetNombre","vetTel","vacunas","desparasitado","foto"];
function petForm(i,m){
  const sel=(id,opts,val)=>`<select id="${id}">${opts.map(o=>`<option ${o===val?"selected":""}>${o}</option>`).join("")}</select>`;
  return `<div class="pet-form"><div class="pet-head">
    <div class="photo" id="ph${i}">${m.foto?`<img src="${m.foto}" alt="Foto de ${esc(m.nombre)}">`:PAW}</div>
    <div style="display:grid;gap:6px"><b>Mascota ${i+1}${m.nombre?" · "+esc(m.nombre):""}</b>
    <label class="btn btn-ghost file-btn" style="padding:8px 14px">${m.foto?"Cambiar foto":"Agregar foto"}<input type="file" accept="image/*" id="m${i}_file" aria-label="Foto de la mascota ${i+1}"></label>
    <span class="small muted">JPG o PNG. La usamos para reconocerla en recepción.</span></div></div>
    <div class="grid3">
      <div class="field"><label for="m${i}_nombre">Nombre</label><input id="m${i}_nombre" value="${esc(m.nombre)}"></div>
      <div class="field"><label for="m${i}_especie">Especie</label>${sel(`m${i}_especie`,["Perro","Gato"],m.especie)}</div>
      <div class="field"><label for="m${i}_raza">Raza</label><input id="m${i}_raza" value="${esc(m.raza)}" placeholder="Mestizo, golden…"></div>
      <div class="field"><label for="m${i}_edad">Edad (años)</label><input id="m${i}_edad" type="number" min="0" max="30" step="0.5" value="${esc(m.edad)}"></div>
      <div class="field"><label for="m${i}_peso">Peso (kg)</label><input id="m${i}_peso" type="number" min="0.5" max="100" step="0.5" value="${esc(m.peso)}"></div>
      <div class="field"><label for="m${i}_sexo">Sexo</label>${sel(`m${i}_sexo`,["Macho","Hembra"],m.sexo)}</div>
      <div class="field"><label for="m${i}_castrado">Castrado/a</label>${sel(`m${i}_castrado`,["Sí","No"],m.castrado)}</div>
      <div class="field"><label for="m${i}_temperamento">Temperamento</label>${sel(`m${i}_temperamento`,["Tranquilo","Juguetón","Activo","Nervioso","Reactivo con extraños"],m.temperamento)}</div>
      <div class="field"><label for="m${i}_sociable">Con otros animales</label>${sel(`m${i}_sociable`,["Sociable","Prefiere distancia","No convive con otros"],m.sociable)}</div>
      <div class="field"><label for="m${i}_alimentacion">Alimentación</label><input id="m${i}_alimentacion" value="${esc(m.alimentacion)}" placeholder="Marca, porción y horarios"></div>
      <div class="field"><label for="m${i}_alergias">Alergias o medicación</label><input id="m${i}_alergias" value="${esc(m.alergias)}" placeholder="Ninguna"></div>
      <div class="field"><label for="m${i}_vetNombre">Veterinario de cabecera</label><input id="m${i}_vetNombre" value="${esc(m.vetNombre)}"></div>
      <div class="field"><label for="m${i}_vetTel">Teléfono del veterinario</label><input id="m${i}_vetTel" type="tel" value="${esc(m.vetTel)}"></div>
    </div>
    <label class="check"><input type="checkbox" id="m${i}_vacunas" ${m.vacunas?"checked":""}><span>Tiene las vacunas al día y presentará la libreta sanitaria en el check-in.</span></label>
    <label class="check"><input type="checkbox" id="m${i}_desparasitado" ${m.desparasitado?"checked":""}><span>Está desparasitado/a (interna y externa).</span></label></div>`;
}
function collectPets(){for(let i=0;i<bk.pets;i++){const m=bk.mascotas[i]||{};PET_FIELDS.forEach(f=>{const el=$(`m${i}_${f}`);if(!el)return;m[f]=el.type==="checkbox"?el.checked:el.value.trim()});bk.mascotas[i]=m}}
function compress(file){return new Promise((res,rej)=>{const img=new Image(),url=URL.createObjectURL(file);img.onload=()=>{const sc=Math.min(1,360/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);res(c.toDataURL("image/jpeg",.78))};img.onerror=()=>{URL.revokeObjectURL(url);rej()};img.src=url})}
function wMascotas(){
  const saved=profile?.mascotas||[];
  for(let i=0;i<bk.pets;i++)bk.mascotas[i]=bk.mascotas[i]||{especie:"Perro",sexo:"Macho",castrado:"Sí",temperamento:"Tranquilo",sociable:"Sociable"};
  $("wizBody").innerHTML=`<form id="wf" novalidate><h3>Ficha de ${bk.pets===1?"tu mascota":"tus mascotas"}</h3>
    <p class="muted small">Con esta información preparamos su cama, su comida y elegimos la mesa en el restaurante según su temperamento.</p>
    ${saved.length?`<div><p class="small muted" style="margin-bottom:6px">Usar una ficha guardada:</p><div class="saved-pets">${saved.map((m,k)=>`<button type="button" data-saved="${k}">${m.foto?`<img src="${m.foto}" alt="">`:""}${esc(m.nombre)}</button>`).join("")}</div></div>`:""}
    ${bk.mascotas.slice(0,bk.pets).map((m,i)=>petForm(i,m)).join("")}${nav()}</form>`;
  $("wizBody").querySelectorAll("[data-saved]").forEach(b=>b.onclick=()=>{collectPets();const m=JSON.parse(JSON.stringify(saved[+b.dataset.saved]));let slot=bk.mascotas.findIndex((x,i)=>i<bk.pets&&!x.nombre);if(slot<0)slot=0;bk.mascotas[slot]=m;wMascotas();});
  for(let i=0;i<bk.pets;i++){$(`m${i}_file`).onchange=async ev=>{const f=ev.target.files[0];if(!f)return;if(!f.type.startsWith("image/")){toast("Elegí un archivo de imagen");return}
    try{const url=await compress(f);bk.mascotas[i].foto=url;$("ph"+i).innerHTML=`<img src="${url}" alt="Foto de la mascota">`;ev.target.parentNode.firstChild.textContent="Cambiar foto"}catch(e){toast("No pudimos leer esa imagen")}}}
  $("wf").onsubmit=e=>{e.preventDefault();collectPets();
    for(let i=0;i<bk.pets;i++){const m=bk.mascotas[i],n=m.nombre||`la mascota ${i+1}`;
      const miss=!m.nombre?"el nombre":!m.raza?"la raza":m.edad===""?"la edad":!m.peso?"el peso":!m.alimentacion?"la alimentación":!m.vetNombre?"el veterinario de cabecera":!m.foto?"la foto":!m.vacunas?"confirmar las vacunas al día":!m.desparasitado?"confirmar la desparasitación":"";
      if(miss)return wErr(`Falta ${miss} de ${n}.`)}
    next()};
}

const luhn=n=>{let s=0,alt=false;for(let i=n.length-1;i>=0;i--){let d=+n[i];if(alt){d*=2;if(d>9)d-=9}s+=d;alt=!alt}return s%10===0};
const brandOf=n=>/^4/.test(n)?"VISA":/^(5[1-5]|2[2-7])/.test(n)?"MASTERCARD":/^3[47]/.test(n)?"AMEX":/^(589562|60)/.test(n)?"OCA":"";
function wPago(){
  const p=bk.pago||{},q=quoteOf(bk),pl=planPagos(bk.llegada,q.total);
  $("wizBody").innerHTML=`<form id="wf" novalidate autocomplete="off"><h3>Tarjeta de crédito</h3>
    <div class="demo" style="margin-top:10px"><span>🛈</span><div><b>Modo demostración: solo se aceptan tarjetas de prueba.</b>Este es un proyecto académico. No ingreses una tarjeta real. Los cobros se simulan.</div></div>
    ${testCardsHTML()}
    <div style="margin-top:14px">${cardFields({titular:p.titular||((bk.huesped?.nombre||"")+" "+(bk.huesped?.apellido||"")).trim()},"p")}</div>
    <h4 class="plan-h">Cómo se cobra tu estadía (USD ${fmt(q.total)})</h4>${planHTML(pl)}
    <p class="small muted">Debe ser una tarjeta de crédito. Cancelación sin cargo hasta 7 días antes de la llegada, antes del primer cobro.</p>${nav()}</form>`;
  const get=bindCard("p");
  $("wf").onsubmit=e=>{e.preventDefault();const r=get();if(r.err)return wErr(r.err);bk.pago=r.pago;next()};
}

function petSummary(m){return `<div class="mini-pet">${m.foto?`<img src="${m.foto}" alt="">`:""}<div><b>${esc(m.nombre)}</b><div class="small muted">${esc(m.especie)} · ${esc(m.raza)} · ${esc(m.edad)} años · ${esc(m.peso)} kg · ${esc(m.temperamento)}</div></div></div>`}
function wConfirmar(){
  const q=quoteOf(bk),h=bk.huesped,p=bk.pago;
  $("wizBody").innerHTML=`<form id="wf" novalidate><h3>Revisá y enviá tu reserva</h3><div class="sum">
    <section><h4>Estadía</h4><dl class="kv"><dt>Fechas</dt><dd>${fdate(bk.llegada)} → ${fdate(bk.salida)} (${q.nights} noches)</dd><dt>Habitación</dt><dd>${q.room.name} · ${bk.guests} huéspedes</dd><dt>Total estimado</dt><dd><b>USD ${fmt(q.total)}</b> + impuestos · suma ${fmt(q.pts)} puntos Lux Club</dd></dl></section>
    <section><h4>Titular</h4><dl class="kv"><dt>Nombre</dt><dd>${esc(h.nombre)} ${esc(h.apellido)}</dd><dt>Contacto</dt><dd>${esc(h.email)} · ${esc(h.tel)}</dd><dt>Documento</dt><dd>${esc(h.docTipo)} ${esc(h.docNum)}</dd><dt>Llegada</dt><dd>${esc(h.hora)} h</dd>${h.pedidos?`<dt>Pedidos</dt><dd>${esc(h.pedidos)}</dd>`:""}</dl></section>
    ${bk.pets?`<section><h4>Mascotas</h4><div style="display:grid;gap:10px">${bk.mascotas.slice(0,bk.pets).map(petSummary).join("")}</div></section>`:""}
    <section><h4>Pago</h4><p>${esc(p.marca)} crédito terminada en ${esc(p.ultimos4)} · ${esc(p.titular)}</p>${planHTML(planPagos(bk.llegada,q.total))}</section>
    <label class="check"><input type="checkbox" id="cOk"><span>Leí y acepto las <a href="#politicas">políticas para mascotas</a> y la política de cancelación.</span></label>
    </div>${nav(true,"Enviar reserva")}</form>`;
  $("wf").onsubmit=async e=>{e.preventDefault();if(!$("cOk").checked)return wErr("Aceptá las políticas para enviar la reserva.");
    if(!db||!uid)return wErr("No hay conexión con el sistema de reservas en esta vista. Recargá la página e intentá de nuevo.");
    const btn=$("wNext");btn.disabled=true;btn.textContent="Enviando…";
    const codigo="SLP-"+Date.now().toString(36).toUpperCase().slice(-5)+Math.random().toString(36).slice(2,4).toUpperCase();
    const doc={codigo,creado:new Date().toISOString(),estado:"pendiente",
      estadia:{llegada:bk.llegada,salida:bk.salida,noches:q.nights,nochesAlta:q.hi,habitacion:q.room.name,huespedes:bk.guests,mascotas:bk.pets,totalHabitacion:q.room$,totalMascotas:q.pet$,total:q.total,puntos:q.pts},
      huesped:h,mascotas:bk.mascotas.slice(0,bk.pets),pago:bk.pago,plan:planPagos(bk.llegada,q.total)};
    try{await db.doc(`huespedes/${uid}/reservas/${codigo}`).set(doc)}catch(x){btn.disabled=false;btn.textContent="Enviar reserva";return wErr(writeErr(x))}
    const saved=[...(profile?.mascotas||[])];doc.mascotas.forEach(m=>{const k=saved.findIndex(s=>String(s.nombre).toLowerCase()===String(m.nombre).toLowerCase());k>=0?saved[k]=m:saved.push(m)});
    try{await db.doc("huespedes/"+uid).update({mascotas:saved.slice(-4)});profile.mascotas=saved.slice(-4)}catch(x){}
    bk.enviado=codigo;adm.loaded=false;renderWiz();scrollWiz();refreshMine()};
}
function wDone(){
  $("wizBody").innerHTML=`<div class="done-box"><svg width="48" height="56" style="color:var(--accent)"><use href="#crest"/></svg>
    <h3>¡Reserva enviada!</h3><div class="code">${esc(bk.enviado)}</div>
    <p class="muted" style="max-width:52ch">El equipo del hotel la revisa y la confirma. Podés seguir su estado en <a href="#cuenta">Mi cuenta</a>.${bk.pets?` ${esc(bk.mascotas[0]?.nombre||"Tu mascota")} ya tiene su ficha lista.`:""}</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><a class="btn btn-gold" href="#cuenta">Ver mis reservas</a><button class="btn btn-ghost" id="again" type="button">Hacer otra reserva</button></div></div>`;
  $("again").onclick=()=>{Object.assign(bk,{step:0,huesped:null,mascotas:[],pago:null,enviado:null});renderWiz()};
}
$("roomsGrid").addEventListener("click",e=>{const b=e.target.closest("[data-room]");if(!b)return;bk.room=b.dataset.room;bk.step=0;bk.enviado=null});

/* ===== administración ===== */
const adm={list:[],filtro:"todas",loaded:false,loading:false,huespedes:0,err:"",tab:"res"};
const ATABS=[["res","Reservas"],["cobros","Cobros"],["consultas","Consultas"],["kpi","KPIs"],["canjes","Canjes"],["tar","Tarifas y costos"],["img","Imágenes del sitio"],["mail","Emails"],["bd","Base de datos"]];
const admTabs=()=>{const nq=(adm.consultas||[]).filter(c=>c.estado==="nueva").length;return `<div class="adm-bar"><span class="small muted">Sesión de administración · stayluxpetshotel@gmail.com</span><button type="button" class="btn btn-ghost" data-salir-admin style="padding:6px 14px">Salir de administración</button></div><div class="tabs adm-tabs" role="tablist">${ATABS.map(([k,t])=>`<button class="tab ${adm.tab===k?"on":""}" data-atab="${k}" role="tab">${t}${k==="consultas"&&nq?` <span class="badge">${nq}</span>`:""}</button>`).join("")}</div>`};
document.addEventListener("click",e=>{const t=e.target.closest("[data-atab]");if(!t)return;adm.tab=t.dataset.atab;if(["res","kpi","canjes","consultas","cobros"].includes(adm.tab)&&!adm.loaded&&!adm.loading&&db)loadAdmin();else renderAdmin()});
async function loadAdmin(){
  adm.loading=true;adm.err="";renderAdmin();
  try{
    const hs=await db.collection("huespedes").get();adm.huespedes=hs.size;const all=[];
    const cj=[];await Promise.all(hs.docs.map(async h=>{const q=await db.collection(`huespedes/${h.id}/reservas`).get();q.docs.forEach(d=>{all.push({...d.data(),_uid:h.id})});
      try{const c=await db.collection(`huespedes/${h.id}/canjes`).get();c.docs.forEach(d=>cj.push({...d.data()}))}catch(e){}}));
    const es=await db.collection("estados").get();const em={};es.docs.forEach(d=>em[d.id]=d.data());all.forEach(r=>{const x=em[r.codigo];if(x){if(x.estado)r.estado=x.estado;if(x.habitacionNro)r.habitacionNro=x.habitacionNro;if(x.cobros)r.cobros=x.cobros}});
    const cq=[];try{const qs=await db.collection("consultas").get();await Promise.all(qs.docs.map(async d=>{const q=await db.collection(`consultas/${d.id}/mensajes`).get();q.docs.forEach(x=>cq.push({...x.data(),_path:`consultas/${d.id}/mensajes/${x.id}`}))}))}catch(e){}
    cq.sort((a,b)=>String(b.creado).localeCompare(String(a.creado)));adm.consultas=cq;
    cj.forEach(c=>{const x=em[c.codigo];if(x&&x.estado)c.estado=x.estado});cj.sort((a,b)=>String(b.creado).localeCompare(String(a.creado)));adm.canjes=cj;
    all.sort((a,b)=>String(b.creado).localeCompare(String(a.creado)));adm.list=all;adm.loaded=true;
  }catch(e){adm.err="No pudimos cargar las reservas. Intentá actualizar."}
  adm.loading=false;renderAdmin();
}
function renderAdmin(){
  const box=$("adminBox");
  if(!ready){box.innerHTML='<p class="muted">Conectando…</p>';return}
  if(!db||!uid){box.innerHTML=noBackend();return}
  if(!isAdmin&&platformAdmin){box.innerHTML=`<div class="panel acct-wrap"><h3>Ingresá como administración</h3><p class="muted">Para ver reservas, cobros y KPIs ingresá con el email y la contraseña de administración del hotel.</p><div><a class="btn btn-gold" href="#cuenta" data-go-adm>Ingresar</a></div></div>`;box.querySelector("[data-go-adm]").onclick=()=>{acctTab="adm"};return}
  if(!isAdmin){box.innerHTML=`<div class="panel acct-wrap"><h3>Acceso restringido</h3><p class="muted">Este panel es solo para el equipo del hotel.</p><div><a class="btn btn-ghost" href="#cuenta">Ir a Mi cuenta</a></div></div>`;return}
  if(adm.tab==="img"){box.innerHTML=admTabs();renderAdminImgs(box);return}
  if(adm.tab==="tar"){box.innerHTML=admTabs();renderTarifasAdmin(box);return}
  if(adm.tab==="mail"){box.innerHTML=admTabs();renderCorreosAdmin(box);return}
  if(adm.tab==="bd"){box.innerHTML=admTabs();renderBaseAdmin(box);return}
  if(adm.tab==="kpi"&&adm.loaded){box.innerHTML=admTabs();renderKPIs(box);return}
  if(adm.tab==="canjes"&&adm.loaded){box.innerHTML=admTabs();renderCanjesAdmin(box);return}
  if(adm.tab==="cobros"&&adm.loaded){box.innerHTML=admTabs();renderCobrosAdmin(box);return}
  if(adm.tab==="consultas"&&adm.loaded){box.innerHTML=admTabs();renderConsultasAdmin(box);return}
  if(adm.loading&&!adm.loaded){box.innerHTML=admTabs()+'<p class="muted">Cargando reservas…</p>';return}
  const L=adm.list,act=L.filter(r=>r.estado!=="cancelada");
  const k={tot:L.length,pend:L.filter(r=>r.estado==="pendiente").length,conf:L.filter(r=>r.estado==="confirmada").length,
    ing:act.reduce((s,r)=>s+(r.estadia?.total||0),0),noches:act.reduce((s,r)=>s+(r.estadia?.noches||0),0),pets:act.reduce((s,r)=>s+(r.mascotas?.length||0),0)};
  const F=adm.filtro==="todas"?L:L.filter(r=>r.estado===adm.filtro);
  box.innerHTML=admTabs()+`<div class="kpis"><div><b>${k.tot}</b><span>reservas recibidas</span></div><div><b>${k.pend}</b><span>pendientes de confirmar</span></div><div><b>${k.conf}</b><span>confirmadas</span></div><div><b>${fmt(k.noches)}</b><span>noches vendidas · ${k.pets} mascotas</span></div><div><b>USD ${fmt(k.ing)}</b><span>ingreso estimado (sin canceladas)</span></div></div>
    <div class="filters">${["todas","pendiente","confirmada","cancelada"].map(f=>`<button type="button" class="${adm.filtro===f?"on":""}" data-f="${f}">${f==="todas"?"Todas":f[0].toUpperCase()+f.slice(1)+"s"}</button>`).join("")}<span class="sp"></span><span class="small muted">${adm.huespedes} huéspedes registrados</span><button type="button" class="btn btn-ghost" id="admCsv" style="padding:6px 14px">Descargar CSV</button><button type="button" class="btn btn-ghost" id="admRef" style="padding:6px 14px">${adm.loading?"Actualizando…":"Actualizar"}</button></div>
    ${adm.err?`<p class="err">${adm.err}</p>`:""}
    <div class="res-list">${F.length?F.map(resRow).join(""):`<div class="empty">${L.length?"No hay reservas con este estado.":"Todavía no llegaron reservas. Cuando un huésped complete el proceso de reserva, aparece acá con su ficha de mascota."}</div>`}</div>`;
  box.querySelectorAll("[data-f]").forEach(b=>b.onclick=()=>{adm.filtro=b.dataset.f;renderAdmin()});
  $("admRef").onclick=loadAdmin;$("admCsv").onclick=exportCSV;
  box.querySelectorAll("[data-estado]").forEach(s=>{s.onclick=e=>e.stopPropagation();s.onchange=async()=>{const c=s.dataset.estado,v=s.value,r=adm.list.find(x=>x.codigo===c),old=r.estado;r.estado=v;
    try{await saveEstado(r);let av=false;if(v!==old&&(v==="confirmada"||v==="cancelada"))av=await avisarHuesped(r,v==="confirmada"?"reserva_confirmada":"reserva_cancelada");
      toast("Reserva "+v+(av?" · se le avisa al huésped por email":""));renderAdmin()}catch(x){r.estado=old;s.value=old;toast("No se pudo cambiar el estado")}}});
  box.querySelectorAll("[data-hab]").forEach(f=>{f.onclick=e=>e.stopPropagation();f.onsubmit=async e=>{e.preventDefault();const c=f.dataset.hab,r=adm.list.find(x=>x.codigo===c),v=f.querySelector("input").value.trim().slice(0,8);
    const oldH=r.habitacionNro;r.habitacionNro=v;try{await saveEstado(r);let av=false;if(v&&v!==oldH&&r.estado!=="cancelada")av=await avisarHuesped(r,"habitacion_asignada");toast(v?"Habitación "+v+" asignada"+(av?" · se le avisa al huésped":""):"Habitación sin asignar")}catch(x){r.habitacionNro=oldH;toast("No se pudo guardar la habitación")}}});
}
function resRow(r){
  const e=r.estadia||{},h=r.huesped||{},p=r.pago||{},M=r.mascotas||[];
  return `<details class="res"><summary>
    <span class="pill ${esc(r.estado)}">${esc(r.estado)}</span>
    <div class="who"><b>${esc(h.nombre)} ${esc(h.apellido)}</b><span>${esc(e.habitacion)} · ${fdate(e.llegada)} → ${fdate(e.salida)} · ${e.noches} noches · ${esc(r.codigo)}</span></div>
    <div class="thumbs">${M.map(m=>m.foto?`<img src="${m.foto}" alt="${esc(m.nombre)}">`:`<i>${esc((m.nombre||"?")[0])}</i>`).join("")}</div>
    <div class="amt">USD ${fmt(e.total||0)}</div></summary>
    <div class="res-body">
      <div><h4>Titular</h4><dl class="kv"><dt>Email</dt><dd>${esc(h.email)}</dd><dt>Teléfono</dt><dd>${esc(h.tel)}</dd><dt>País</dt><dd>${esc(h.pais)}</dd><dt>Documento</dt><dd>${esc(h.docTipo)} ${esc(h.docNum)}</dd>${h.acomp?`<dt>Acompañan</dt><dd>${esc(h.acomp)}</dd>`:""}</dl></div>
      <div><h4>Estadía</h4><dl class="kv"><dt>Huéspedes</dt><dd>${e.huespedes}</dd><dt>Llegada</dt><dd>${esc(h.hora)} h</dd><dt>Alta / baja</dt><dd>${e.nochesAlta} / ${e.noches-e.nochesAlta} noches</dd><dt>Habitación</dt><dd>USD ${fmt(e.totalHabitacion||0)}</dd><dt>Mascotas</dt><dd>USD ${fmt(e.totalMascotas||0)}</dd><dt>Puntos</dt><dd>${fmt(e.puntos||0)}</dd>${h.pedidos?`<dt>Pedidos</dt><dd>${esc(h.pedidos)}</dd>`:""}</dl></div>
      <div><h4>Pago y estado</h4><dl class="kv"><dt>Tarjeta</dt><dd><span class="num">${esc(p.marca)} •••• •••• •••• ${esc(p.ultimos4)}</span> <button type="button" class="copy" data-reveal="${esc(r.codigo)}">Ver tarjeta</button><div id="cv-${esc(r.codigo)}"></div></dd><dt>Titular</dt><dd>${esc(p.titular)}</dd><dt>Recibida</dt><dd>${new Date(r.creado).toLocaleString("es-UY",{dateStyle:"medium",timeStyle:"short"})}</dd></dl>
        <div class="field" style="margin-top:10px"><label for="st-${esc(r.codigo)}">Cambiar estado</label><select class="state-sel" id="st-${esc(r.codigo)}" data-estado="${esc(r.codigo)}">${["pendiente","confirmada","cancelada"].map(s=>`<option ${s===r.estado?"selected":""}>${s}</option>`).join("")}</select></div>
        <form class="field" data-hab="${esc(r.codigo)}" style="margin-top:10px"><label for="hn-${esc(r.codigo)}">Nº de habitación asignada</label><div style="display:flex;gap:6px"><input id="hn-${esc(r.codigo)}" class="state-sel" style="flex:1;min-width:0" maxlength="8" placeholder="Ej. 214" value="${esc(r.habitacionNro||"")}"><button class="btn btn-ghost" style="padding:6px 12px" type="submit">Guardar</button></div><span class="small muted">El huésped lo ve en su tarjeta de bienvenida.</span></form></div>
      ${M.length?`<div class="pets"><h4 style="grid-column:1/-1;margin-bottom:0">Fichas de mascotas</h4>${M.map(m=>`<div class="pet-card">${m.foto?`<img src="${m.foto}" alt="Foto de ${esc(m.nombre)}">`:'<div class="ph"></div>'}<div><b>${esc(m.nombre)}</b><div class="muted">${esc(m.especie)} · ${esc(m.raza)} · ${esc(m.sexo)}${m.castrado==="Sí"?" castrado/a":""}</div><div>${esc(m.edad)} años · ${esc(m.peso)} kg · ${esc(m.temperamento)} · ${esc(m.sociable)}</div><div>Come: ${esc(m.alimentacion)}</div><div>Alergias: ${esc(m.alergias||"ninguna")}</div><div>Vet: ${esc(m.vetNombre)} ${esc(m.vetTel)}</div><div>${m.vacunas?"✓ Vacunas":"✗ Vacunas"} · ${m.desparasitado?"✓ Desparasitado":"✗ Desparasitado"}</div></div></div>`).join("")}</div>`:""}
    </div></details>`;
}

function currentView(){let v=(location.hash||"#inicio").slice(1);return VIEWS.includes(v)?v:"inicio"}
function onView(v){
  if(v==="cuenta")renderCuenta();
  else if(v==="reservar")renderWiz();
  else if(v==="admin"){if(ready&&isAdmin&&db&&!adm.loaded&&!adm.loading)loadAdmin();else renderAdmin()}
}

/* calc */
const calc=()=>{const s=+$("cSpend").value,r=+$("cTier").value,p=Math.round(s*r);$("cSpendV").textContent="USD "+fmt(s);$("cPts").textContent=fmt(p);$("cNights").textContent=Math.floor(p/REDEEM.boutique)};
$("cSpend").oninput=calc;$("cTier").onchange=calc;calc();

/* toast & copy */
const toast=t=>{const el=$("toast");el.textContent=t;el.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove("show"),1800)};
const copyText=(txt,el)=>{try{navigator.clipboard.writeText(txt).then(()=>toast("Copiado"),()=>selectEl(el))}catch(e){selectEl(el)}};
const selectEl=el=>{if(!el)return;const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);toast("Texto seleccionado: copialo")};
document.querySelectorAll("[data-copy]").forEach(b=>b.onclick=()=>{const el=$(b.dataset.copy);copyText(el.textContent,el)});

/* contact */
$("contactForm").addEventListener("submit",async e=>{
  e.preventDefault();const n=$("fName").value.trim(),m=$("fMail").value.trim(),err=$("fErr"),btn=$("fSend");
  if(!n||!/^\S+@\S+\.\S+$/.test(m)){err.textContent="Completá tu nombre y un email válido para que podamos responderte.";err.hidden=false;return}
  const msg=$("fMsg").value.trim();if(!msg){err.textContent="Escribí tu consulta en el mensaje.";err.hidden=false;return}
  err.hidden=true;
  const c={nombre:n.slice(0,80),email:m.slice(0,120),fechas:$("fDates").value.trim().slice(0,80),mascota:$("fPet").value.trim().slice(0,120),mensaje:msg.slice(0,2000),creado:new Date().toISOString(),estado:"nueva"};
  if(db&&uid){btn.disabled=true;btn.textContent="Enviando…";
    const id="CQ-"+Date.now().toString(36).toUpperCase().slice(-6)+Math.random().toString(36).slice(2,4).toUpperCase();c.codigo=id;
    try{await db.doc("consultas/"+uid).set({nombre:c.nombre,email:c.email,ultima:c.creado});await db.doc(`consultas/${uid}/mensajes/${id}`).set(c);
      $("contactForm").reset();$("draft").textContent=`¡Gracias, ${n}! Recibimos tu consulta (${id}). Te respondemos a ${m}.`;$("draft").hidden=false;$("draftBtns").hidden=true;
      btn.disabled=false;btn.textContent="Enviar consulta";adm.loaded=false;toast("Consulta enviada");return}
    catch(x){btn.disabled=false;btn.textContent="Enviar consulta"}}
  const txt=`Hola, equipo de Stay Lux & Pets Hotel:\n\nSoy ${n} (${m}).${c.fechas?`\nFechas tentativas: ${c.fechas}.`:""}${c.mascota?`\nViajo con: ${c.mascota}.`:""}\n\n${msg}\n\nGracias.`;
  err.textContent="No pudimos enviar la consulta desde esta vista. Copiá el mensaje y mandalo a reservas@staylux.com.uy o por WhatsApp.";err.hidden=false;
  $("draft").textContent=txt;$("draft").hidden=false;$("draftBtns").hidden=false;
});
$("copyDraft").onclick=()=>copyText($("draft").textContent,$("draft"));

/* concierge virtual */
const kb=()=>`Sos el concierge virtual de Stay Lux & Pets Hotel, hotel boutique pet-friendly de lujo en Playa Brava, Punta del Este, Uruguay. Claim: "Lujo en buena compañía".
Tono: cálido, refinado, cercano; voseo rioplatense. Si el huésped escribe en otro idioma (inglés, portugués), respondé en ese idioma. Respuestas breves (máx. 120 palabras), sin markdown ni listas largas. Nunca trates a la mascota como juguete ni uses tono infantil.
Reglas: No confirmás reservas ni cobrás; para confirmar, derivá a reservas@staylux.com.uy o WhatsApp +598 99 123 456. No inventes servicios, precios ni políticas que no figuren abajo; si no sabés, decilo y derivá a recepción. Ante una emergencia de salud de una mascota: pedir que llamen ya a recepción (+598 4249 0000, 24 h), que activa la veterinaria de convenio. Sobre requisitos legales para entrar a Uruguay con mascotas desde otro país, indicá que consulten al servicio veterinario oficial (MGAP) y al de su país de origen, y que el hotel puede orientar pero no reemplaza esa información.
DATOS DEL HOTEL
- 55 unidades: Boutique (15), Premium (25), Luxury con terraza privada (10), Suites en 3.ª planta (4), Penthouse en 4.ª planta (1). Hasta 2 mascotas por habitación (perros y gatos).
- Tarifas por noche en USD, doble, desayuno incluido, impuestos no incluidos. Temporada alta 15/12 al 15/3; resto temporada baja. ${ROOMS.map(r=>`${r.name} ${r.high}/${r.low}`).join(", ")} (alta/baja). Capacidad: Boutique y Luxury 2 huéspedes; Premium, Suite y Penthouse hasta 4. 1.ª mascota sin cargo; 2.ª mascota USD ${PET2} por noche.
- Check-in 15 h, check-out 11 h, recepción 24 h. Check-in en menos de 5 minutos con agua y snack para la mascota y kit de bienvenida (juguetes orgánicos, bolsas biodegradables, snacks artesanales, mapa de playas pet-friendly).
- Servicios: restaurante de autor pet-friendly con menú pet; spa con masajes, sauna y piscina climatizada en planta alta con terraza; gimnasio; café workspace y coworking con salas privadas; tienda boutique; spa pet (baño, peluquería, masajes; operado por spa pet asociado); paseos (servicio asociado) y guardería diurna; jardín, senderos y circuito de agility; consultorio veterinario/estética en 1.ª planta y emergencias con clínica de convenio; conserjería en español, inglés y portugués; estacionamiento propio.
- Política: ficha de la mascota al reservar (raza, edad, tamaño, temperamento, alimentación, veterinario); libreta sanitaria con vacunas y desparasitación al día, verificada en check-in; correa en áreas comunes; no dejar la mascota sola por períodos prolongados (usar guardería/paseos); el huésped responde por su mascota y el hotel puede reubicarla ante conflictos.
- Playas habilitadas para mascotas por la Intendencia de Maldonado: Playa Brava paradas 25 a 27 y Playa Mansa paradas 39 y 40; con collar y correa.
- Packs: ${PACKS.map(p=>`${p.titulo} (${p.temporada}): ${(p.items||[]).join(", ")}; USD ${p.precio} ${p.nota}${p.puntos?`; o ${p.puntos} puntos Lux Club`:""}`).join(". ")}. Los socios canjean puntos desde la página Packs con su sesión iniciada.
- Eventos próximos: ${EVENTOS.filter(v=>v.fecha>=iso(today)).map(v=>`${v.titulo} el ${v.fecha} a las ${v.hora}${v.precio?` (${v.precio})`:""}`).join("; ")||"consultar en la página Eventos"}.
- Para reservar: botón Reservar del sitio. El proceso pide fechas y habitación, iniciar sesión o crear cuenta, datos del titular, ficha de cada mascota con foto, tarjeta de crédito (no débito; se cobra 50% siete días antes del check-in y 50% en el check-in; cancelación sin cargo hasta 7 días antes de la llegada) y confirmación. Luego el equipo confirma la reserva y el huésped ve el estado en Mi cuenta.
- Lux Club (gratis): 10 puntos por USD gastado en habitación, mínimo 1.000 por estadía. Niveles: Arena (al inscribirse), Oliva (5+ noches/año, +10% puntos, late check-out 14 h, 1 spa pet/año), Champagne (15+ noches/año, +20% puntos, upgrade según disponibilidad, canje también en temporada alta, acceso preferente a eventos). Canje por noche: Boutique 15.000, Premium 20.000, Luxury 28.000, Suite 38.000, Penthouse 68.000 puntos. Arena y Oliva canjean de abril a noviembre. 3.000 puntos = USD 30 en spa pet, restaurante o tienda. Los puntos vencen tras 18 meses sin actividad; noches canjeadas no suman puntos.`;
let sample=null,turns=[],ctl=null,busy=false;
const msgs=$("msgs"),status=$("chatStatus"),inp=$("chatIn"),send=$("chatSend");
const add=(cls,t)=>{const d=document.createElement("div");d.className="msg "+cls;d.textContent=t;msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;return d};
const offline=()=>{status.textContent="Fuera de línea";inp.disabled=true;send.disabled=true;$("chips").hidden=true;add("sys","El concierge virtual no está disponible en esta vista. Escribinos a reservas@staylux.com.uy o por WhatsApp al +598 99 123 456.")};
if(window.claude&&claude.use){claude.use("sample").then(s=>{sample=s;if(!s)offline()}).catch(offline)}else{setTimeout(offline,0)}
const ERR={rate_limited:"Recibimos muchas consultas seguidas. Probá de nuevo en un momento.",session_expired:"Tu sesión expiró. Volvé a iniciar sesión para seguir.",refused:"No puedo ayudarte con eso. ¿Te paso con recepción?",empty_completion:"No logré responder. ¿Podés reformular la pregunta?",prompt_too_large:"La conversación es muy larga. Recargá la página para empezar de nuevo."};
async function ask(q){
  if(busy||!q.trim())return;
  if(!sample){add("sys","El concierge todavía se está conectando. Probá en unos segundos.");return}
  busy=true;send.disabled=true;add("me",q);turns.push({role:"user",content:q});
  if(turns.length>16)turns=turns.slice(-16);while(turns[0]&&turns[0].role!=="user")turns.shift();
  const bubble=add("bot","Escribiendo…");status.textContent="Escribiendo…";ctl=new AbortController();
  try{
    const {text}=await sample([{role:"user",content:kb()+"\n\nA partir de ahora respondé al huésped."},...turns],{cache:false,modelTier:"quick",signal:ctl.signal,onText:({text})=>{bubble.textContent=text;msgs.scrollTop=msgs.scrollHeight}});
    bubble.textContent=text;turns.push({role:"assistant",content:text});status.textContent="Disponible";
  }catch(e){
    const c=e&&e.code;
    if(["not_granted","sampling_disabled","not_declared","capability_disabled","capability_removed"].includes(c)){bubble.remove();turns.pop();offline();busy=false;return}
    if(c==="refused"||!e.text){bubble.textContent=ERR[c]||"Se cortó la conexión. Intentá de nuevo."}else{bubble.textContent=e.text+" …"}
    turns.pop();status.textContent="Disponible";
  }
  busy=false;send.disabled=false;inp.focus();
}
$("chatForm").addEventListener("submit",e=>{e.preventDefault();const v=inp.value;inp.value="";ask(v)});
$("chips").addEventListener("click",e=>{if(e.target.tagName==="BUTTON")ask(e.target.textContent)});


/* ===== verificación del sello de los emails ===== */
$("verForm").addEventListener("submit",async e=>{e.preventDefault();const ref=$("vRef").value.trim().toUpperCase(),cod=$("vCod").value.trim().toUpperCase(),out=$("vRes");
  if(!ref||!cod){out.innerHTML='<p class="err">Ingresá la referencia y el código que figuran debajo del sello.</p>';return}
  if(!db){out.innerHTML='<p class="err">La verificación no está disponible en esta vista.</p>';return}
  $("vBtn").disabled=true;
  try{const h=await sha256(ref+"|"+cod);const d=await db.doc("verificaciones/"+h).get();
    out.innerHTML=d.exists?`<div class="ver-ok"><b>Email auténtico.</b> Fue emitido por Stay Lux &amp; Pets Hotel para la referencia ${esc(ref)}.</div>`:`<div class="ver-no"><b>No pudimos verificarlo.</b> El código no corresponde a esa referencia. No respondas ese email y escribinos por WhatsApp.</div>`}
  catch(x){out.innerHTML='<p class="err">No se pudo verificar ahora. Intentá de nuevo.</p>'}
  $("vBtn").disabled=false});
/* ===== imágenes editables del sitio ===== */
const SLOTS=[
  {id:"inicio-portada",grupo:"Inicio",nombre:"Foto de portada"},
  ...ROOMS.map(r=>({id:"hab-"+r.id,grupo:"Habitaciones",nombre:"Habitación "+r.name,multi:true})),
  {id:"inst-recepcion",grupo:"Instalaciones",nombre:"Recepción"},
  {id:"inst-restaurante",grupo:"Instalaciones",nombre:"Restaurante pet-friendly"},
  {id:"inst-piscina",grupo:"Instalaciones",nombre:"Piscina climatizada y terraza"},
  {id:"inst-spa",grupo:"Instalaciones",nombre:"Spa y sauna"},
  {id:"inst-coworking",grupo:"Instalaciones",nombre:"Café workspace y coworking"},
  {id:"inst-gimnasio",grupo:"Instalaciones",nombre:"Gimnasio"},
  {id:"pet-guarderia",grupo:"Para ellos",nombre:"Guardería"},
  {id:"pet-spa",grupo:"Para ellos",nombre:"Spa pet"},
  {id:"pet-agility",grupo:"Para ellos",nombre:"Jardín y agility"},
  {id:"pet-veterinaria",grupo:"Para ellos",nombre:"Veterinaria y estética"}
];
let IMGS={},assets=null,imgBusy={};
let vistaHuesped=false;try{vistaHuesped=sessionStorage.getItem("slp_vista")==="huesped"}catch(e){}
const canEditImgs=()=>!!(assets&&isAdmin&&!vistaHuesped);
function renderViewPill(){let el=$("viewPill");
  if(!(assets&&isAdmin)){if(el)el.remove();return}
  if(!el){el=document.createElement("div");el.id="viewPill";el.className="view-pill";document.body.appendChild(el)}
  el.innerHTML=vistaHuesped?`<span>Viendo como huésped</span><button type="button" id="vpBtn">Volver a admin</button>`:`<span>Modo administración</span><button type="button" id="vpBtn">Ver como huésped</button>`;
  $("vpBtn").onclick=()=>{vistaHuesped=!vistaHuesped;try{sessionStorage.setItem("slp_vista",vistaHuesped?"huesped":"admin")}catch(e){}renderImages();renderPacks();renderEventos();toast(vistaHuesped?"Así ven la página los huéspedes":"Botones de administración visibles")}}
const editBtn=slot=>canEditImgs()?`<button type="button" class="edit-img" data-edit-slot="${slot}">${imgBusy[slot]?"Subiendo…":slotDef(slot).multi?"Agregar fotos":imgUrl(slot)?"Cambiar foto":"Agregar foto"}</button>`:"";
const emptyPh=label=>`<div class="ph-empty"><svg width="26" height="26" viewBox="0 0 24 24"><path class="ico" d="M3 6h18v13H3zM3 15l5-5 4 4 3-3 6 6M15.5 9.5a1 1 0 1 0 0-.01"/></svg><span>${esc(label)}</span></div>`;
const imgList=slot=>{const d=IMGS[slot];if(!d)return[];return (d.ids||(d.id?[d.id]:[])).filter(Boolean)};
const imgUrl=slot=>{const l=imgList(slot);return l.length?SLP.fuente(l[0]):""};
const slotDef=id=>SLOTS.find(s=>s.id===id)||{};
function carousel(ids,alt){
  return `<div class="car"><div class="car-track">${ids.map((id,i)=>`<img src="${esc(SLP.fuente(id))}" alt="${esc(alt)} · foto ${i+1}" loading="lazy" draggable="false">`).join("")}</div>${ids.length>1?`<button type="button" class="car-btn prev" data-car-dir="-1" aria-label="Foto anterior">‹</button><button type="button" class="car-btn next" data-car-dir="1" aria-label="Foto siguiente">›</button><div class="car-dots">${ids.map((_,i)=>`<i class="${i?"":"on"}"></i>`).join("")}</div><span class="car-count">1/${ids.length}</span>`:""}</div>`;
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-car-dir]");if(!b)return;e.preventDefault();const t=b.closest(".car").querySelector(".car-track"),w=t.clientWidth,dir=+b.dataset.carDir,max=t.scrollWidth-w;
  let x=t.scrollLeft+dir*w;if(x>max+4)x=0;else if(x<-4)x=max;t.scrollTo({left:x,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"})});
document.addEventListener("scroll",e=>{const t=e.target;if(!t.classList||!t.classList.contains("car-track"))return;const i=Math.round(t.scrollLeft/Math.max(1,t.clientWidth)),c=t.parentNode;
  c.querySelectorAll(".car-dots i").forEach((d,k)=>d.classList.toggle("on",k===i));const n=c.querySelector(".car-count");if(n)n.textContent=(i+1)+"/"+t.children.length},true);
function renderRooms(){
  $("roomsGrid").innerHTML=ROOMS.map((r,i)=>{const ids=imgList("hab-"+r.id);return `<article class="room-card${r.id==="penthouse"?" feature":""}"><div class="room-art${ids.length?" has-img":""}">${ids.length?carousel(ids,"Habitación "+r.name):art(i)}${editBtn("hab-"+r.id)}</div><div class="room-body"><span class="room-tag">${r.tag} · ${r.units} ${r.units===1?"unidad":"unidades"}</span><h3>${r.name}</h3><ul>${r.feat.map(f=>`<li>${f}</li>`).join("")}<li>Hasta ${r.cap} huéspedes y 2 mascotas</li></ul></div><div class="price"><div><small>Temporada alta</small><b>USD ${r.high}</b></div><div><small>Temporada baja</small><b>USD ${r.low}</b></div><a class="btn btn-ghost" href="#reservar" data-room="${r.id}" style="margin-left:auto;align-self:center;padding:8px 14px">Reservar</a></div></article>`}).join("");
}
function renderGallery(elId,grupo){
  const el=$(elId);if(!el)return;
  el.innerHTML=SLOTS.filter(s=>s.grupo===grupo).map(s=>{const u=imgUrl(s.id);return `<figure class="${u?"":"is-empty"}">${u?`<img src="${u}" alt="${esc(s.nombre)}" loading="lazy" onerror="this.remove()">`:emptyPh("")}<figcaption>${esc(s.nombre)}</figcaption>${editBtn(s.id)}</figure>`}).join("");
}
function renderHero(){
  const h=$("hero"),u=imgUrl("inicio-portada");
  h.classList.toggle("has-bg",!!u);h.style.setProperty("--hero-img",u?`url("${u}")`:"none");
  const b=$("heroEdit");b.innerHTML=editBtn("inicio-portada");
}
function renderImages(){renderViewPill();renderRooms();renderGallery("galInst","Instalaciones");renderGallery("galPet","Para ellos");renderHero();if(currentView()==="admin"&&adm.tab==="img")renderAdmin()}
function shrink(file){return new Promise(res=>{if(file.type==="image/svg+xml"||file.type==="image/gif"){res(file);return}
  const img=new Image(),url=URL.createObjectURL(file);
  img.onload=()=>{const max=2000,sc=Math.min(1,max/Math.max(img.width,img.height));if(sc===1&&file.size<1.5e6){URL.revokeObjectURL(url);res(file);return}
    const c=document.createElement("canvas");c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);
    c.toBlob(b=>res(b||file),"image/jpeg",.86)};
  img.onerror=()=>{URL.revokeObjectURL(url);res(file)};img.src=url})}
const IMG_ERR={payload_too_large:"La imagen es demasiado grande (máximo 20 MB).",quota_exceeded:"Se llenó el espacio de imágenes del sitio. Quitá alguna foto que no uses.",invalid_request:"Ese formato de imagen no es compatible. Probá con JPG o PNG.",not_granted:"No tenés permiso para cambiar imágenes.",rate_limited:"Demasiadas subidas seguidas. Esperá un momento."};
function pickImage(slot){
  if(!canEditImgs())return;const multi=!!slotDef(slot).multi;
  const inp=document.createElement("input");inp.type="file";inp.accept="image/jpeg,image/png,image/webp";inp.multiple=multi;
  inp.onchange=async()=>{const files=[...inp.files].filter(f=>/^image\//.test(f.type)).slice(0,12);if(!files.length){toast("Elegí un archivo de imagen");return}
    imgBusy[slot]=true;renderImages();
    try{
      const ups=[];for(const f of files){const up=await assets.upload(await shrink(f));ups.push(up.id)}
      if(multi){const ids=[...imgList(slot),...ups].slice(0,15);await db.doc("imagenes/"+slot).set({ids,actualizado:new Date().toISOString()});IMGS[slot]={ids};toast(ups.length>1?ups.length+" fotos agregadas":"Foto agregada")}
      else{const old=imgList(slot)[0];await db.doc("imagenes/"+slot).set({id:ups[0],actualizado:new Date().toISOString()});IMGS[slot]={id:ups[0]};if(old&&old!==ups[0]){try{await assets.delete(old)}catch(e){}}toast("Foto actualizada")}
    }catch(e){toast(IMG_ERR[e&&e.code]||"No se pudo subir la foto. Intentá de nuevo.")}
    delete imgBusy[slot];renderImages()};
  inp.click();
}
async function removeImage(slot,id){
  const list=imgList(slot);id=id||list[0];if(!id)return;const rest=list.filter(x=>x!==id);
  try{if(rest.length&&slotDef(slot).multi)await db.doc("imagenes/"+slot).set({ids:rest,actualizado:new Date().toISOString()});else await db.doc("imagenes/"+slot).delete();
    IMGS[slot]=rest.length?{ids:rest}:undefined;if(!rest.length)delete IMGS[slot];try{await assets.delete(id)}catch(e){}toast("Foto quitada")}
  catch(e){toast("No se pudo quitar la foto")}
  renderImages();
}
async function mainImage(slot,id){const l=imgList(slot);if(l[0]===id)return;const ids=[id,...l.filter(x=>x!==id)];
  try{await db.doc("imagenes/"+slot).set({ids,actualizado:new Date().toISOString()});IMGS[slot]={ids};toast("Foto principal actualizada")}catch(e){toast("No se pudo cambiar el orden")}renderImages()}
document.addEventListener("click",e=>{const b=e.target.closest("[data-edit-slot]");if(b){e.preventDefault();e.stopPropagation();pickImage(b.dataset.editSlot)}
  const r=e.target.closest("[data-remove-slot]");if(r){e.preventDefault();removeImage(r.dataset.removeSlot,r.dataset.removeId)}
  const m=e.target.closest("[data-main-slot]");if(m){e.preventDefault();mainImage(m.dataset.mainSlot,m.dataset.mainId)}});
async function initImages(){
  if(!(window.claude&&claude.use))return;
  try{assets=await claude.use("assets")}catch(e){assets=null}
  renderImages();
  if(!db)return;
  db.collection("imagenes").onSnapshot(snap=>{const m={};snap.docs.forEach(d=>{m[d.id]=d.data()});IMGS=m;renderImages()},()=>{});
}
function renderAdminImgs(box){
  const grupos=[...new Set(SLOTS.map(s=>s.grupo))];
  const row=s=>{const ids=imgList(s.id),u=ids.length;const d=IMGS[s.id];
    const info=`<div class="img-info"><b>${esc(s.nombre)}</b><span class="small muted">${u?(s.multi?`${u} ${u===1?"foto":"fotos"} · se deslizan en la tarjeta`:"Actualizada "+new Date(d.actualizado||Date.now()).toLocaleDateString("es-UY")):"Sin foto"}</span></div>`;
    const acts=assets?`<div class="img-acts"><button type="button" class="btn btn-gold" data-edit-slot="${s.id}" style="padding:7px 14px">${imgBusy[s.id]?"Subiendo…":s.multi?"Agregar fotos":u?"Cambiar":"Subir foto"}</button>${u&&!s.multi?`<button type="button" class="btn btn-ghost" data-remove-slot="${s.id}" style="padding:7px 14px">Quitar</button>`:""}</div>`:"";
    if(s.multi)return `<div class="img-row multi">${info}${acts}<div class="thumbs-strip">${u?ids.map((id,k)=>`<div class="ts"><img src="${esc(SLP.fuente(id))}" alt="" loading="lazy">${k===0?'<span class="ts-main">Principal</span>':assets?`<button type="button" class="ts-btn star" data-main-slot="${s.id}" data-main-id="${esc(id)}" title="Hacer principal" aria-label="Hacer principal">★</button>`:""}${assets?`<button type="button" class="ts-btn del" data-remove-slot="${s.id}" data-remove-id="${esc(id)}" title="Quitar" aria-label="Quitar foto">×</button>`:""}</div>`).join(""):emptyPh("Sin fotos")}</div></div>`;
    return `<div class="img-row"><div class="img-thumb">${u?`<img src="${imgUrl(s.id)}" alt="" loading="lazy">`:emptyPh("Vacío")}</div>${info}${acts}</div>`};
  box.innerHTML+=`${assets?`<p class="small muted" style="margin-bottom:14px">Las fotos se ven en la página para todos los visitantes. En habitaciones podés cargar varias: se deslizan como una galería y la primera es la principal.</p>`:`<p class="err" style="margin-bottom:14px">Tu acceso no permite subir imágenes. Solo la persona propietaria y los editores pueden hacerlo.</p>`}
    ${grupos.map(g=>`<h3 style="margin:18px 0 10px">${esc(g)}</h3><div class="img-admin">${SLOTS.filter(s=>s.grupo===g).map(row).join("")}</div>`).join("")}`;
}


/* ===== configuración editable: tarifas y costos ===== */
const INVENTARIO=ROOMS.reduce((s,r)=>s+r.units,0);
let COSTOS={cpor:null,fijosMes:null};
function applyTarifas(t){
  if(!t)return;ROOMS.forEach(r=>{const x=t.rooms&&t.rooms[r.id];if(x){if(+x.high>0)r.high=+x.high;if(+x.low>0)r.low=+x.low}});
  if(t.pet2!==undefined&&+t.pet2>=0)PET2=+t.pet2;
}
function refreshPrices(){
  renderRooms();renderRedeem();
  const n=document.querySelector(".rooms ~ .note");if(n)n.textContent=`Tarifas en USD por noche, habitación doble, desayuno incluido, impuestos no incluidos. Primera mascota sin cargo; segunda mascota USD ${PET2} por noche. Temporada alta: 15 de diciembre al 15 de marzo.`;
  if(currentView()==="reservar"&&!bk.enviado&&bk.step===0)renderWiz();
  if(currentView()==="admin")renderAdmin();
}
function renderRedeem(){$("redeemBody").innerHTML=ROOMS.map(r=>`<tr><td>${r.name}</td><td class="r">${fmt(REDEEM[r.id])}</td><td class="r">USD ${r.low} (baja)</td></tr>`).join("")}

/* ===== packs (editables) y canje de puntos ===== */
const PACKS_DEF=[
  {id:"escapada-bienestar",orden:1,titulo:"Escapada de bienestar",temporada:"Abril a noviembre",items:["2 noches en habitación Premium","Masaje de 50 min por persona y circuito de spa","1 sesión de spa pet","Cena de autor con menú pet"],precio:520,nota:"por estadía, 2 personas + 1 mascota",puntos:52000},
  {id:"workation",orden:2,titulo:"Workation pet-friendly",temporada:"Todo el año, mín. 7 noches",items:["Habitación Boutique o Luxury con 15% de descuento","Puesto fijo en coworking y 4 h de sala privada por semana","Guardería diurna 3 días por semana","Lavandería semanal"],precio:890,nota:"7 noches Boutique en temporada baja",puntos:89000},
  {id:"finde-pet",orden:3,titulo:"Fin de semana pet",temporada:"Fines de semana temáticos",items:["Taller de adiestramiento y socialización","Charla con veterinario o etólogo","Circuito de agility guiado","Jornada de adopción responsable"],precio:75,nota:"por mascota, sobre la tarifa de habitación",puntos:7500}
];
let PACKS=PACKS_DEF.slice(),packEdit=null,canjeOpen=null;
let misCanjes=[];
const puntosGanados=()=>misReservas.filter(r=>r.estado==="confirmada").reduce((s,r)=>s+(r.estadia&&r.estadia.puntos||0),0);
const puntosUsados=()=>misCanjes.filter(c=>c.estado!=="rechazado").reduce((s,c)=>s+(+c.puntos||0),0);
const saldoPuntos=()=>Math.max(0,puntosGanados()-puntosUsados());
const nivelLux=()=>{const n=misReservas.filter(r=>r.estado==="confirmada").reduce((s,r)=>s+(r.estadia&&r.estadia.noches||0),0);return n>=15?"Champagne":n>=5?"Oliva":"Arena"};
const adminMode=()=>isAdmin&&!vistaHuesped&&!!db;
function packForm(p){p=p||{titulo:"",temporada:"",items:[],precio:"",nota:"",puntos:""};
  return `<form class="pack pack-form" id="packForm" novalidate><h3>${p.id?"Editar pack":"Nuevo pack"}</h3>
    <div class="field"><label for="pfT">Nombre</label><input id="pfT" value="${esc(p.titulo)}" maxlength="80"></div>
    <div class="field"><label for="pfW">Cuándo</label><input id="pfW" value="${esc(p.temporada)}" maxlength="60" placeholder="Abril a noviembre"></div>
    <div class="field"><label for="pfI">Qué incluye (una línea por ítem)</label><textarea id="pfI" rows="4">${esc((p.items||[]).join("\n"))}</textarea></div>
    <div class="grid2"><div class="field"><label for="pfP">Precio USD</label><input id="pfP" type="number" min="0" step="1" value="${esc(p.precio)}"></div>
    <div class="field"><label for="pfPts">Puntos para canje</label><input id="pfPts" type="number" min="0" step="500" value="${esc(p.puntos)}" placeholder="Precio × 100"></div></div>
    <div class="field"><label for="pfN">Aclaración del precio</label><input id="pfN" value="${esc(p.nota)}" maxlength="80"></div>
    <div class="err" id="pfErr" hidden></div>
    <div class="actions"><button type="button" class="btn btn-ghost" id="pfCancel">Cancelar</button><button class="btn btn-gold" type="submit">Guardar pack</button></div></form>`}
function renderPacks(){
  const el=$("packsGrid");if(!el)return;const A=adminMode();
  const cards=PACKS.map(p=>{
    if(packEdit===p.id)return packForm(p);
    const canje=loggedIn()&&!A&&p.puntos>0?(canjeOpen===p.id?`<div class="canje-box">${saldoPuntos()>=p.puntos?`<p class="small">Vas a usar <b>${fmt(p.puntos)}</b> de tus ${fmt(saldoPuntos())} puntos. El hotel confirma el canje y coordina la fecha con vos.</p><div class="actions"><button type="button" class="btn btn-ghost" data-canje-cancel>Cancelar</button><button type="button" class="btn btn-gold" data-canje-ok="${esc(p.id)}">Confirmar canje</button></div>`:`<p class="small">Te faltan <b>${fmt(p.puntos-saldoPuntos())}</b> puntos. Tenés ${fmt(saldoPuntos())}.</p><div><button type="button" class="btn btn-ghost" data-canje-cancel>Cerrar</button></div>`}</div>`:`<button type="button" class="btn btn-ghost" data-canje="${esc(p.id)}" style="justify-self:start">Canjear con ${fmt(p.puntos)} puntos</button>`):"";
    return `<article class="pack"><p class="when">${esc(p.temporada)}</p><h3>${esc(p.titulo)}</h3><ul>${(p.items||[]).map(i=>`<li>${esc(i)}</li>`).join("")}</ul>
      <p class="from num">USD ${fmt(+p.precio||0)} <small>${esc(p.nota)}</small></p>${p.puntos>0?`<p class="small muted">o ${fmt(p.puntos)} puntos Lux Club</p>`:""}${canje}
      ${A?`<div class="admin-row"><button type="button" class="btn btn-ghost" data-pack-edit="${esc(p.id)}">Editar</button><button type="button" class="btn btn-ghost" data-pack-del="${esc(p.id)}">${packEdit==="del:"+p.id?"¿Eliminar? Tocá de nuevo":"Eliminar"}</button></div>`:""}</article>`}).join("");
  el.innerHTML=cards+(A?(packEdit==="new"?packForm(null):`<button type="button" class="pack add-card" data-pack-new><span>+</span>Agregar pack</button>`):"");
  const f=$("packForm");if(f){$("pfCancel").onclick=()=>{packEdit=null;renderPacks()};f.onsubmit=async e=>{e.preventDefault();
    const d={titulo:$("pfT").value.trim(),temporada:$("pfW").value.trim(),items:$("pfI").value.split("\n").map(x=>x.trim()).filter(Boolean).slice(0,10),precio:Math.max(0,Math.round(+$("pfP").value||0)),puntos:Math.max(0,Math.round(+$("pfPts").value||0)),nota:$("pfN").value.trim()};
    if(!d.titulo||!d.items.length||!d.precio){$("pfErr").textContent="Completá nombre, al menos un ítem y el precio.";$("pfErr").hidden=false;return}
    const id=packEdit==="new"?("pk-"+Date.now().toString(36)):packEdit;const old=PACKS.find(x=>x.id===id);d.orden=old?old.orden:(Math.max(0,...PACKS.map(x=>x.orden||0))+1);
    try{await db.doc("packs/"+id).set(d);packEdit=null;toast("Pack guardado")}catch(x){$("pfErr").textContent="No se pudo guardar el pack.";$("pfErr").hidden=false}}}
}
document.addEventListener("click",async e=>{
  const t=e.target.closest("[data-pack-edit],[data-pack-del],[data-pack-new],[data-canje],[data-canje-ok],[data-canje-cancel]");if(!t)return;
  if(t.dataset.packNew!==undefined){packEdit="new";renderPacks();return}
  if(t.dataset.packEdit){packEdit=t.dataset.packEdit;renderPacks();return}
  if(t.dataset.packDel){const id=t.dataset.packDel;if(packEdit!=="del:"+id){packEdit="del:"+id;renderPacks();return}
    try{await db.doc("packs/"+id).delete();packEdit=null;toast("Pack eliminado")}catch(x){toast("No se pudo eliminar")}return}
  if(t.dataset.canje){canjeOpen=t.dataset.canje;renderPacks();return}
  if(t.dataset.canjeCancel!==undefined){canjeOpen=null;renderPacks();return}
  if(t.dataset.canjeOk){const p=PACKS.find(x=>x.id===t.dataset.canjeOk);if(!p||saldoPuntos()<p.puntos)return;t.disabled=true;
    const id="CJ-"+Date.now().toString(36).toUpperCase().slice(-5)+Math.random().toString(36).slice(2,4).toUpperCase();
    const c={codigo:id,packId:p.id,titulo:p.titulo,puntos:p.puntos,creado:new Date().toISOString(),estado:"pendiente",nombre:profile.nombre+" "+profile.apellido,email:profile.email};
    try{await db.doc(`huespedes/${uid}/canjes/${id}`).set(c);misCanjes.push(c);canjeOpen=null;adm.loaded=false;toast("Canje solicitado");renderPacks()}catch(x){t.disabled=false;toast("No se pudo registrar el canje")}}
});
async function loadMisCanjes(){if(!db||!uid||!loggedIn()){misCanjes=[];return}
  try{const q=await db.collection(`huespedes/${uid}/canjes`).get();const l=q.docs.map(d=>({...d.data()}));await attachEstados(l);misCanjes=l}catch(e){}}

/* ===== eventos ===== */
let EVENTOS=[],evEdit=null,evImgPending=null;
const MES=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
function evForm(v){v=v||{titulo:"",fecha:iso(addDays(today,14)),hora:"18:00",lugar:"",descripcion:"",precio:"",cupo:"",pet:true};
  return `<form class="panel ev-form" id="evForm" novalidate><h3>${v.id?"Editar evento":"Nuevo evento"}</h3>
    <div class="grid2"><div class="field span2"><label for="evT">Nombre del evento</label><input id="evT" value="${esc(v.titulo)}" maxlength="90"></div>
    <div class="field"><label for="evF">Fecha</label><input id="evF" type="date" value="${esc(v.fecha)}"></div>
    <div class="field"><label for="evH">Hora</label><input id="evH" type="time" value="${esc(v.hora)}"></div>
    <div class="field"><label for="evL">Lugar</label><input id="evL" value="${esc(v.lugar)}" placeholder="Jardín del hotel"></div>
    <div class="field"><label for="evP">Precio</label><input id="evP" value="${esc(v.precio)}" placeholder="Sin cargo para huéspedes"></div>
    <div class="field"><label for="evC">Cupo</label><input id="evC" type="number" min="0" value="${esc(v.cupo)}"></div>
    <div class="field"><label for="evPet">Mascotas</label><select id="evPet"><option value="1" ${v.pet?"selected":""}>Pet-friendly</option><option value="0" ${!v.pet?"selected":""}>Solo personas</option></select></div>
    <div class="field span2"><label for="evD">Descripción</label><textarea id="evD" rows="3">${esc(v.descripcion)}</textarea></div>
    <div class="field span2"><span class="small muted">Imagen: ${evImgPending||v.img?"cargada":"sin imagen"}</span><label class="btn btn-ghost file-btn" style="justify-self:start;padding:8px 14px">${evImgPending||v.img?"Cambiar imagen":"Agregar imagen"}<input type="file" accept="image/jpeg,image/png,image/webp" id="evImg"></label></div></div>
    <div class="err" id="evErr" hidden></div>
    <div class="actions"><button type="button" class="btn btn-ghost" id="evCancel">Cancelar</button><button class="btn btn-gold" type="submit" id="evSave">Guardar evento</button></div></form>`}
function renderEventos(){
  const el=$("evList");if(!el)return;const A=adminMode(),hoy=iso(today);
  const prox=EVENTOS.filter(v=>v.fecha>=hoy).sort((a,b)=>(a.fecha+a.hora).localeCompare(b.fecha+b.hora)),pas=EVENTOS.filter(v=>v.fecha<hoy).sort((a,b)=>b.fecha.localeCompare(a.fecha));
  const card=v=>{if(evEdit===v.id)return evForm(v);const d=new Date(v.fecha+"T12:00");return `<article class="ev">
    <div class="ev-img">${v.img?`<img src="${esc(SLP.fuente(v.img))}" alt="" loading="lazy" onerror="this.remove()">`:emptyPh("")}<div class="ev-date"><b>${d.getDate()}</b><span>${MES[d.getMonth()]}</span></div></div>
    <div class="ev-body"><div class="ev-tags">${v.pet?`<span class="tag">${PAW} Pet-friendly</span>`:""}${v.cupo?`<span class="tag">Cupo ${esc(v.cupo)}</span>`:""}</div>
    <h3>${esc(v.titulo)}</h3><p class="small muted">${d.toLocaleDateString("es-UY",{weekday:"long",day:"numeric",month:"long"})} · ${esc(v.hora)} h${v.lugar?" · "+esc(v.lugar):""}</p>
    <p>${esc(v.descripcion)}</p><p class="ev-price">${esc(v.precio||"Sin cargo para huéspedes")}</p>
    <div class="actions" style="justify-content:flex-start"><a class="btn btn-ghost" href="#concierge">Consultar</a>${A?`<button type="button" class="btn btn-ghost" data-ev-edit="${esc(v.id)}">Editar</button><button type="button" class="btn btn-ghost" data-ev-del="${esc(v.id)}">${evEdit==="del:"+v.id?"¿Eliminar? Tocá de nuevo":"Eliminar"}</button>`:""}</div></div></article>`};
  el.innerHTML=(A?(evEdit==="new"?evForm(null):`<div><button type="button" class="btn btn-gold" data-ev-new>+ Nuevo evento</button></div>`):"")
    +(prox.length?prox.map(card).join(""):`<div class="empty">${A?"Todavía no hay eventos próximos. Creá el primero.":"Pronto anunciamos nuevos eventos. Seguinos en redes o consultá al concierge."}</div>`)
    +(pas.length?`<details class="ev-past"><summary>Eventos anteriores (${pas.length})</summary><div class="ev-list">${pas.map(card).join("")}</div></details>`:"");
  const f=$("evForm");if(f){
    $("evCancel").onclick=()=>{evEdit=null;evImgPending=null;renderEventos()};
    $("evImg").onchange=async ev=>{const file=ev.target.files[0];if(!file||!assets)return;$("evSave").disabled=true;toast("Subiendo imagen…");
      try{const up=await assets.upload(await shrink(file));evImgPending=up.id;toast("Imagen lista");ev.target.parentNode.firstChild.textContent="Cambiar imagen"}catch(x){toast(IMG_ERR[x&&x.code]||"No se pudo subir la imagen")}$("evSave").disabled=false};
    f.onsubmit=async e=>{e.preventDefault();const d={titulo:$("evT").value.trim(),fecha:$("evF").value,hora:$("evH").value,lugar:$("evL").value.trim(),precio:$("evP").value.trim(),cupo:$("evC").value.trim(),pet:$("evPet").value==="1",descripcion:$("evD").value.trim()};
      if(!d.titulo||!d.fecha){$("evErr").textContent="Completá el nombre y la fecha.";$("evErr").hidden=false;return}
      const id=evEdit==="new"?("ev-"+Date.now().toString(36)):evEdit;const old=EVENTOS.find(x=>x.id===id);d.img=evImgPending||(old&&old.img)||"";
      try{await db.doc("eventos/"+id).set(d);if(evImgPending&&old&&old.img&&old.img!==evImgPending){try{await assets.delete(old.img)}catch(x){}}evEdit=null;evImgPending=null;toast("Evento guardado")}
      catch(x){$("evErr").textContent="No se pudo guardar el evento.";$("evErr").hidden=false}}}
}
document.addEventListener("click",async e=>{
  const t=e.target.closest("[data-ev-new],[data-ev-edit],[data-ev-del]");if(!t)return;
  if(t.dataset.evNew!==undefined){evEdit="new";evImgPending=null;renderEventos();return}
  if(t.dataset.evEdit){evEdit=t.dataset.evEdit;evImgPending=null;renderEventos();return}
  if(t.dataset.evDel){const id=t.dataset.evDel;if(evEdit!=="del:"+id){evEdit="del:"+id;renderEventos();return}
    const old=EVENTOS.find(x=>x.id===id);try{await db.doc("eventos/"+id).delete();if(old&&old.img){try{await assets.delete(old.img)}catch(x){}}evEdit=null;toast("Evento eliminado")}catch(x){toast("No se pudo eliminar")}}
});

/* ===== suscripciones de contenido editable ===== */
function initContent(){
  if(!db){renderPacks();renderEventos();return}
  const t0=setTimeout(()=>{renderPacks();renderEventos()},10000);
  db.doc("config/tarifas").onSnapshot(s=>{if(s.exists){applyTarifas(s.data());refreshPrices()}},()=>{});
  db.doc("config/costos").onSnapshot(s=>{if(s.exists){const d=s.data();COSTOS={cpor:d.cpor??null,fijosMes:d.fijosMes??null};if(currentView()==="admin")renderAdmin()}},()=>{});
  db.collection("packs").onSnapshot(s=>{clearTimeout(t0);const l=s.docs.map(d=>({id:d.id,...d.data()}));PACKS=l.length?l.sort((a,b)=>(a.orden||0)-(b.orden||0)):PACKS_DEF.slice();renderPacks()},()=>{renderPacks()});
  db.collection("eventos").onSnapshot(s=>{EVENTOS=s.docs.map(d=>({id:d.id,...d.data()}));renderEventos()},()=>{renderEventos()});
}

/* ===== KPIs del alojamiento ===== */
const kpi={per:"mes",pend:true,desde:"",hasta:""};
function kpiRange(){
  const y=today.getFullYear(),m=today.getMonth();
  if(kpi.per==="mes")return[new Date(y,m,1,12),new Date(y,m+1,1,12),"Este mes"];
  if(kpi.per==="prox30")return[new Date(today),addDays(today,30),"Próximos 30 días"];
  if(kpi.per==="ult30")return[addDays(today,-30),new Date(today),"Últimos 30 días"];
  if(kpi.per==="alta"){const a=m>=2&&!(m===2&&today.getDate()<15)?y:y-1;return[new Date(a,11,15,12),new Date(a+1,2,15,12),`Temporada alta ${a}-${String(a+1).slice(2)}`]}
  if(kpi.per==="anio")return[new Date(y,0,1,12),new Date(y+1,0,1,12),"Año "+y];
  const d=new Date((kpi.desde||iso(today))+"T12:00"),h=new Date((kpi.hasta||iso(addDays(today,30)))+"T12:00");return[d,h>d?h:addDays(d,1),"Período elegido"];
}
function calcKPI(from,to,list){
  const days=Math.max(1,Math.round((to-from)/864e5)),avail=INVENTARIO*days;
  const valid=list.filter(r=>r.estadia&&r.estado!=="cancelada"&&(kpi.pend||r.estado==="confirmada"));
  let sold=0,roomRev=0,petRev=0,gN=0,pN=0;const cat={};ROOMS.forEach(r=>cat[r.name]={units:r.units,sold:0,rev:0});
  valid.forEach(r=>{const e=r.estadia,a=new Date(e.llegada+"T12:00"),z=new Date(e.salida+"T12:00"),n=e.noches||1,rpn=(e.totalHabitacion||0)/n,ppn=(e.totalMascotas||0)/n,pets=(r.mascotas||[]).length;
    for(let d=new Date(a);d<z;d.setDate(d.getDate()+1)){if(d>=from&&d<to){sold++;roomRev+=rpn;petRev+=ppn;gN+=e.huespedes||1;pN+=pets;if(cat[e.habitacion]){cat[e.habitacion].sold++;cat[e.habitacion].rev+=rpn}}}});
  const inP=list.filter(r=>r.estadia&&(d=>d>=from&&d<to)(new Date(r.estadia.llegada+"T12:00")));
  const inV=inP.filter(r=>r.estado!=="cancelada"&&(kpi.pend||r.estado==="confirmada"));
  const lead=inV.length?inV.reduce((s,r)=>s+Math.max(0,(new Date(r.estadia.llegada+"T12:00")-new Date(r.creado))/864e5),0)/inV.length:null;
  const tRev=roomRev+petRev,fijos=COSTOS.fijosMes!=null?COSTOS.fijosMes*days/30.42:null,varC=COSTOS.cpor!=null?COSTOS.cpor*sold:null;
  const gop=fijos!=null&&varC!=null?tRev-fijos-varC:null;
  return{days,avail,sold,roomRev,petRev,tRev,occ:sold/avail,adr:sold?roomRev/sold:null,revpar:roomRev/avail,trevpar:tRev/avail,
    alos:inV.length?inV.reduce((s,r)=>s+(r.estadia.noches||0),0)/inV.length:null,canc:inP.length?inP.filter(r=>r.estado==="cancelada").length/inP.length:null,lead,
    dor:sold?gN/sold:null,pet:sold?pN/sold:null,res:inV.length,gop,goppar:gop!=null?gop/avail:null,cpor:COSTOS.cpor,cat};
}
const pct=v=>v==null?"—":(v*100).toLocaleString("es-UY",{maximumFractionDigits:1})+" %";
const usd=v=>v==null?"—":"USD "+Math.round(v).toLocaleString("es-UY");
const usd2=v=>v==null?"—":"USD "+v.toLocaleString("es-UY",{minimumFractionDigits:2,maximumFractionDigits:2});
const num1=v=>v==null?"—":v.toLocaleString("es-UY",{maximumFractionDigits:1});
function renderKPIs(box){
  const [from,to,lbl]=kpiRange(),K=calcKPI(from,to,adm.list);
  const tile=(n,v,f,hint)=>`<div class="ktile"><span class="kt-n">${n}</span><b>${v}</b><span class="kt-f">${f}</span>${hint?`<span class="kt-h">${hint}</span>`:""}</div>`;
  const months=[...Array(12)].map((_,i)=>{const a=new Date(today.getFullYear(),today.getMonth()+i,1,12),b=new Date(today.getFullYear(),today.getMonth()+i+1,1,12);return{l:MES[a.getMonth()],o:calcKPI(a,b,adm.list).occ}});
  const mx=Math.max(.0001,...months.map(m=>m.o));
  box.innerHTML+=`<div class="filters">${[["mes","Este mes"],["prox30","Próximos 30 días"],["ult30","Últimos 30 días"],["alta","Temporada alta"],["anio","Año"],["custom","Elegir fechas"]].map(([k,t])=>`<button type="button" data-kper="${k}" class="${kpi.per===k?"on":""}">${t}</button>`).join("")}</div>
    ${kpi.per==="custom"?`<div class="filters"><input type="date" id="kD" class="state-sel" value="${kpi.desde||iso(today)}"><span class="small muted">a</span><input type="date" id="kH" class="state-sel" value="${kpi.hasta||iso(addDays(today,30))}"></div>`:""}
    <label class="check" style="margin-bottom:14px"><input type="checkbox" id="kPend" ${kpi.pend?"checked":""}><span>Incluir reservas pendientes de confirmar (on the books)</span></label>
    <p class="small muted" style="margin-bottom:10px">${lbl}: ${fdate(iso(from))} al ${fdate(iso(addDays(to,-1)))} · ${K.days} días · ${INVENTARIO} habitaciones · ${fmt(K.avail)} habitaciones-noche disponibles</p>
    <h3 class="k-h">Ocupación e ingresos</h3>
    <div class="ktiles">${tile("Ocupación",pct(K.occ),"Hab. vendidas ÷ hab. disponibles",`${fmt(K.sold)} de ${fmt(K.avail)} hab.-noche`)}${tile("ADR",usd2(K.adr),"Ingreso hab. ÷ hab. vendidas","Tarifa media diaria")}${tile("RevPAR",usd2(K.revpar),"Ingreso hab. ÷ hab. disponibles","= Ocupación × ADR")}${tile("TRevPAR",usd2(K.trevpar),"Ingreso total ÷ hab. disponibles","Incluye cargos por mascota")}${tile("Ingreso habitaciones",usd(K.roomRev),"Suma de tarifas del período","")}${tile("Ingreso total",usd(K.tRev),"Habitaciones + mascotas","")}</div>
    <h3 class="k-h">Comportamiento de la demanda</h3>
    <div class="ktiles">${tile("Estadía media (ALOS)",K.alos==null?"—":num1(K.alos)+" noches","Noches ÷ reservas",`${K.res} reservas con llegada en el período`)}${tile("Antelación media",K.lead==null?"—":num1(K.lead)+" días","Días entre reserva y llegada","Lead time")}${tile("Tasa de cancelación",pct(K.canc),"Canceladas ÷ reservas","Con llegada en el período")}${tile("Huéspedes por hab.",num1(K.dor),"Huéspedes ÷ hab. vendidas","Doble ocupación")}${tile("Mascotas por hab.",num1(K.pet),"Mascotas ÷ hab. vendidas","Indicador propio pet-friendly")}</div>
    <h3 class="k-h">Rentabilidad</h3>
    ${COSTOS.cpor==null||COSTOS.fijosMes==null?`<div class="empty" style="margin-bottom:8px">Para calcular CPOR, GOP y GOPPAR cargá el costo variable por habitación ocupada y los costos fijos mensuales en la pestaña <b>Tarifas y costos</b>.</div>`:`<div class="ktiles">${tile("CPOR",usd2(K.cpor),"Costo por habitación ocupada","Dato cargado en costos")}${tile("GOP",usd(K.gop),"Ingreso total − costos variables − fijos","Beneficio bruto operativo")}${tile("GOPPAR",usd2(K.goppar),"GOP ÷ hab. disponibles","Rentabilidad por habitación")}${tile("Margen GOP",K.tRev?pct(K.gop/K.tRev):"—","GOP ÷ ingreso total","")}</div>`}
    <h3 class="k-h">Por categoría</h3>
    <div class="tbl-wrap kt-tbl"><table><thead><tr><th>Categoría</th><th class="r">Unid.</th><th class="r">Hab.-noche</th><th class="r">Ocupación</th><th class="r">ADR</th><th class="r">RevPAR</th><th class="r">Ingresos</th></tr></thead><tbody>
    ${ROOMS.map(r=>{const c=K.cat[r.name],av=r.units*K.days;return `<tr><td>${r.name}</td><td class="r">${r.units}</td><td class="r">${c.sold}</td><td class="r">${pct(c.sold/av)}</td><td class="r">${c.sold?usd2(c.rev/c.sold):"—"}</td><td class="r">${usd2(c.rev/av)}</td><td class="r">${usd(c.rev)}</td></tr>`}).join("")}</tbody></table></div>
    <h3 class="k-h">Ocupación en cartera, próximos 12 meses</h3>
    <div class="bars" role="img" aria-label="Ocupación por mes">${months.map(m=>`<div class="bar"><span class="bv">${m.o?pct(m.o):""}</span><i style="height:${Math.max(2,m.o/mx*100)}%"></i><span class="bl">${m.l}</span></div>`).join("")}</div>
    <p class="small muted" style="margin-top:14px">Los indicadores se calculan solos con las reservas del sitio. El ingreso de cada reserva se reparte por noche; las canceladas no cuentan.</p>`;
  box.querySelectorAll("[data-kper]").forEach(b=>b.onclick=()=>{kpi.per=b.dataset.kper;renderAdmin()});
  $("kPend").onchange=e=>{kpi.pend=e.target.checked;renderAdmin()};
  if($("kD")){$("kD").onchange=e=>{kpi.desde=e.target.value;renderAdmin()};$("kH").onchange=e=>{kpi.hasta=e.target.value;renderAdmin()}}
}
function renderTarifasAdmin(box){
  box.innerHTML+=`<form class="panel" id="tarForm" novalidate><h3>Tarifas por noche (USD)</h3><p class="small muted">Los cambios se ven al instante en Habitaciones, el cotizador y el concierge. Las reservas ya hechas mantienen su precio.</p>
    <div class="tbl-wrap"><table class="tar-tbl" style="font-size:.9rem"><thead><tr><th>Categoría</th><th>Temporada alta</th><th>Temporada baja</th></tr></thead><tbody>
    ${ROOMS.map(r=>`<tr><td>${r.name}</td><td><input type="number" min="1" step="1" id="th-${r.id}" value="${r.high}" class="state-sel" aria-label="${r.name} alta"></td><td><input type="number" min="1" step="1" id="tl-${r.id}" value="${r.low}" class="state-sel" aria-label="${r.name} baja"></td></tr>`).join("")}</tbody></table></div>
    <div class="field" style="max-width:260px"><label for="tPet">2.ª mascota, por noche (USD)</label><input type="number" min="0" step="1" id="tPet" value="${PET2}"></div>
    <div class="err" id="tErr" hidden></div><div><button class="btn btn-gold" type="submit">Guardar tarifas</button></div></form>
  <form class="panel" id="cosForm" novalidate style="margin-top:16px"><h3>Costos operativos</h3><p class="small muted">Se usan para calcular CPOR, GOP y GOPPAR. Tomalos del presupuesto de costos del proyecto.</p>
    <div class="grid2"><div class="field"><label for="cCpor">Costo variable por habitación ocupada (USD)</label><input type="number" min="0" step="0.5" id="cCpor" value="${COSTOS.cpor??""}" placeholder="Limpieza, amenities, lavandería, energía"></div>
    <div class="field"><label for="cFij">Costos fijos mensuales (USD)</label><input type="number" min="0" step="100" id="cFij" value="${COSTOS.fijosMes??""}" placeholder="Sueldos, mantenimiento, seguros, marketing"></div></div>
    <div class="err" id="cErr" hidden></div><div><button class="btn btn-gold" type="submit">Guardar costos</button></div></form>
  <form class="panel" id="apwForm" novalidate style="margin-top:16px"><h3>Contraseña de administración</h3><p class="small muted">Se usa junto con stayluxpetshotel@gmail.com para entrar al panel. Guardamos solo una huella cifrada.</p>
    <div class="grid2"><div class="field"><label for="apw0">Contraseña actual</label><input id="apw0" type="password" autocomplete="current-password"></div><div></div>
    <div class="field"><label for="apw1">Nueva contraseña (mínimo 10 caracteres)</label><input id="apw1" type="password" autocomplete="new-password"></div>
    <div class="field"><label for="apw2">Repetir nueva contraseña</label><input id="apw2" type="password" autocomplete="new-password"></div></div>
    <div class="err" id="apwErr" hidden></div><div><button class="btn btn-gold" type="submit">Cambiar contraseña</button></div></form>
  <form class="panel" id="pinForm" novalidate style="margin-top:16px"><h3>Seguridad</h3><p class="small muted">PIN que se pide para ver el número completo de las tarjetas. Guardamos solo una huella cifrada, no el PIN.</p>
    <div class="grid2"><div class="field"><label for="pin1">Nuevo PIN (4 a 12 dígitos)</label><input id="pin1" type="password" inputmode="numeric" maxlength="12" autocomplete="new-password"></div>
    <div class="field"><label for="pin2">Repetir PIN</label><input id="pin2" type="password" inputmode="numeric" maxlength="12" autocomplete="new-password"></div></div>
    <div class="err" id="pinErr" hidden></div><div><button class="btn btn-gold" type="submit">Guardar PIN</button></div></form>`;
  $("apwForm").onsubmit=async e=>{e.preventDefault();const er=$("apwErr"),a0=$("apw0").value,a1=$("apw1").value;er.hidden=true;
    try{const d=await db.doc("seguridad/admin").get();const a=d.data();
      if(await sha256(a.salt+a0)!==a.hash){er.textContent="La contraseña actual no es correcta.";er.hidden=false;return}
      if(a1.length<10){er.textContent="La nueva contraseña debe tener al menos 10 caracteres.";er.hidden=false;return}
      if(a1!==$("apw2").value){er.textContent="Las contraseñas nuevas no coinciden.";er.hidden=false;return}
      const salt=[...crypto.getRandomValues(new Uint8Array(12))].map(x=>x.toString(16).padStart(2,"0")).join("");
      await db.doc("seguridad/admin").set({email:a.email,salt,hash:await sha256(salt+a1),actualizado:new Date().toISOString()});
      ["apw0","apw1","apw2"].forEach(i=>$(i).value="");toast("Contraseña de administración actualizada")}
    catch(x){er.textContent="No se pudo cambiar la contraseña.";er.hidden=false}};
  $("pinForm").onsubmit=async e=>{e.preventDefault();const a=$("pin1").value,b2=$("pin2").value,er=$("pinErr");
    if(!/^\d{4,12}$/.test(a)){er.textContent="El PIN debe tener entre 4 y 12 números.";er.hidden=false;return}if(a!==b2){er.textContent="Los PIN no coinciden.";er.hidden=false;return}
    const salt=Math.random().toString(36).slice(2,12);try{const d={salt,hash:await sha(salt+a),actualizado:new Date().toISOString()};await db.doc("seguridad/pin").set(d);PIN=d;pinLoaded=true;$("pin1").value="";$("pin2").value="";toast("PIN guardado")}catch(x){er.textContent="No se pudo guardar el PIN.";er.hidden=false}};
  $("tarForm").onsubmit=async e=>{e.preventDefault();const rooms={};let bad=false;ROOMS.forEach(r=>{const h=Math.round(+$("th-"+r.id).value),l=Math.round(+$("tl-"+r.id).value);if(!(h>0&&l>0))bad=true;rooms[r.id]={high:h,low:l}});
    const pet2=Math.max(0,Math.round(+$("tPet").value||0));if(bad){$("tErr").textContent="Todas las tarifas tienen que ser mayores a cero.";$("tErr").hidden=false;return}
    try{await db.doc("config/tarifas").set({rooms,pet2,actualizado:new Date().toISOString()});toast("Tarifas actualizadas")}catch(x){$("tErr").textContent="No se pudieron guardar las tarifas.";$("tErr").hidden=false}};
  $("cosForm").onsubmit=async e=>{e.preventDefault();const c=$("cCpor").value,f=$("cFij").value;
    try{await db.doc("config/costos").set({cpor:c===""?null:+c,fijosMes:f===""?null:+f,actualizado:new Date().toISOString()});toast("Costos guardados")}catch(x){$("cErr").textContent="No se pudieron guardar los costos.";$("cErr").hidden=false}};
}
function renderConsultasAdmin(box){
  const L=adm.consultas||[],f=adm.cqf||"nueva",F=f==="todas"?L:L.filter(c=>c.estado===f);
  box.innerHTML+=`<div class="filters">${[["nueva","Nuevas"],["respondida","Respondidas"],["archivada","Archivadas"],["todas","Todas"]].map(([k,t])=>`<button type="button" class="${f===k?"on":""}" data-cqf="${k}">${t} (${k==="todas"?L.length:L.filter(c=>c.estado===k).length})</button>`).join("")}<span class="sp"></span><button type="button" class="btn btn-ghost" id="cqRef" style="padding:6px 14px">Actualizar</button></div>
  ${F.length?`<div class="res-list">${F.map(c=>`<div class="cq"><div class="cq-top"><div><b>${esc(c.nombre)}</b><div class="small muted">${new Date(c.creado).toLocaleString("es-UY",{dateStyle:"medium",timeStyle:"short"})} · ${esc(c.codigo)}</div></div><select class="state-sel" data-cq="${esc(c._path)}">${["nueva","respondida","archivada"].map(s=>`<option ${s===c.estado?"selected":""}>${s}</option>`).join("")}</select></div>
    <p class="cq-msg">${esc(c.mensaje)}</p>
    <dl class="kv"><dt>Email</dt><dd><span id="cqm-${esc(c.codigo)}">${esc(c.email)}</span> <button type="button" class="copy" data-copy="cqm-${esc(c.codigo)}">Copiar</button></dd>${c.fechas?`<dt>Fechas</dt><dd>${esc(c.fechas)}</dd>`:""}${c.mascota?`<dt>Mascota</dt><dd>${esc(c.mascota)}</dd>`:""}</dl></div>`).join("")}</div>`:`<div class="empty">${L.length?"No hay consultas en este estado.":"Todavía no llegaron consultas. Cuando alguien escriba desde Contacto, aparece acá y también llega al Gmail del hotel."}</div>`}`;
  box.querySelectorAll("[data-cqf]").forEach(b=>b.onclick=()=>{adm.cqf=b.dataset.cqf;renderAdmin()});
  $("cqRef").onclick=loadAdmin;
  box.querySelectorAll("[data-copy]").forEach(b=>b.onclick=()=>{const el=$(b.dataset.copy);copyText(el.textContent,el)});
  box.querySelectorAll("[data-cq]").forEach(sel=>sel.onchange=async()=>{const c=L.find(x=>x._path===sel.dataset.cq),old=c.estado;c.estado=sel.value;
    try{await db.doc(c._path).update({estado:sel.value});toast("Consulta "+sel.value);renderAdmin()}catch(x){c.estado=old;sel.value=old;toast("No se pudo actualizar")}});
}
function renderCanjesAdmin(box){
  const L=adm.canjes||[];
  box.innerHTML+=L.length?`<div class="res-list">${L.map(c=>`<div class="pet-card" style="grid-template-columns:1fr auto;align-items:center"><div><b>${esc(c.titulo)}</b><div class="muted">${esc(c.nombre)} · ${esc(c.email)}</div><div class="muted">${fmt(c.puntos)} puntos · ${esc(c.codigo)} · ${new Date(c.creado).toLocaleDateString("es-UY")}</div></div><select class="state-sel" data-cj="${esc(c.codigo)}">${["pendiente","aprobado","rechazado"].map(s=>`<option ${s===c.estado?"selected":""}>${s}</option>`).join("")}</select></div>`).join("")}</div>`:`<div class="empty">Todavía no hay canjes de puntos. Aparecen acá cuando un huésped canjea un pack.</div>`;
  box.querySelectorAll("[data-cj]").forEach(s=>s.onchange=async()=>{const c=L.find(x=>x.codigo===s.dataset.cj),old=c.estado;c.estado=s.value;
    try{await db.doc("estados/"+c.codigo).set({estado:s.value,actualizado:new Date().toISOString()});toast("Canje "+s.value)}catch(x){c.estado=old;s.value=old;toast("No se pudo actualizar")}});
}
async function exportCSV(){
  let dl=null;try{dl=await claude.use("downloads")}catch(e){}
  if(!dl){toast("La descarga no está disponible en esta vista");return}
  const cols=["codigo","estado","creado","llegada","salida","noches","habitacion","hab_nro","huespedes","mascotas","total_habitacion","total_mascotas","total_usd","nombre","apellido","email","telefono","pais","documento"];
  const q=v=>`"${String(v??"").replace(/"/g,'""')}"`;
  const rows=adm.list.map(r=>{const e=r.estadia||{},h=r.huesped||{};return[r.codigo,r.estado,r.creado,e.llegada,e.salida,e.noches,e.habitacion,r.habitacionNro,e.huespedes,(r.mascotas||[]).map(m=>m.nombre).join(" / "),e.totalHabitacion,e.totalMascotas,e.total,h.nombre,h.apellido,h.email,h.tel,h.pais,(h.docTipo||"")+" "+(h.docNum||"")].map(q).join(",")});
  try{await dl.save({filename:"reservas-stay-lux-pets-hotel-"+iso(today)+".csv",data:"﻿"+[cols.join(","),...rows].join("\r\n")})}catch(x){if(x&&x.code!=="declined")toast("No se pudo descargar el archivo")}
}


/* ===== pagos (pasarela simulada con tarjetas de prueba) ===== */
const TEST_CARDS={
  "4242424242424242":{marca:"VISA",tipo:"credito",res:"ok",desc:"Aprobada"},
  "5555555555554444":{marca:"MASTERCARD",tipo:"credito",res:"ok",desc:"Aprobada"},
  "378282246310005":{marca:"AMEX",tipo:"credito",res:"ok",desc:"Aprobada"},
  "4000000000009995":{marca:"VISA",tipo:"credito",res:"fondos",desc:"Rechazo por fondos insuficientes"},
  "4000000000000002":{marca:"VISA",tipo:"credito",res:"rechazada",desc:"Rechazo del banco emisor"},
  "4000000000000069":{marca:"VISA",tipo:"credito",res:"vencida",desc:"Rechazo por tarjeta vencida o bloqueada"},
  "4000056655665556":{marca:"VISA",tipo:"debito",res:"ok",desc:"Débito (no se acepta)"},
  "5200828282828210":{marca:"MASTERCARD",tipo:"debito",res:"ok",desc:"Débito (no se acepta)"}
};
const MOTIVOS={fondos:"la tarjeta no tiene fondos o cupo suficiente",rechazada:"el banco emisor rechazó la operación",vencida:"la tarjeta está vencida o bloqueada"};
const fmtCard=n=>String(n||"").replace(/(.{4})/g,"$1 ").trim();
const testCardsHTML=()=>`<details class="test-cards"><summary>Ver tarjetas de prueba</summary><table><tbody>${Object.entries(TEST_CARDS).map(([n,c])=>`<tr><td class="num">${fmtCard(n)}</td><td>${c.marca}</td><td>${c.desc}</td></tr>`).join("")}</tbody></table><p class="small muted">Cualquier vencimiento futuro y CVV de 3 dígitos (4 en AMEX).</p></details>`;
function planPagos(llegada,total){
  const a=new Date(llegada+"T12:00"),f1=addDays(a,-7),hoy=iso(today);
  const m1=Math.round(total/2*100)/100,m2=Math.round((total-m1)*100)/100;
  const d1=iso(f1)<hoy?hoy:iso(f1);
  return[{n:1,monto:m1,fecha:d1,nota:iso(f1)<hoy?"al confirmar la reserva":"7 días antes del check-in"},{n:2,monto:m2,fecha:llegada,nota:"en el check-in"}];
}
const planHTML=pl=>`<div class="plan">${pl.map(c=>`<div><span>${c.n===1?"1.er":"2.º"} pago · 50%</span><b>USD ${fmt(c.monto)}</b><small>${fdate(c.fecha)} · ${c.nota}</small></div>`).join("")}</div>`;
function validarTarjeta(d,v,c){
  if(d.length<13||!luhn(d))return"El número de tarjeta no es válido.";
  const tc=TEST_CARDS[d];if(!tc)return"Modo demostración: usá una de las tarjetas de prueba. No ingreses tarjetas reales.";
  if(tc.tipo!=="credito")return"La tarjeta debe ser de crédito. No aceptamos tarjetas de débito.";
  const mm=+v.slice(0,2),yy=+v.slice(3,5),exp=new Date(2000+yy,mm,0,23,59);if(!/^\d\d\/\d\d$/.test(v)||mm<1||mm>12||exp<new Date())return"El vencimiento no es válido.";
  if(c.length<(tc.marca==="AMEX"?4:3))return"El CVV no es válido.";
  return"";
}
const cardFields=(p,pre)=>`<div class="grid2">
  <div class="field span2"><label for="${pre}Tit">Titular (como figura en la tarjeta)</label><input id="${pre}Tit" value="${esc(p.titular||"")}"></div>
  <div class="field span2 card-num"><label for="${pre}Num">Número de tarjeta de crédito</label><input id="${pre}Num" inputmode="numeric" maxlength="23" placeholder="4242 4242 4242 4242" autocomplete="off"><span class="brand-tag" id="${pre}Brand"></span></div>
  <div class="field"><label for="${pre}Ven">Vencimiento (MM/AA)</label><input id="${pre}Ven" inputmode="numeric" maxlength="5" placeholder="08/28" autocomplete="off"></div>
  <div class="field"><label for="${pre}Cvv">CVV</label><input id="${pre}Cvv" inputmode="numeric" maxlength="4" placeholder="123" autocomplete="off"></div></div>`;
function bindCard(pre){const num=$(pre+"Num");
  num.oninput=()=>{const d=num.value.replace(/\D/g,"").slice(0,19);num.value=d.replace(/(.{4})/g,"$1 ").trim();const tc=TEST_CARDS[d];$(pre+"Brand").textContent=tc?tc.marca+(tc.tipo==="debito"?" · DÉBITO":" · CRÉDITO"):brandOf(d)};
  $(pre+"Ven").oninput=e=>{let d=e.target.value.replace(/\D/g,"").slice(0,4);if(d.length>2)d=d.slice(0,2)+"/"+d.slice(2);e.target.value=d};
  return()=>{const d=num.value.replace(/\D/g,""),t=$(pre+"Tit").value.trim(),v=$(pre+"Ven").value,c=$(pre+"Cvv").value.replace(/\D/g,"");
    if(!t)return{err:"Falta el titular de la tarjeta."};const er=validarTarjeta(d,v,c);if(er)return{err:er};
    const tc=TEST_CARDS[d];num.value="";$(pre+"Cvv").value="";
    return{pago:{marca:tc.marca,tipo:"credito",ultimos4:d.slice(-4),numero:d,titular:t,venc:v,actualizado:new Date().toISOString()}}}}

/* estado administrativo de una reserva (estado, habitación, cobros) */
async function saveEstado(r){await db.doc("estados/"+r.codigo).set({estado:r.estado,habitacionNro:r.habitacionNro||"",cobros:r.cobros||{},actualizado:new Date().toISOString()})}
const cobroDe=(r,n)=>(r.cobros||{})["c"+n]||{estado:"pendiente"};
const planDe=r=>r.plan||planPagos(r.estadia.llegada,r.estadia.total);

/* PIN de administración para ver tarjetas */
async function sha(t){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}
let PIN=null,pinLoaded=false;
async function loadPin(){if(!db||!isAdmin)return;try{const s=await db.doc("seguridad/pin").get();PIN=s.exists?s.data():null}catch(e){PIN=null}pinLoaded=true}
const revealTimers={};
document.addEventListener("click",async e=>{
  const v=e.target.closest("[data-reveal]");if(v){e.preventDefault();const c=v.dataset.reveal,box=$("cv-"+c);if(!box)return;
    if(!pinLoaded)await loadPin();
    if(!PIN){box.innerHTML=`<p class="small err">Primero creá el PIN de administración en Tarifas y costos → Seguridad.</p>`;return}
    box.innerHTML=`<form class="pin-form" data-pin="${esc(c)}"><input type="password" inputmode="numeric" maxlength="12" placeholder="PIN de administración" class="state-sel" aria-label="PIN de administración" autocomplete="off"><button class="btn btn-gold" type="submit" style="padding:6px 12px">Ver</button></form>`;box.querySelector("input").focus();return}
});
document.addEventListener("submit",async e=>{const f=e.target.closest("[data-pin]");if(!f)return;e.preventDefault();
  const c=f.dataset.pin,r=adm.list.find(x=>x.codigo===c),box=$("cv-"+c),val=f.querySelector("input").value;
  if(await sha(PIN.salt+val)!==PIN.hash){box.insertAdjacentHTML("beforeend",'<p class="small err">PIN incorrecto.</p>');f.querySelector("input").value="";return}
  const p=r.pago||{};box.innerHTML=`<div class="card-reveal"><b class="num">${p.numero?fmtCard(p.numero):"No disponible (reserva anterior al cambio)"}</b><span class="small">Vence ${esc(p.venc||"—")} · ${esc(p.titular||"")}</span><span class="small muted">Se oculta en 30 segundos</span></div>`;
  clearTimeout(revealTimers[c]);revealTimers[c]=setTimeout(()=>{const b=$("cv-"+c);if(b)b.innerHTML=""},30000)});

/* ===== emails al huésped con cada actualización de su reserva ===== */
const FIRMA="\n\nAnte cualquier duda, respondé este email o escribinos por WhatsApp al +598 99 123 456.\n\nSaludos,\nStay Lux & Pets Hotel\nLujo en buena compañía.";
function datosReserva(r){const e=r.estadia||{};return `Reserva: ${r.codigo}\nHabitación: ${e.habitacion}${r.habitacionNro?" · Nº "+r.habitacionNro:""}\nFechas: ${fdate(e.llegada)} → ${fdate(e.salida)} (${e.noches} ${e.noches===1?"noche":"noches"})\nCheck-in desde las 15 h · Check-out hasta las 11 h`}
const nombresMasc=r=>{const n=(r.mascotas||[]).map(m=>m.nombre).filter(Boolean);return n.length>1?n.slice(0,-1).join(", ")+" y "+n[n.length-1]:n[0]||""};
function textoAviso(r,tipo,x={}){
  const h=r.huesped||{},e=r.estadia||{},pl=planDe(r),m=nombresMasc(r),hola=`Hola ${h.nombre||""}:\n\n`;
  const planTxt=`Plan de pago (tarjeta ${r.pago?.marca||""} terminada en ${r.pago?.ultimos4||""}):\n`+pl.map(p=>`${p.n===1?"1.er":"2.º"} pago 50%: USD ${fmt(p.monto)} el ${fdate(p.fecha)}${p.n===2?" (check-in)":""} · ${cobroDe(r,p.n).estado==="cobrado"?"cobrado":"pendiente"}`).join("\n");
  if(tipo==="reserva_confirmada")return{asunto:`Tu reserva ${r.codigo} está confirmada · Stay Lux & Pets Hotel`,
    texto:hola+`¡Tu reserva está confirmada! ${m?`${m} y vos ya tienen lugar en Stay Lux & Pets Hotel.`:"Ya tenés tu lugar en Stay Lux & Pets Hotel."}\n\n${datosReserva(r)}\nTotal: USD ${fmt(e.total)} + impuestos\n\n${planTxt}\n\n${m?`Recordá traer la libreta sanitaria de ${m} con vacunas y desparasitación al día. `:""}Podés ver tu reserva en Mi cuenta, en nuestra web.`+FIRMA};
  if(tipo==="reserva_cancelada")return{asunto:`Tu reserva ${r.codigo} fue cancelada · Stay Lux & Pets Hotel`,copiaHotel:true,
    texto:hola+`Te confirmamos que la reserva ${r.codigo} fue cancelada.\n\n${datosReserva(r)}\n\nNo se realizarán más cobros sobre esta reserva.${pl.some(p=>cobroDe(r,p.n).estado==="cobrado")?" Como ya se había realizado un cobro, el equipo se comunicará con vos para el reintegro según la política de cancelación.":""} Si fue un error o querés elegir otras fechas, respondé este email y te ayudamos.`+FIRMA};
  if(tipo==="habitacion_asignada")return{asunto:`Tu habitación está lista: Nº ${r.habitacionNro} · Reserva ${r.codigo}`,
    texto:hola+`Ya tenemos asignada tu habitación para la estadía.\n\n${datosReserva(r)}\n\n${m?`Vamos a tener la cama, el comedero y el bebedero de ${m} listos para cuando lleguen.`:"La vamos a tener lista para cuando llegues."}`+FIRMA};
  if(tipo==="pago_aprobado"){const p=pl[x.n-1],resto=pl.filter(q=>cobroDe(r,q.n).estado!=="cobrado");return{asunto:`Recibimos tu pago de USD ${fmt(p.monto)} · Reserva ${r.codigo}`,
    texto:hola+`Recibimos el ${x.n===1?"primer":"segundo"} pago (50%) de tu reserva ${r.codigo}.\n\nMonto: USD ${fmt(p.monto)}\nTarjeta: ${x.tarjeta||""}\nCódigo de autorización: ${x.auth||""}\n\n${resto.length?`Próximo pago: USD ${fmt(resto[0].monto)} el ${fdate(resto[0].fecha)}${resto[0].n===2?" (en el check-in)":""}.`:"Tu estadía quedó totalmente paga. ¡Gracias!"}\n\n${datosReserva(r)}`+FIRMA}}
  if(tipo==="pago_rechazado"){const p=pl[x.n-1];return{asunto:`No pudimos procesar tu pago · Reserva ${r.codigo}`,copiaHotel:true,
    texto:hola+`No pudimos efectuar el cobro de USD ${fmt(p.monto)} (${x.n===1?"primer":"segundo"} pago, 50%) de tu reserva ${r.codigo} porque ${x.motivo}.\n\nSi deseás continuar con la reserva, actualizá tu tarjeta desde Mi cuenta en nuestra web. Recordá que debe ser una tarjeta de crédito; no aceptamos tarjetas de débito.`+FIRMA}}
  return null;
}
async function avisarHuesped(r,tipo,x){
  const t=textoAviso(r,tipo,x),para=(r.huesped&&r.huesped.email)||"";if(!t||!/^\S+@\S+\.\S+$/.test(para))return false;
  const id="NT-"+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,4).toUpperCase();
  try{await db.doc("notificaciones/"+id).set({id,tipo,para,nombre:r.huesped.nombre||"",codigo:r.codigo,asunto:t.asunto,texto:t.texto,copiaHotel:!!t.copiaHotel,creado:new Date().toISOString(),monto:x&&x.monto||0,motivo:x&&x.motivo||""});return true}catch(e){return false}
}

/* cobro simulado */
function waLink(r,txt){let t=String(r.huesped?.tel||"").replace(/\D/g,"");if(t.startsWith("0")&&/urug/i.test(r.huesped?.pais||""))t="598"+t.slice(1);return t?`https://wa.me/${t}?text=${encodeURIComponent(txt)}`:""}
const msgRechazo=(r,n,monto,motivo)=>`Hola ${r.huesped?.nombre||""}, te escribimos de Stay Lux & Pets Hotel. No pudimos efectuar el cobro de USD ${fmt(monto)} (${n===1?"primer":"segundo"} pago, 50%) de tu reserva ${r.codigo} porque ${motivo}. Si deseás continuar con la reserva, actualizá tu tarjeta desde Mi cuenta en nuestra web. Recordá que debe ser una tarjeta de crédito. Gracias.`;
async function cobrar(c,n){
  const r=adm.list.find(x=>x.codigo===c);if(!r)return;const pl=planDe(r)[n-1],tc=TEST_CARDS[(r.pago||{}).numero||""];
  adm.cobrando=c+n;renderAdmin();await new Promise(z=>setTimeout(z,900));
  const ahora=new Date().toISOString();r.cobros=r.cobros||{};
  if(!tc){r.cobros["c"+n]={estado:"rechazado",motivo:"no hay una tarjeta válida registrada",fecha:ahora}}
  else if(tc.res==="ok"){r.cobros["c"+n]={estado:"cobrado",monto:pl.monto,auth:"AUT-"+Math.random().toString(36).slice(2,8).toUpperCase(),fecha:ahora,tarjeta:tc.marca+" •••• "+r.pago.ultimos4}}
  else{r.cobros["c"+n]={estado:"rechazado",motivo:MOTIVOS[tc.res],fecha:ahora,tarjeta:tc.marca+" •••• "+r.pago.ultimos4}}
  try{await saveEstado(r)}catch(x){adm.cobrando=null;toast("No se pudo registrar el cobro");renderAdmin();return}
  const cb=r.cobros["c"+n];
  if(cb.estado==="rechazado"){
    const txt=msgRechazo(r,n,pl.monto,cb.motivo),id="NT-"+Date.now().toString(36).toUpperCase();
    try{await db.doc(`huespedes/${r._uid}/mensajes/${id}`).set({id,tipo:"pago_rechazado",codigo:r.codigo,titulo:"No pudimos procesar tu pago",texto:txt,creado:ahora,leido:false})}catch(x){}
    await avisarHuesped(r,"pago_rechazado",{n,monto:pl.monto,motivo:cb.motivo});
    adm.ultimoRechazo={c,n,link:waLink(r,txt)};toast("Pago rechazado: se avisó al huésped");
  }else{adm.ultimoRechazo=null;await avisarHuesped(r,"pago_aprobado",{n,monto:pl.monto,auth:cb.auth,tarjeta:cb.tarjeta});toast("Cobro aprobado · "+cb.auth+" · se le avisa al huésped")}
  adm.cobrando=null;renderAdmin();
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-cobrar]");if(!b)return;e.preventDefault();const[c,n]=b.dataset.cobrar.split("|");cobrar(c,+n)});
function renderCobrosAdmin(box){
  const conf=adm.list.filter(r=>r.estado==="confirmada"&&r.estadia);const items=[];
  conf.forEach(r=>planDe(r).forEach(p=>items.push({r,p,cb:cobroDe(r,p.n)})));
  const pend=items.filter(i=>i.cb.estado!=="cobrado").sort((a,b)=>a.p.fecha.localeCompare(b.p.fecha)),cob=items.filter(i=>i.cb.estado==="cobrado").sort((a,b)=>String(b.cb.fecha).localeCompare(String(a.cb.fecha)));
  const sum=l=>l.reduce((s,i)=>s+i.p.monto,0),hoy=iso(today);
  const vence=f=>{const d=Math.round((new Date(f+"T12:00")-today)/864e5);return d<0?`<span class="pill cancelada">vencido hace ${-d} d</span>`:d===0?`<span class="pill pendiente">vence hoy</span>`:`<span class="small muted">en ${d} días</span>`};
  const row=i=>{const{r,p,cb}=i,upd=r.pago&&r.pago.actualizado&&cb.fecha&&r.pago.actualizado>cb.fecha;return `<div class="cobro ${cb.estado}">
    <div class="cb-main"><b>${esc(r.huesped?.nombre)} ${esc(r.huesped?.apellido)}</b><span class="small muted">${esc(r.codigo)} · ${esc(r.estadia.habitacion)} · llegada ${fdate(r.estadia.llegada)}</span>
      <span class="small">${p.n===1?"1.er":"2.º"} pago · ${fdate(p.fecha)} ${cb.estado==="cobrado"?"":vence(p.fecha)}</span>
      ${cb.estado==="rechazado"?`<span class="small err">Rechazado: ${esc(cb.motivo)}${upd?" · <b>el huésped actualizó la tarjeta</b>":""}</span>`:""}
      ${cb.estado==="cobrado"?`<span class="small ok">Cobrado ${new Date(cb.fecha).toLocaleDateString("es-UY")} · ${esc(cb.auth)} · ${esc(cb.tarjeta||"")}</span>`:""}</div>
    <div class="cb-side"><b class="num">USD ${fmt(p.monto)}</b>${cb.estado!=="cobrado"?`<button type="button" class="btn btn-gold" data-cobrar="${esc(r.codigo)}|${p.n}" ${adm.cobrando?"disabled":""}>${adm.cobrando===r.codigo+p.n?"Procesando…":cb.estado==="rechazado"?"Reintentar cobro":"Cobrar"}</button>`:""}</div></div>`};
  const ur=adm.ultimoRechazo;
  box.innerHTML+=`<div class="kpis" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div><b>USD ${fmt(sum(pend))}</b><span>pendiente de cobro (${pend.length})</span></div><div><b>${pend.filter(i=>i.cb.estado==="rechazado").length}</b><span>pagos rechazados</span></div><div><b>USD ${fmt(sum(cob))}</b><span>cobrado (${cob.length})</span></div></div>
    ${ur?`<div class="gate" style="margin-bottom:14px"><b>Pago rechazado: avisamos al huésped</b><span class="small">El aviso quedó en su buzón de la web y le llega por email desde el Gmail de reservas en el próximo ciclo. Para WhatsApp, abrí el mensaje ya escrito y envialo:</span>${ur.link?`<a class="btn btn-gold" href="${ur.link}" target="_blank" rel="noopener" style="justify-self:start">Enviar aviso por WhatsApp</a>`:`<span class="small err">El huésped no cargó un teléfono válido.</span>`}</div>`:""}
    <p class="small muted" style="margin-bottom:12px">Plan de pago: 50% siete días antes del check-in y 50% en el check-in. Solo aparecen reservas confirmadas. Modo demostración: el cobro se simula según la tarjeta de prueba registrada.</p>
    <h3 class="k-h">Cobros pendientes</h3>${pend.length?`<div class="res-list">${pend.map(row).join("")}</div>`:`<div class="empty">No hay cobros pendientes.</div>`}
    <h3 class="k-h">Cobrados</h3>${cob.length?`<div class="res-list">${cob.map(row).join("")}</div>`:`<div class="empty">Todavía no hay cobros realizados.</div>`}`;
}

/* buzón del huésped */
let misMensajes=[];
async function loadMensajes(){if(!db||!uid||!loggedIn()){misMensajes=[];return}try{const q=await db.collection(`huespedes/${uid}/mensajes`).get();misMensajes=q.docs.map(d=>({...d.data()})).sort((a,b)=>String(b.creado).localeCompare(String(a.creado)))}catch(e){}}
const noLeidos=()=>misMensajes.filter(m=>!m.leido).length;
function renderBuzon(){const b=$("buzon");if(!b)return;
  b.innerHTML=misMensajes.length?misMensajes.map(m=>`<div class="msg-h ${m.leido?"":"unread"}"><b>${esc(m.titulo)}</b><span class="small muted">${new Date(m.creado).toLocaleString("es-UY",{dateStyle:"medium",timeStyle:"short"})}</span><p class="small">${esc(m.texto)}</p></div>`).join(""):'<p class="small muted">No tenés mensajes del hotel.</p>';
  misMensajes.filter(m=>!m.leido).forEach(m=>{db.doc(`huespedes/${uid}/mensajes/${m.id}`).update({leido:true}).catch(()=>{});m.leido=true});
  setTimeout(renderChip,50);
}
function cardUpdateForm(r){return `<form class="panel card-upd" data-upd="${esc(r.codigo)}" novalidate><b>Actualizar tarjeta de crédito</b>${cardFields({titular:r.pago?.titular||""},"u"+r.codigo.replace(/\W/g,""))}${testCardsHTML()}<div class="err" hidden></div><div class="actions"><button type="button" class="btn btn-ghost" data-upd-cancel>Cancelar</button><button class="btn btn-gold" type="submit">Guardar tarjeta</button></div></form>`}
let updOpen=null;
document.addEventListener("click",e=>{const o=e.target.closest("[data-upd-open]");if(o){updOpen=o.dataset.updOpen;renderPerfil($("cuentaBox"));return}
  if(e.target.closest("[data-upd-cancel]")){updOpen=null;renderPerfil($("cuentaBox"))}});
document.addEventListener("submit",async e=>{const f=e.target.closest("[data-upd]");if(!f)return;e.preventDefault();
  const c=f.dataset.upd,pre="u"+c.replace(/\W/g,""),get=bindCard(pre),res=get(),er=f.querySelector(".err");
  if(res.err){er.textContent=res.err;er.hidden=false;return}
  try{await db.doc(`huespedes/${uid}/reservas/${c}`).update({pago:res.pago});updOpen=null;toast("Tarjeta actualizada. El hotel reintentará el cobro.");renderPerfil($("cuentaBox"))}
  catch(x){er.textContent="No se pudo guardar la tarjeta.";er.hidden=false}});

renderImages();renderRedeem();renderPacks();renderEventos();route();renderChip();initBackend();

/* =====================================================================
   Versión GitHub Pages: datos en archivos JSON + navegador
   ===================================================================== */
/* Datos para el concierge por reglas */
window.SLPConcierge={
  get tarifas(){return ROOMS.map(r=>`${r.name} USD ${r.low} (baja) / USD ${r.high} (alta)`).join("; ")},
  get pet2(){return PET2},
  get packs(){return (PACKS||[]).map(p=>`${p.titulo} USD ${p.precio} (${p.nota})`).join("; ")},
  get eventos(){return (EVENTOS||[]).filter(v=>v.fecha>=iso(today)).map(v=>`${v.titulo} el ${fdate(v.fecha)} a las ${v.hora}`).join("; ")}
};
/* Enlace "Acceso del equipo" del pie de página */
document.addEventListener("click",e=>{if(e.target.closest("[data-acceso-equipo]")){acctTab="adm";if(currentView()==="cuenta")renderCuenta()}});

/* ---------- Administración → Emails (bandeja de salida) ---------- */
let correoAbierto=null;
async function renderCorreosAdmin(box){
  const wrap=document.createElement("div");box.appendChild(wrap);
  const q=await SLP.bd.collection("correos").get();
  const L=q.docs.map(d=>d.data()).sort((a,b)=>String(b.creado).localeCompare(String(a.creado)));
  const real=window.SLPCorreo&&SLPCorreo.emailjsActivo;
  wrap.innerHTML=`<div class="panel" style="margin-bottom:18px"><h3>Emails automáticos</h3>
    <p class="small muted">Cada reserva, consulta, confirmación, cambio de habitación y cobro genera un email con el sello de autenticidad. Remitente: <b>${esc((window.SLP_CONFIG||{}).remitente||"stayluxpetshotelreservas@gmail.com")}</b>. Avisos del hotel: <b>${esc((window.SLP_CONFIG||{}).hotelEmail||"stayluxpetshotel@gmail.com")}</b>.</p>
    <p class="small">${real?'<b class="ok">Envío real activado (EmailJS).</b>':'<b>Modo bandeja:</b> los emails quedan guardados acá. Para que salgan de verdad, completá los datos de EmailJS en <code>js/config.js</code> (ver README).'}</p></div>
    <div class="res-list">${L.length?L.map(m=>`<details class="res" ${correoAbierto===m.id?"open":""} data-mail="${esc(m.id)}"><summary>
      <span class="pill ${m.estado==="enviado"?"confirmada":m.estado==="error"?"cancelada":"pendiente"}">${esc(m.estado)}</span>
      <div class="who"><b>${esc(m.asunto)}</b><span>Para ${esc(m.para)}${m.bcc?" · copia "+esc(m.bcc):""} · ${new Date(m.creado).toLocaleString("es-UY",{dateStyle:"short",timeStyle:"short"})}</span></div>
      <div class="amt small">${esc(m.codigoVerificacion)}</div></summary>
      <div style="padding:14px"><iframe title="Vista del email" style="width:100%;height:560px;border:1px solid var(--line,#ddd);border-radius:10px;background:#fff" data-src="${esc(m.id)}"></iframe>
      ${m.error?`<p class="err small">Error: ${esc(m.error)}</p>`:""}
      <div class="actions"><a class="btn btn-ghost" href="mailto:${encodeURIComponent(m.para)}?subject=${encodeURIComponent(m.asunto)}&body=${encodeURIComponent(m.textoPlano.slice(0,1800))}">Abrir en mi correo</a>${real?`<button type="button" class="btn btn-gold" data-reenviar="${esc(m.id)}">Reenviar</button>`:""}</div></div></details>`).join(""):'<div class="empty">Todavía no se generaron emails. Hacé una reserva de prueba o enviá una consulta.</div>'}</div>`;
  const byId=Object.fromEntries(L.map(m=>[m.id,m]));
  const cargar=d=>{const f=d.querySelector("iframe");if(f&&!f.srcdoc)f.srcdoc=byId[f.dataset.src].html};
  wrap.querySelectorAll("details[data-mail]").forEach(d=>{if(d.open)cargar(d);d.addEventListener("toggle",()=>{if(d.open){correoAbierto=d.dataset.mail;cargar(d)}})});
  wrap.querySelectorAll("[data-reenviar]").forEach(b=>b.onclick=async()=>{b.disabled=true;b.textContent="Enviando…";const ok=await SLPCorreo.reenviar(b.dataset.reenviar);toast(ok?"Email enviado":"No se pudo enviar");renderAdmin()});
}

/* ---------- Administración → Base de datos (archivos JSON) ---------- */
const TABLA_INFO={huespedes:"Huéspedes, sus reservas, canjes y mensajes",cuentas:"Cuentas (email + contraseña cifrada)",estados:"Estado, habitación y cobros de cada reserva",consultas:"Consultas del formulario de contacto",notificaciones:"Avisos enviados a huéspedes",correos:"Emails generados (bandeja de salida)",avisos:"Control de emails ya generados",verificaciones:"Códigos de los sellos de autenticidad",packs:"Packs",eventos:"Eventos",config:"Tarifas y costos",seguridad:"Acceso de administración",imagenes:"Fotos asignadas a cada sección",archivos:"Imágenes subidas",_sistema:"Control interno"};
function renderBaseAdmin(box){
  const R=SLP.base.resumen(),kb=Math.round(SLP.base.bytes()/1024);
  const wrap=document.createElement("div");box.appendChild(wrap);
  wrap.innerHTML=`<div class="panel" style="margin-bottom:18px"><h3>Base de datos en archivos</h3>
    <p class="small muted">El sitio no usa servidor: cada tabla es un archivo JSON. Las tablas iniciales están en la carpeta <code>data/</code> del repositorio; lo que se carga en la web (reservas, huéspedes, cobros) se guarda en este navegador. Descargá la copia completa para guardarla, pasarla a otra computadora o subirla al repositorio.</p>
    <div class="actions"><button type="button" class="btn btn-gold" id="bdExp">Descargar base completa (.json)</button><label class="btn btn-ghost" style="cursor:pointer">Cargar una copia<input type="file" id="bdImp" accept="application/json,.json" hidden></label><button type="button" class="btn btn-ghost" id="bdReset">Volver a los datos iniciales</button></div>
    <p class="small muted">Tamaño actual: ${fmt(kb)} KB.</p><div class="err" id="bdErr" hidden></div></div>
    <div class="panel"><h3>Tablas</h3><div class="res-list">${Object.keys(R).sort().map(t=>`<div class="my-res" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:200px"><b>${esc(t)}.json</b><div class="small muted">${esc(TABLA_INFO[t]||"")} · ${R[t]} registro${R[t]===1?"":"s"}</div></div><button type="button" class="btn btn-ghost" style="padding:6px 14px" data-tabla="${esc(t)}">Descargar</button></div>`).join("")}</div></div>`;
  const hoy=new Date().toISOString().slice(0,10);
  $("bdExp").onclick=()=>{downloadJSON(`staylux-pets-hotel-base-${hoy}.json`,SLP.base.exportar());toast("Copia descargada")};
  wrap.querySelectorAll("[data-tabla]").forEach(b=>b.onclick=()=>downloadJSON(b.dataset.tabla+".json",SLP.base.tabla(b.dataset.tabla)));
  $("bdImp").onchange=async e=>{const f=e.target.files[0];if(!f)return;const er=$("bdErr");er.hidden=true;
    try{const o=JSON.parse(await f.text());if(!confirmar("Esto reemplaza todos los datos de este navegador por los del archivo."))return;await SLP.base.importar(o);toast("Base cargada");setTimeout(()=>location.reload(),600)}
    catch(x){er.textContent=x.message||"No se pudo leer el archivo.";er.hidden=false}};
  $("bdReset").onclick=async()=>{if(!confirmar("Se borran reservas, huéspedes y cambios de este navegador y se vuelve a las tablas de data/."))return;await SLP.base.reiniciar();try{sessionStorage.clear()}catch(e){}toast("Datos iniciales cargados");setTimeout(()=>location.reload(),600)};
}
function downloadJSON(nombre,obj){SLP.base&&claude.use("downloads").then(d=>d.save({filename:nombre,data:JSON.stringify(obj,null,2)}))}
function confirmar(msg){try{return window.confirm(msg)}catch(e){return true}}

})();
