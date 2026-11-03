const IVA_RATE = 0.21;
const STORAGE_KEY = "hojaldra-admin-v4";

// --- Backend en Google Sheets / Apps Script ---
// Pegá acá la URL de tu implementación (termina en /exec). Mientras diga
// "REEMPLAZAR", la app sigue andando solo con localStorage.
// La CLAVE DE ACCESO ya no está escrita en el código: la app la pide la
// primera vez que se abre en cada navegador y la guarda solo ahí. Las
// claves reales (de edición y de solo lectura) viven en las Propiedades del
// script de Google, no en GitHub.
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxtc0qqle_vhZc3qBhzSavyf1xhlypRDNj-PfD-aQWwnA31JKRa9NB_Wi-e7DRvO95k/exec";
const ACCESS_KEY_STORAGE = "hojaldra-clave";
const CLOUD_CONFIGURED = !APPS_SCRIPT_URL.includes("REEMPLAZAR");

const seed = {
  providers: [
    { id: "cp", name: "CP", taxId: "" },
    { id: "nestor", name: "Nestor", taxId: "" }
  ],
  // billingCycle: "weekly" | "monthly" | "po" (orden de compra, sin periodo fijo)
  // weekStartDay solo se usa si billingCycle === "weekly": 0=domingo ... 6=sabado
  clients: [
    { id: "vip1", name: "VIP 1", billingCycle: "weekly", weekStartDay: 6 },
    { id: "vip2", name: "VIP 2", billingCycle: "weekly", weekStartDay: 6 },
    { id: "aeroparque", name: "AEROPARQUE", billingCycle: "weekly", weekStartDay: 6 },
    { id: "ezeiza", name: "EZEIZA MISRESTO", billingCycle: "weekly", weekStartDay: 6 },
    { id: "freshfood", name: "FRESHFOOD", billingCycle: "weekly", weekStartDay: 6 },
    { id: "faena", name: "FAENA MERCADO", billingCycle: "po", weekStartDay: 6 },
    { id: "crossracer", name: "CROSSRACER", billingCycle: "weekly", weekStartDay: 1 }
  ],
  locations: [
    { id: "vip1", clientId: "vip1", name: "VIP 1" },
    { id: "vip2", clientId: "vip2", name: "VIP 2" },
    { id: "aep", clientId: "aeroparque", name: "AEROPARQUE" },
    { id: "ezemis", clientId: "ezeiza", name: "EZEIZA MISRESTO" },
    { id: "freshfood", clientId: "freshfood", name: "FRESHFOOD" },
    { id: "faena", clientId: "faena", name: "FAENA MERCADO" },
    { id: "ameo", clientId: "crossracer", name: "AMEO CABOTAJE" },
    { id: "latam", clientId: "crossracer", name: "LATAM" },
    { id: "visa", clientId: "crossracer", name: "VISA" },
    { id: "bbva", clientId: "crossracer", name: "BBVA" },
    { id: "star", clientId: "crossracer", name: "STAR ALLIANCE" },
    { id: "ezeizalounge", clientId: "crossracer", name: "EZEIZA LOUNGE" }
  ],
  products: [
    { id: "med_mt", name: "MEDIALUNA MT", unit: "un" },
    { id: "med_grasa", name: "MEDIALUNA GRASA", unit: "un" },
    { id: "sant_mt", name: "SANTIAGUENA MT", unit: "un" },
    { id: "minion", name: "MINION", unit: "kg" },
    { id: "alf_negro", name: "MINI ALFAJOR NEGRO", unit: "un" },
    { id: "alf_blanco", name: "MINI ALFAJOR BLANCO", unit: "un" },
    { id: "brownie", name: "PLACA - BROWNIE 60X40", unit: "un" },
    { id: "coco", name: "PLACA - COCO Y DDL 60X40", unit: "un" },
    { id: "mini_croix", name: "MINI CROIX 35 GR", unit: "un" },
    { id: "roll_canela", name: "ROLL CANELA", unit: "un" },
    { id: "pan_campo", name: "PAN DE CAMPO 335 GR", unit: "un" }
  ],
  priceRules: [
    rule("vip2", "vip2", "cp", "med_mt", 490, 10, "2026-01-01"),
    rule("vip2", "vip2", "cp", "alf_negro", 650, 10, "2026-01-01"),
    rule("vip2", "vip2", "cp", "alf_blanco", 650, 10, "2026-01-01"),
    rule("vip2", "vip2", "cp", "brownie", 100000, 10, "2026-01-01"),
    rule("vip2", "vip2", "cp", "coco", 88000, 10, "2026-01-01"),
    rule("freshfood", "freshfood", "cp", "med_mt", 490, 10, "2026-01-01"),
    rule("freshfood", "freshfood", "cp", "med_grasa", 490, 10, "2026-01-01"),
    rule("freshfood", "freshfood", "cp", "mini_croix", 290, 10, "2026-01-01"),
    rule("faena", "faena", "cp", "med_mt", 520, 10, "2026-01-01"),
    rule("faena", "faena", "cp", "pan_campo", 1650, 10, "2026-01-01"),
    ruleFromCost("aeroparque", "aep", "cp", "med_mt", 490, 380, "2026-01-01"),
    ruleFromCost("aeroparque", "aep", "cp", "med_grasa", 490, 380, "2026-01-01"),
    ruleFromCost("ezeiza", "ezemis", "cp", "med_mt", 490, 380, "2026-01-01"),
    ruleFromCost("crossracer", "ameo", "cp", "med_mt", 520, 380, "2026-01-01"),
    ruleFromCost("crossracer", "ameo", "cp", "sant_mt", 950, 825, "2026-01-01"),
    ruleFromCost("crossracer", "ameo", "cp", "minion", 5400, 4500, "2026-01-01"),
    ruleFromCost("crossracer", "latam", "cp", "sant_mt", 950, 825, "2026-01-01"),
    ruleFromCost("crossracer", "visa", "cp", "med_mt", 520, 380, "2026-01-01"),
    ruleFromCost("crossracer", "bbva", "cp", "med_mt", 520, 380, "2026-01-01"),
    ruleFromCost("crossracer", "star", "cp", "med_mt", 520, 380, "2026-01-01"),
    ruleFromCost("crossracer", "ezeizalounge", "cp", "med_mt", 520, 380, "2026-01-01")
  ],
  deliveries: [
    delivery("2026-07-27", "782", "crossracer", "ameo", "cp", "med_mt", 100, "foto r782"),
    delivery("2026-07-27", "782", "crossracer", "ameo", "cp", "sant_mt", 80, "foto r782"),
    delivery("2026-07-27", "782", "crossracer", "ameo", "cp", "minion", 5, "foto r782"),
    delivery("2026-06-30", "608", "vip2", "vip2", "cp", "med_mt", 500, ""),
    delivery("2026-06-30", "608", "vip2", "vip2", "cp", "alf_negro", 220, ""),
    delivery("2026-07-06", "645", "crossracer", "star", "cp", "med_mt", 140, ""),
    delivery("2026-07-06", "645", "crossracer", "ezeizalounge", "cp", "med_mt", 120, ""),
    delivery("2026-07-17", "CP-FF-01", "freshfood", "freshfood", "cp", "med_mt", 60, "")
  ],
  // deliveryIds: qué remitos puntuales cubre esta factura (trazabilidad real).
  // amountGross se calcula solo, sumando los remitos tildados.
  invoices: [],
  // paymentOrders (Orden de Pago): agrupa N facturas de cliente de cualquier
  // sala/semana, calcula retenciones sobre el total, y cuelgan de acá los
  // cheques que cubren el neto a abonar. Ver checks abajo.
  paymentOrders: [],
  // checks: cuelgan de una paymentOrder. O se depositan (ACREDITADO, plata
  // real en el banco) o se endosan a una o más facturas de proveedor —
  // ENDOSADO si se usó todo el monto, ENDOSADO_PARCIAL si todavía le queda
  // saldo sin asignar (nunca tocan la cuenta de Hojaldra, van directo del
  // cliente que las emitió al proveedor). check.allocations guarda cuánto
  // de ese cheque quedó aplicado a cada factura de proveedor puntual —
  // ver checkRemaining/checkAllocatedTotal y providerInvoiceCoverage.
  checks: [],
  // directPayments: pagos en efectivo/transferencia registrados a mano para
  // cerrar una factura de proveedor — ya sea el pago completo (proveedor
  // sin endoso) o el complemento que falta después de endosar cheques
  // (ver providerInvoiceCoverage). Es la única plata que Liquidez cuenta
  // como "Pagado a prov. real", junto con los cheques ACREDITADO del lado
  // de cobros.
  directPayments: [],
  expenses: [],
  // ivaPeriods: declaraciones de IVA (F.2051) que presenta el contador, una
  // por mes, cargadas a mano: { id, period "AAAA-MM", debito, credito,
  // retenciones, usos, saldoPrevio|null, saldoDDJJ|null }. Con eso el panel
  // "Posición de IVA" arrastra el saldo a favor mes a mes igual que ARCA.
  ivaPeriods: [],
  openingBalance: 0
};

// state arranca con un placeholder; boot() lo reemplaza por la copia real
// (nube o local) antes del primer render().
//
// OJO: render() termina llamando a saveState(). Si la carga desde la nube
// fallaba y el navegador no tenía copia local, el estado quedaba en el
// seed de demo y ese render() lo mandaba a la nube, PISANDO la base real
// (pasó el 30/10/2026). Por eso ahora hay tres frenos (ver saveState):
//   1. cloudReady: no se guarda nada hasta que la nube haya respondido bien.
//   2. saveBlockedReason: si algo huele mal, se frena TODO (nube y
//      localStorage) y se muestra un cartel hasta que se recargue.
//   3. guardia de tamaño: no se pisa una base grande con una casi vacía.
let state = structuredClone(seed);

// Colecciones que se cuentan para detectar "se perdieron datos".
const SCORED_COLLECTIONS = ["deliveries", "invoices", "paymentOrders", "checks", "directPayments", "expenses", "priceRules"];
// Sin nube configurada se trabaja solo en local, como siempre.
let cloudReady = !CLOUD_CONFIGURED;
let saveBlockedReason = null;
// Cantidad de registros de la última versión que la nube confirmó.
let lastCloudScore = 0;
// savedAt de la última versión confirmada en la nube (para verificar que
// un guardado realmente la actualizó).
let lastCloudSavedAt = null;
// Lo prende el import en modo "reemplazar": el usuario ya confirmó que
// quiere reemplazar todo, así que se permite UN guardado más chico.
let allowShrinkOnce = false;

function collectionCounts(s) {
  const counts = {};
  SCORED_COLLECTIONS.forEach((key) => {
    counts[key] = s && Array.isArray(s[key]) ? s[key].length : 0;
  });
  return counts;
}

function stateScore(s) {
  const counts = collectionCounts(s);
  return SCORED_COLLECTIONS.reduce((sum, key) => sum + counts[key], 0);
}

function sameCounts(a, b) {
  return SCORED_COLLECTIONS.every((key) => a[key] === b[key]);
}

// Rol que dice el servidor según la clave: "edit" (puede guardar) o "view"
// (solo lectura). Si el servidor no informa rol, se asume solo lectura.
let readOnly = false;
// Lo prende saveState() cuando se permite un guardado más chico (import
// "reemplazar"); pushCloudState() se lo avisa al servidor con force=1.
let forceNextPush = false;

function getAccessKey() {
  try { return localStorage.getItem(ACCESS_KEY_STORAGE) || ""; } catch (err) { return ""; }
}

function forgetAccessKey() {
  try { localStorage.removeItem(ACCESS_KEY_STORAGE); } catch (err) { /* nada */ }
}

function cloudUrl() {
  return `${APPS_SCRIPT_URL}?key=${encodeURIComponent(getAccessKey())}`;
}

/**
 * Pantalla que pide la clave. Frena todos los guardados mientras esté
 * abierta. Al enviar, guarda la clave en este navegador y recarga.
 */
function requireAccessKey(message) {
  saveBlockedReason = "clave";
  clearTimeout(cloudSaveTimer);
  cloudSaveQueued = false;
  let el = document.getElementById("accessKeyOverlay");
  if (!el) {
    el = document.createElement("div");
    el.id = "accessKeyOverlay";
    el.style.cssText = "position:fixed;inset:0;z-index:1001;background:rgba(23,33,29,0.94);display:flex;align-items:center;justify-content:center;padding:24px;";
    document.body.appendChild(el);
  }
  el.innerHTML = `
    <div style="max-width:420px;width:100%;background:#fff;color:#17211d;border-radius:10px;padding:24px;display:grid;gap:12px;">
      <h2 style="margin:0;">Hojaldra Admin</h2>
      <p>${escapeHtml(message || "Ingresá la clave de acceso.")}</p>
      <input id="accessKeyInput" type="password" autocomplete="current-password" placeholder="Clave de acceso" />
      <button type="button" id="accessKeyBtn">Entrar</button>
      <p style="color:#66716b;font-size:12px;">La clave se guarda solo en este navegador. Usá "Salir" para olvidarla.</p>
    </div>`;
  const submit = () => {
    const value = el.querySelector("#accessKeyInput").value.trim();
    if (!value) return;
    localStorage.setItem(ACCESS_KEY_STORAGE, value);
    location.reload();
  };
  el.querySelector("#accessKeyBtn").addEventListener("click", submit);
  el.querySelector("#accessKeyInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") submit();
  });
  el.querySelector("#accessKeyInput").focus();
}

/** Botón "Salir" y cartel de solo lectura (se arman por JS, sin tocar index.html). */
function setupSessionUi() {
  if (!CLOUD_CONFIGURED) return;
  const actions = document.querySelector(".top-actions");
  if (actions && !document.getElementById("logoutBtn")) {
    const button = document.createElement("button");
    button.type = "button";
    button.id = "logoutBtn";
    button.textContent = "Salir";
    button.title = "Olvidar la clave en este navegador";
    button.addEventListener("click", () => {
      if (confirm("¿Salir y olvidar la clave en este navegador?")) {
        forgetAccessKey();
        location.reload();
      }
    });
    actions.appendChild(button);
  }
  if (readOnly && !document.getElementById("readOnlyBanner")) {
    const bar = document.createElement("div");
    bar.id = "readOnlyBanner";
    bar.textContent = "Modo solo lectura: podés mirar todo, pero los cambios no se guardan.";
    bar.style.cssText = "background:#fff4d6;color:#7a4e09;font-weight:700;padding:8px 28px;border-bottom:1px solid #e6d7a8;";
    document.body.insertBefore(bar, document.body.firstChild);
  }
}

/**
 * Frena todos los guardados (nube y localStorage) y muestra un cartel que
 * tapa la pantalla. No borra ni modifica nada: recargar la página vuelve a
 * intentar la carga desde la nube.
 */
function blockSaving(reason) {
  saveBlockedReason = reason;
  clearTimeout(cloudSaveTimer);
  cloudSaveQueued = false;
  showBlockedOverlay(reason);
}

function showBlockedOverlay(reason) {
  let el = document.getElementById("saveBlockedOverlay");
  if (!el) {
    el = document.createElement("div");
    el.id = "saveBlockedOverlay";
    el.style.cssText = "position:fixed;inset:0;z-index:1000;background:rgba(23,33,29,0.92);display:flex;align-items:center;justify-content:center;padding:24px;";
    document.body.appendChild(el);
  }
  el.innerHTML = `
    <div style="max-width:540px;background:#fff;color:#17211d;border-radius:10px;padding:24px;display:grid;gap:12px;">
      <h2 style="margin:0;">Guardado frenado por seguridad</h2>
      <p>${escapeHtml(reason)}</p>
      <p>No se guardó ni se borró nada. Recargá la página para volver a intentar. Si sigue pasando, no cargues datos y avisá.</p>
      <button type="button" onclick="location.reload()">Reintentar</button>
    </div>`;
}

/**
 * Pedido tipo JSONP: agrega un <script> al documento en vez de usar
 * fetch/XHR. Nunca pasa por el chequeo de CORS (los <script src> jamás lo
 * hicieron, por eso existía JSONP mucho antes de que existiera CORS), así
 * que esquiva por completo la limitación de Apps Script.
 */
function jsonpRequest(url) {
  return new Promise((resolve, reject) => {
    const callbackName = `hojaldraCb${Date.now()}${Math.floor(Math.random() * 1e6)}`;
    const script = document.createElement("script");
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("timeout"));
    }, 15000);

    function cleanup() {
      clearTimeout(timer);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("No se pudo cargar el script"));
    };
    script.src = `${url}${url.includes("?") ? "&" : "?"}callback=${callbackName}&nocache=${Date.now()}`;
    document.head.appendChild(script);
  });
}

/**
 * Manda el formulario a un iframe oculto y NO espera respuesta por
 * postMessage — Google le pone X-Frame-Options: SAMEORIGIN a esa página,
 * así que el navegador ni siquiera deja que el iframe la muestre, y el
 * mensaje nunca llega. Es una restricción del lado de Google, no algo que
 * podamos resolver desde acá. El guardado en sí SÍ llega igual (el
 * formulario se manda igual, solo que a ciegas) — la confirmación se hace
 * aparte, releyendo el dato después.
 */
function submitHiddenForm(url, fields) {
  const frameName = `hojaldraFrame${Date.now()}${Math.floor(Math.random() * 1e6)}`;
  const iframe = document.createElement("iframe");
  iframe.name = frameName;
  iframe.style.display = "none";

  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;
  form.target = frameName;
  form.style.display = "none";
  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(iframe);
  document.body.appendChild(form);
  form.submit();
  setTimeout(() => {
    iframe.remove();
    form.remove();
  }, 5000);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// rule(): comisión % conocida directamente (no hay costo exacto en pesos
// para esa regla). ruleFromCost(): costo real del proveedor conocido — se
// guarda tal cual, sin pasar por ningún redondeo, y es la fuente de verdad
// para calcular plata (ver totalsFor). La comisión % en ambos casos queda
// como dato de referencia/visualización.
function rule(clientId, locationId, providerId, productId, salePrice, commissionPct, validFrom) {
  return { id: cryptoId(), clientId, locationId, providerId, productId, salePrice, commissionPct: round4(commissionPct), validFrom };
}

function ruleFromCost(clientId, locationId, providerId, productId, salePrice, providerCost, validFrom) {
  return {
    id: cryptoId(),
    clientId,
    locationId,
    providerId,
    productId,
    salePrice,
    providerCost,
    commissionPct: round4(commissionFromCost(salePrice, providerCost)),
    validFrom
  };
}

function commissionFromCost(salePrice, providerCost) {
  return ((salePrice - providerCost) / salePrice) * 100;
}

function round2(value) {
  return Math.round(Number(value) * 100) / 100;
}

/**
 * Igual que round2 pero a 4 decimales. Se usa para guardar commissionPct:
 * si redondeamos el % a solo 2 decimales (ej: 18.18%) y después
 * recalculamos el costo desde ese % redondeado, aparecen diferencias de
 * varios centavos (ej: $4500 -> $4500.10). Guardando el % con más
 * precisión el costo recalculado vuelve a cerrar contra el costo real.
 */
function round4(value) {
  return Math.round(Number(value) * 10000) / 10000;
}

function delivery(date, receiptNo, clientId, locationId, providerId, productId, quantity, note, billingMode) {
  return { id: cryptoId(), date, receiptNo, clientId, locationId, providerId, productId, quantity, note, billingMode: billingMode || "NORMAL" };
}

function cryptoId() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Carga el estado: primero intenta la nube (Apps Script); si falla o no
 * está configurada, usa la última copia en localStorage; si no hay
 * ninguna de las dos, arranca del seed de demo.
 */
async function loadState() {
  const cached = safeParse(localStorage.getItem(STORAGE_KEY));

  if (!CLOUD_CONFIGURED) {
    setSyncStatus("sin-configurar");
    return hydrate(cached);
  }

  if (!getAccessKey()) {
    setSyncStatus("sin-clave");
    requireAccessKey("Ingresá la clave de acceso.");
    return hydrate(null);
  }

  try {
    const json = await jsonpRequest(cloudUrl());
    if (json.error === "unauthorized") {
      forgetAccessKey();
      setSyncStatus("sin-clave");
      requireAccessKey("La clave no es correcta. Probá de nuevo.");
      return hydrate(null);
    }
    if (json.error) throw new Error(json.error);
    readOnly = json.role !== "edit";

    const hasCloudData = !!json.data && Object.keys(json.data).length > 0;
    if (!hasCloudData && !cached) {
      // Nube vacía Y sin copia local: la única opción sería arrancar del
      // seed de demo y mandarlo a la nube. No se hace.
      setSyncStatus("error");
      blockSaving("La nube respondió sin datos y este navegador no tiene copia local. Por seguridad no se arranca con datos de demo.");
      return hydrate(null);
    }

    cloudReady = true;
    lastCloudSavedAt = json.savedAt || null;
    setSyncStatus("guardado", json.savedAt);
    // Nube con datos: manda la nube. Nube vacía pero con copia local: es
    // la migración inicial, se sube la copia local.
    const loaded = hydrate(hasCloudData ? json.data : cached);
    lastCloudScore = hasCloudData ? stateScore(loaded) : 0;
    return loaded;
  } catch (err) {
    // NO seguimos con la copia local: trabajar así y después guardar es
    // justo lo que pisaba la nube con datos viejos o con el seed.
    console.error("No se pudo cargar desde la nube:", err);
    setSyncStatus("offline");
    blockSaving("No se pudo cargar la base desde la nube (sin conexión, o Google no respondió a tiempo).");
    return hydrate(cached);
  }
}

function hydrate(saved) {
  if (!saved || !Object.keys(saved).length) return structuredClone(seed);
  const merged = {
    ...structuredClone(seed),
    ...saved,
    invoices: saved.invoices || [],
    expenses: saved.expenses || [],
    paymentOrders: saved.paymentOrders || [],
    checks: saved.checks || [],
    directPayments: saved.directPayments || [],
    ivaPeriods: saved.ivaPeriods || []
  };
  merged.priceRules = (merged.priceRules || []).map(migrateRuleToCommission);
  merged.checks = (merged.checks || []).map(migrateCheckAllocations);
  return merged;
}

function safeParse(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Migración de datos viejos: si en localStorage/Sheets todavía hay cheques
 * endosados con el modelo viejo (providerInvoiceIds, sin monto por
 * factura), les arma el/los allocations equivalentes para que
 * providerInvoiceCoverage() los siga contando. Con el modelo viejo un
 * cheque solo podía terminar ENDOSADO a una factura por vez (el picker lo
 * sacaba de la lista apenas se usaba una vez), así que el caso normal es
 * una sola factura con el monto completo. Si por algún motivo quedó
 * linkeado a más de una (no debería poder pasar por la UI vieja, pero por
 * las dudas), se reparte el monto completo entre todas en partes iguales
 * en vez de contarlo entero para cada una — eso sí hubiera duplicado plata.
 */
function migrateCheckAllocations(check) {
  if (!check.allocations && check.providerInvoiceIds && check.providerInvoiceIds.length) {
    const n = check.providerInvoiceIds.length;
    const monto = Number(check.monto || 0);
    check.allocations = check.providerInvoiceIds.map((invoiceId, i) => ({
      invoiceId,
      // La última cuota se ajusta por redondeo para que la suma cierre justo.
      amount: i < n - 1 ? round2(monto / n) : round2(monto - round2(monto / n) * (n - 1))
    }));
  }
  if (!check.allocations) check.allocations = [];
  delete check.providerInvoiceIds;
  return check;
}

/**
 * Migración de datos viejos: si en localStorage todavía hay reglas con
 * marginMode "cost" (de antes de unificar la métrica), les recalcula la
 * comisión % de referencia y LES CONSERVA el costo real — antes esta
 * función lo borraba, que es lo que causaba los centavos de diferencia
 * (se perdía el dato exacto y quedaba solo el % redondeado).
 */
function migrateRuleToCommission(item) {
  if (item.marginMode === "cost") {
    const { marginMode, ...rest } = item;
    return { ...rest, commissionPct: round4(commissionFromCost(item.salePrice, item.providerCost)) };
  }
  if (item.marginMode === "commission") {
    const { marginMode, providerCost, ...rest } = item;
    return rest;
  }
  return item;
}

/**
 * localStorage se escribe siempre, al toque — es la red de seguridad y lo
 * que te deja seguir trabajando sin internet. El guardado en la nube se
 * dispara con un pequeño delay (para no mandar un request por cada
 * tecla si hay varios cambios seguidos) y no bloquea la interfaz.
 */
function saveState() {
  // Frenado: no se toca ni la nube ni localStorage.
  if (saveBlockedReason) return;
  // Clave de solo lectura: se mira, no se guarda nada.
  if (readOnly) return;

  if (CLOUD_CONFIGURED) {
    // La nube todavía no respondió bien: lo que hay en memoria puede ser
    // el seed o una copia vieja, y no se guarda.
    if (!cloudReady) return;

    const shrinkOk = allowShrinkOnce;
    allowShrinkOnce = false;
    if (shrinkOk) forceNextPush = true;
    const score = stateScore(state);
    if (!shrinkOk && lastCloudScore >= 50 && score < lastCloudScore * 0.5) {
      blockSaving(`El estado actual tiene ${score} registros y la última versión guardada en la nube tenía ${lastCloudScore}. Parece que se perdieron datos, así que no se guardó nada.`);
      return;
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  scheduleCloudSave();
}

let cloudSaveTimer = null;
// Evita que dos guardados en la nube corran en paralelo (podían "cruzarse"
// en la red y dejar guardada una versión vieja encima de una más nueva,
// sin ningún aviso en pantalla). Si llega un pedido de guardado mientras
// ya hay uno en curso, se marca "queued" en vez de disparar otro en
// paralelo; apenas termina el que está en curso, se dispara el siguiente
// con el estado más fresco. Nunca hay dos escrituras compitiendo.
let cloudSaveInFlight = false;
let cloudSaveQueued = false;

function scheduleCloudSave() {
  if (!CLOUD_CONFIGURED || saveBlockedReason || readOnly) return;
  setSyncStatus("pendiente");
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(triggerCloudSave, 800);
}

function triggerCloudSave() {
  if (cloudSaveInFlight) {
    cloudSaveQueued = true;
    return;
  }
  pushCloudState();
}

async function pushCloudState() {
  if (saveBlockedReason || readOnly || !cloudReady) return;
  cloudSaveInFlight = true;
  setSyncStatus("guardando");
  try {
    const sentCounts = collectionCounts(state);
    const previousSavedAt = lastCloudSavedAt;
    const force = forceNextPush;
    forceNextPush = false;
    submitHiddenForm(APPS_SCRIPT_URL, {
      key: getAccessKey(),
      data: JSON.stringify(state),
      force: force ? "1" : "0"
    });
    // Sin confirmación directa posible (ver submitHiddenForm) — le damos
    // un instante a Apps Script para procesar y confirmamos releyendo.
    // Antes solo se miraba que no hubiera error, así que podía decir
    // "Guardado" con una versión vieja. Ahora se exige que la nube
    // devuelva la misma cantidad de registros que se mandó y un savedAt
    // distinto al anterior. Con datos grandes Apps Script tarda, por eso
    // se relee hasta 4 veces antes de dar el guardado por fallido.
    await wait(1200);
    const url = cloudUrl();
    let json = null;
    let confirmed = false;
    for (let attempt = 0; attempt < 4 && !confirmed; attempt++) {
      if (attempt > 0) await wait(1500);
      json = await jsonpRequest(url);
      if (json.error === "unauthorized") {
        forgetAccessKey();
        requireAccessKey("La clave cambió o ya no es válida. Ingresala de nuevo.");
        throw new Error("unauthorized");
      }
      if (json.error) throw new Error(json.error);
      confirmed = !!json.data
        && sameCounts(collectionCounts(json.data), sentCounts)
        && (!previousSavedAt || json.savedAt !== previousSavedAt);
    }
    if (!confirmed) throw new Error("La nube no devolvió lo que se acaba de guardar");
    lastCloudScore = stateScore(json.data);
    lastCloudSavedAt = json.savedAt || null;
    setSyncStatus("guardado", json.savedAt);
  } catch (err) {
    console.error("No se pudo confirmar el guardado en la nube (probablemente igual se guardó, revisar la Sheet):", err);
    setSyncStatus("error");
  } finally {
    cloudSaveInFlight = false;
    if (cloudSaveQueued) {
      cloudSaveQueued = false;
      pushCloudState();
    }
  }
}

// Si se corta y vuelve la conexión, reintenta mandar lo último.
window.addEventListener("online", () => {
  if (CLOUD_CONFIGURED && cloudReady && !saveBlockedReason && !readOnly) triggerCloudSave();
});

function setSyncStatus(status, savedAt) {
  const el = document.getElementById("syncStatus");
  if (!el) return;
  const time = savedAt ? new Date(savedAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) : "";
  const labels = {
    "cargando": "Cargando...",
    "guardado": time ? `Guardado en la nube · ${time}` : "Guardado en la nube",
    "guardando": "Guardando en la nube...",
    "pendiente": "Cambios sin guardar todavía...",
    "offline": "Sin conexión con la nube",
    "sin-clave": "Falta la clave de acceso",
    "error": "No se pudo guardar en la nube — reintentando",
    "sin-configurar": "Guardado solo en este navegador (falta configurar la nube)"
  };
  el.textContent = labels[status] || status;
  el.className = `sync-status status-${status}`;
}

function byId(collection, id) {
  return collection.find((item) => item.id === id);
}

function money(value) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
}

/**
 * Numero de semana generico, parametrizado por el dia en que arranca la
 * semana de ESE cliente (0=domingo ... 6=sabado). Reemplaza al viejo
 * weekNumber() unico para todos, que rompia para CrossRacer (arranca
 * lunes) contra el resto (arranca sabado).
 */
function weekNumberFor(dateText, weekStartDay) {
  const date = new Date(`${dateText}T12:00:00`);
  const jan1 = new Date(date.getFullYear(), 0, 1);
  const jan1Day = jan1.getDay();
  const daysSinceStart = (jan1Day - weekStartDay + 7) % 7;
  const week1Start = new Date(jan1);
  week1Start.setDate(jan1.getDate() - daysSinceStart);
  const days = Math.floor((date - week1Start) / 86400000);
  return Math.floor(days / 7) + 1;
}

/**
 * Para clientes "po" (orden de compra, ej. FAENA) no hay semana calendario
 * — el "período" real es la OC/factura. Prioridad: si el remito ya está
 * dentro de una factura de cliente, esa factura manda (es la fuente de
 * verdad, la que se cargó en ARCA). Si todavía no está facturado pero ya
 * anotaste la OC en el remito (campo opcional, para cuando te la avisan
 * antes de facturar), se usa esa. Si no hay ninguna de las dos, cae en un
 * bucket explícito de "sin OC" — a propósito separado de "" para que se
 * pueda ver como grupo real en vez de mezclarse con todo lo demás.
 */
function ocKeyForDelivery(item) {
  const inv = state.invoices.find((i) => i.type === "client" && (i.deliveryIds || []).includes(item.id));
  if (inv && inv.ocNumber) return String(inv.ocNumber).trim();
  if (item.ocNumber) return String(item.ocNumber).trim();
  return "";
}

function ocLabelForDelivery(item) {
  const inv = state.invoices.find((i) => i.type === "client" && (i.deliveryIds || []).includes(item.id));
  if (inv && inv.ocNumber) return `OC ${inv.ocNumber} · Fact. ${inv.number}`;
  if (inv) return `Fact. ${inv.number} (sin N° de OC cargado)`;
  if (item.ocNumber) return `OC ${item.ocNumber} (anotada, sin facturar)`;
  return "Sin OC / sin facturar";
}

/** Periodo de un remito segun el ciclo de facturacion de SU cliente. Recibe el remito completo (no solo clientId+fecha) porque los clientes "po" necesitan saber a qué factura/OC pertenece. */
function periodKeyFor(item) {
  const client = byId(state.clients, item.clientId);
  if (!client) return item.date;
  if (client.billingCycle === "monthly") return item.date.slice(0, 7);
  if (client.billingCycle === "po") return ocKeyForDelivery(item) || "sin-oc";
  const weekStartDay = client.weekStartDay ?? 6;
  return String(weekNumberFor(item.date, weekStartDay));
}

function weekBoundsFor(dateText, weekStartDay) {
  const date = new Date(`${dateText}T12:00:00`);
  const diffToStart = (date.getDay() - weekStartDay + 7) % 7;
  const start = new Date(date);
  start.setDate(date.getDate() - diffToStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function fmtDDMM(d) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Fecha ISO ("2026-08-14") a dd/mm/yy ("14/08/26"), para la tabla de Remitos. */
function fmtDDMMYY(dateText) {
  if (!dateText) return "";
  const [y, m, d] = dateText.split("-");
  if (!y || !m || !d) return dateText;
  return `${d}/${m}/${y.slice(2)}`;
}

/**
 * Celda "Semana / Período" de la tabla de Remitos: para clientes semanales
 * se parte en 2 líneas (Semana + rango de fechas más chico) para que sea
 * legible en la columna angosta. Mensual/OC quedan en una sola línea como
 * siempre (periodLabelFor sigue usándose para esos casos y para el resto
 * de las pantallas que no piden este formato de 2 líneas).
 */
function periodCellHtml(item) {
  const client = byId(state.clients, item.clientId);
  if (!client) return "";
  if (client.billingCycle === "monthly") return escapeHtml(item.date.slice(0, 7));
  if (client.billingCycle === "po") return escapeHtml(ocLabelForDelivery(item));
  const weekStartDay = client.weekStartDay ?? 6;
  const weekNum = periodKeyFor(item);
  const { start, end } = weekBoundsFor(item.date, weekStartDay);
  return `Semana${escapeHtml(weekNum)}<br><span class="cell-sub">(${fmtDDMM(start)} - ${fmtDDMM(end)})</span>`;
}

function periodLabelFor(item) {
  const client = byId(state.clients, item.clientId);
  if (!client) return "";
  if (client.billingCycle === "monthly") return item.date.slice(0, 7);
  if (client.billingCycle === "po") return ocLabelForDelivery(item);
  const weekStartDay = client.weekStartDay ?? 6;
  const { start, end } = weekBoundsFor(item.date, weekStartDay);
  return `Semana ${periodKeyFor(item)} (${fmtDDMM(start)} - ${fmtDDMM(end)})`;
}

/** Version corta de periodLabelFor para columnas angostas (ej. el picker de remitos a facturar). */
function weekShortLabel(item) {
  const client = byId(state.clients, item.clientId);
  if (!client) return "";
  if (client.billingCycle === "monthly") return item.date.slice(0, 7);
  if (client.billingCycle === "po") {
    const key = ocKeyForDelivery(item);
    return key ? `OC ${key}` : "Sin OC";
  }
  return `Sem. ${periodKeyFor(item)}`;
}

function activeFilters() {
  return {
    month: $("#monthFilter").value,
    clientId: $("#clientFilter").value,
    providerId: $("#providerFilter").value,
    locationId: $("#locationFilter").value,
    week: $("#weekFilter").value
  };
}

function filteredDeliveries() {
  const f = activeFilters();
  return state.deliveries.filter((item) => {
    const inMonth = !f.month || item.date.startsWith(f.month);
    const inClient = !f.clientId || item.clientId === f.clientId;
    const inProvider = !f.providerId || item.providerId === f.providerId;
    const inLocation = !f.locationId || item.locationId === f.locationId;
    const inWeek = !f.week || normalizeWeekFilterText(periodKeyFor(item)) === normalizeWeekFilterText(f.week);
    return inMonth && inClient && inProvider && inLocation && inWeek;
  });
}

function latestRule(item) {
  const matches = state.priceRules
    .filter((ruleItem) =>
      ruleItem.clientId === item.clientId &&
      ruleItem.locationId === item.locationId &&
      ruleItem.providerId === item.providerId &&
      ruleItem.productId === item.productId &&
      ruleItem.validFrom <= item.date
    )
    .sort((a, b) => b.validFrom.localeCompare(a.validFrom));
  return matches[0];
}

/**
 * Devoluciones (producto que llegó en mal estado): en vez de una entidad
 * aparte, es un campo más del remito (billingMode) — así el remito sigue
 * siendo la única fuente de verdad, y todo lo que ya existía (Reportes,
 * Liquidez, Facturas) se ajusta solo con este único cambio acá, sin tener
 * que tocar cada reporte por separado:
 *  - NORMAL: como siempre.
 *  - DEVOLUCION_COBRA_CLIENTE: se le cobra igual al cliente (saleNet
 *    completo), pero nunca se le paga al proveedor (providerNet = 0) — esa
 *    plata queda como margen extra de Hojaldra.
 *  - DEVOLUCION_SIN_COBRO: no se le cobra a nadie ni se le paga a nadie —
 *    todo en $0. El remito queda igual en la tabla, para que no desaparezca
 *    del historial, pero no mueve un peso.
 */
/**
 * Alícuota de IVA con la que un proveedor le factura a Hojaldra (0.21 o
 * 0.105). Se lee de la ficha del proveedor (ivaRatePct); si no la tiene
 * cargada, o el remito no tiene proveedor, se asume 21% como siempre. Del
 * lado de VENTAS no se usa: a los clientes se les factura siempre con
 * IVA_RATE (21%).
 */
function providerIvaRate(providerId) {
  const provider = byId(state.providers, providerId);
  const pct = provider && provider.ivaRatePct != null ? Number(provider.ivaRatePct) : IVA_RATE * 100;
  return (Number.isFinite(pct) ? pct : IVA_RATE * 100) / 100;
}

function totalsFor(item) {
  const priceRule = latestRule(item);
  const quantity = Number(item.quantity) || 0;
  if (!priceRule) {
    return { saleNet: 0, providerNet: 0, profitNet: 0, ruleMissing: true };
  }
  const billingMode = item.billingMode || "NORMAL";
  if (billingMode === "DEVOLUCION_SIN_COBRO") {
    return { saleNet: 0, providerNet: 0, profitNet: 0, ruleMissing: false };
  }
  const saleNet = quantity * Number(priceRule.salePrice || 0);
  if (billingMode === "DEVOLUCION_COBRA_CLIENTE") {
    return { saleNet, providerNet: 0, profitNet: saleNet, ruleMissing: false };
  }
  // Si la regla tiene costo real guardado, el costo del remito es
  // cantidad × costo — exacto, sin pasar por ningún % (evita los centavos
  // de diferencia que aparecían al reconstruir el costo desde una comisión
  // redondeada, sobre todo con cantidades grandes). Si la regla es
  // genuinamente %-based (sin costo real conocido), se calcula como antes.
  const providerNet = priceRule.providerCost !== undefined
    ? quantity * Number(priceRule.providerCost)
    : saleNet * (1 - Number(priceRule.commissionPct || 0) / 100);
  return { saleNet, providerNet, profitNet: saleNet - providerNet, ruleMissing: false };
}

/** IDs de remito ya usados en una factura de CLIENTE (para no ofrecerlos dos veces ahí). */
function clientInvoicedDeliveryIds() {
  const set = new Set();
  state.invoices.forEach((inv) => {
    if (inv.type === "client") (inv.deliveryIds || []).forEach((id) => set.add(id));
  });
  return set;
}

/** IDs de remito ya usados en una factura de PROVEEDOR. */
function providerInvoicedDeliveryIds() {
  const set = new Set();
  state.invoices.forEach((inv) => {
    if (inv.type === "provider") (inv.deliveryIds || []).forEach((id) => set.add(id));
  });
  return set;
}

/**
 * IDs de remito cuya factura de cliente ya tiene la plata "en mano": hay
 * cheque(s) cargados en su OP que cubren el neto a abonar, sin importar si
 * todavía están RECIBIDO, ya ACREDITADO o ya ENDOSADO (los RECHAZADO no
 * cuentan, esos no son plata real). A diferencia de clientPaidDeliveryIds,
 * NO exige que el cheque ya esté resuelto — eso es una decisión posterior
 * (depositarlo o endosarlo) que no debería trabar el aviso al proveedor.
 * Es el gate que usa candidateDeliveries(mode="provider") para habilitar la
 * factura de proveedor y así poder endosarle un cheque recién recibido.
 */
function clientCollectedDeliveryIds() {
  const set = new Set();
  state.invoices.forEach((inv) => {
    if (inv.type !== "client") return;
    const op = clientInvoiceOP(inv.id);
    if (!op) return;
    const checks = opChecks(op).filter((c) => c.status !== "RECHAZADO");
    if (!checks.length) return;
    const total = round2(checks.reduce((sum, c) => sum + Number(c.monto || 0), 0));
    const closeEnough = Math.abs(total - opBreakdown(op).netoAAbonar) < 1;
    if (closeEnough) (inv.deliveryIds || []).forEach((id) => set.add(id));
  });
  return set;
}

/**
 * Estado de un remito puntual a lo largo de todo el circuito:
 * PENDIENTE -> FACTURADO (facturado al cliente, todavía no cobrado) ->
 * COBRADO (la sala ya pagó, esperando facturarle al proveedor) ->
 * PAGO (ya se le pagó al proveedor - circuito cerrado).
 *
 * SIN_COBRO es aparte: es terminal desde el minuto uno (una devolución que
 * no se le cobra a nadie nunca va a tener factura de ningún lado), así que
 * si no se lo sacara del flujo normal quedaría mostrando "PENDIENTE" para
 * siempre — dando la falsa idea de que todavía hay algo por facturar.
 */
function deliveryStatus(deliveryId) {
  const delivery = byId(state.deliveries, deliveryId);
  if ((delivery?.billingMode || "NORMAL") === "DEVOLUCION_SIN_COBRO") return "SIN_COBRO";
  const clientInv = state.invoices.find((i) => i.type === "client" && (i.deliveryIds || []).includes(deliveryId));
  const providerInv = state.invoices.find((i) => i.type === "provider" && (i.deliveryIds || []).includes(deliveryId));
  if (providerInv && providerInv.status === "PAGO") return "PAGO";
  if (providerInv) return "PROV_PENDIENTE";
  if (clientInv && clientInv.status === "PAGO") return "COBRADO";
  if (clientInv) return "FACTURADO";
  return "PENDIENTE";
}

/**
 * Candidatos a facturar. mode="client": remitos sin factura de cliente
 * todavía. mode="provider": remitos cuya factura de CLIENTE ya tiene el
 * cheque en mano (clientCollectedDeliveryIds — no hace falta que esté
 * resuelto todavía) y que todavía no tienen factura de proveedor.
 */
function candidateDeliveries({ clientId, locationId, providerId, mode }) {
  const excluded = mode === "provider" ? providerInvoicedDeliveryIds() : clientInvoicedDeliveryIds();
  const clientPaid = mode === "provider" ? clientCollectedDeliveryIds() : null;
  return state.deliveries
    .filter((item) => {
      const billingMode = item.billingMode || "NORMAL";
      // Sin cobro: no se ofrece nunca para facturar, ni a cliente ni a proveedor.
      if (billingMode === "DEVOLUCION_SIN_COBRO") return false;
      // Cobra cliente: se factura al cliente normal, pero JAMÁS se ofrece para pagarle al proveedor.
      if (mode === "provider" && billingMode === "DEVOLUCION_COBRA_CLIENTE") return false;
      if (excluded.has(item.id)) return false;
      if (mode === "provider" && !clientPaid.has(item.id)) return false;
      if (clientId !== undefined && clientId !== "" && item.clientId !== clientId) return false;
      if (locationId !== undefined && locationId !== "" && item.locationId !== locationId) return false;
      if (providerId !== undefined && providerId !== "" && item.providerId !== providerId) return false;
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

function renderOptions() {
  const selected = {
    clientFilter: $("#clientFilter").value,
    providerFilter: $("#providerFilter").value,
    locationFilter: $("#locationFilter").value
  };

  fillSelects("provider", sortByName(state.providers));
  fillSelects("client", sortByName(state.clients));
  fillSelects("product", sortByName(state.products));
  fillSelects("location", sortByName(state.locations.map((loc) => ({
    ...loc,
    name: `${loc.name} (${byId(state.clients, loc.clientId)?.name || ""})`
  }))));

  $("#clientFilter").innerHTML = `<option value="">Todos</option>${sortByName(state.clients).map(optionHtml).join("")}`;
  $("#providerFilter").innerHTML = `<option value="">Todos</option>${sortByName(state.providers).map(optionHtml).join("")}`;
  $("#clientFilter").value = selected.clientFilter;
  $("#providerFilter").value = selected.providerFilter;

  $("#locationFilter").innerHTML = `<option value="">Todas</option>${sortByName(state.locations.map((loc) => ({
    ...loc,
    name: `${loc.name} (${byId(state.clients, loc.clientId)?.name || ""})`
  }))).map(optionHtml).join("")}`;
  $("#locationFilter").value = selected.locationFilter;

  filterLocationSelectByClient($("#deliveryForm"));
  filterLocationSelectByClient($("#ruleForm"));
  filterLocationSelectByClient($("#clientInvoiceForm"));
  // La factura de proveedor sí permite dejar "Todas las salas" — hay
  // proveedores (como CP) que facturan consolidado, juntando remitos de
  // varias salas del mismo cliente en un solo comprobante.
  filterLocationSelectByClient($("#providerInvoiceForm"), "Todas las salas de este cliente");

  toggleOcVisibility($("#deliveryForm"));
  toggleOcVisibility($("#clientInvoiceForm"));
}

/** Cuando se elige un cliente en un formulario, la sala solo muestra las de ESE cliente. */
function filterLocationSelectByClient(form, blankLabel) {
  const clientSelect = form.elements.clientId;
  const locationSelect = form.elements.locationId;
  if (!clientSelect || !locationSelect) return;
  const clientId = clientSelect.value;
  const options = sortByName(state.locations.filter((loc) => !clientId || loc.clientId === clientId));
  const current = locationSelect.value;
  locationSelect.innerHTML = `<option value="">${escapeHtml(blankLabel || "Elegí...")}</option>` + options.map(optionHtml).join("");
  if (options.some((o) => o.id === current)) locationSelect.value = current;
}

function fillSelects(prefix, values) {
  const needsBlank = prefix === "client" || prefix === "location" || prefix === "provider";
  document.querySelectorAll(`select[name="${prefix}Id"]`).forEach((select) => {
    select.innerHTML = (needsBlank ? `<option value="">Elegí...</option>` : "") + values.map(optionHtml).join("");
  });
}

function optionHtml(item) {
  return `<option value="${item.id}">${escapeHtml(item.name)}</option>`;
}

/** Copia ordenada alfabéticamente por "name" (con acentos/ñ bien puestos), para poblar cualquier <select> del catálogo sin alterar el orden real de state.* en ningún otro lado. */
function sortByName(items) {
  return [...items].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "es", { sensitivity: "base" }));
}

function render() {
  syncClientInvoiceStatuses();
  renderOptions();
  renderDeliveries();
  renderRules();
  renderCatalogs();
  renderReports();
  renderInvoices();
  renderInvoicePickers();
  renderBalancePanel();
  renderProviderControlPanel();
  renderExpenses();
  renderMonthlyTable();
  renderIvaPosition();
  renderPagosTab();
  saveState();
}

// Estado del orden actual de la tabla de Remitos. Por defecto: Fecha
// ascendente (igual que el orden con el que ya se cargan/insertan).
let deliverySort = { key: "date", dir: "asc" };

function deliverySortValue(item, key) {
  const t = totalsFor(item);
  if (key === "date") return item.date || "";
  if (key === "period") return periodKeyFor(item) || "";
  if (key === "receiptNo") return item.receiptNo || "";
  if (key === "client") return byId(state.clients, item.clientId)?.name || "";
  if (key === "location") return byId(state.locations, item.locationId)?.name || "";
  if (key === "provider") return byId(state.providers, item.providerId)?.name || "";
  if (key === "product") return byId(state.products, item.productId)?.name || "";
  if (key === "quantity") return Number(item.quantity) || 0;
  if (key === "saleNet") return t.saleNet;
  if (key === "providerNet") return t.providerNet;
  if (key === "profitNet") return t.profitNet;
  if (key === "status") return deliveryStatusLabel(deliveryStatus(item.id));
  return "";
}

function renderDeliveries() {
  const rows = filteredDeliveries().sort((a, b) => {
    const va = deliverySortValue(a, deliverySort.key);
    const vb = deliverySortValue(b, deliverySort.key);
    const cmp = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb), undefined, { numeric: true });
    return deliverySort.dir === "asc" ? cmp : -cmp;
  });

  document.querySelectorAll("#deliveries th.sortable").forEach((th) => {
    th.classList.toggle("sort-active", th.dataset.sort === deliverySort.key);
    const arrow = th.dataset.sort === deliverySort.key ? (deliverySort.dir === "asc" ? "▲" : "▼") : "▲";
    th.innerHTML = `${th.textContent.replace(/[▲▼]/g, "").trim()} <span class="sort-arrow">${arrow}</span>`;
  });

  $("#deliveryRows").innerHTML = rows.length ? rows.map((item) => {
    const t = totalsFor(item);
    const clientObj = byId(state.clients, item.clientId);
    const client = clientObj?.name || "";
    const loc = byId(state.locations, item.locationId)?.name || "";
    const provider = byId(state.providers, item.providerId)?.name || "";
    const product = byId(state.products, item.productId)?.name || "";
    const status = deliveryStatus(item.id);
    const ocCell = clientObj?.billingCycle === "po"
      ? `<input type="text" value="${escapeHtml(item.ocNumber || "")}" placeholder="anotar OC" data-oc-delivery="${item.id}" class="ret-input" />`
      : `<span class="cell-sub">-</span>`;
    const noteIcon = item.note
      ? `<button type="button" class="note-icon" data-note="${escapeHtml(item.note)}" title="${escapeHtml(item.note)}">📝</button>`
      : "";
    const billingMode = item.billingMode || "NORMAL";
    const billingModeSelect = `<select class="ret-input" data-billing-mode-delivery="${item.id}" title="Tipo de remito">
        <option value="NORMAL"${billingMode === "NORMAL" ? " selected" : ""}>Normal</option>
        <option value="DEVOLUCION_COBRA_CLIENTE"${billingMode === "DEVOLUCION_COBRA_CLIENTE" ? " selected" : ""}>Dev. cobra cliente</option>
        <option value="DEVOLUCION_SIN_COBRO"${billingMode === "DEVOLUCION_SIN_COBRO" ? " selected" : ""}>Dev. sin cobro</option>
      </select>`;
    return `<tr>
      <td>${fmtDDMMYY(item.date)}</td>
      <td>${periodCellHtml(item)}</td>
      <td>${ocCell}</td>
      <td>${escapeHtml(item.receiptNo)}${noteIcon}</td>
      <td>${escapeHtml(client)}</td>
      <td>${escapeHtml(loc)}</td>
      <td>${escapeHtml(provider)}</td>
      <td>${escapeHtml(product)}${t.ruleMissing ? " *" : ""}</td>
      <td class="num">${Number(item.quantity).toLocaleString("es-AR")}</td>
      <td class="num">${money(t.saleNet)}</td>
      <td class="num">${money(t.providerNet)}</td>
      <td class="num">${money(t.profitNet)}</td>
      <td><span class="status ${status}">${deliveryStatusLabel(status)}</span>${billingModeSelect}</td>
      <td><button type="button" data-delete-delivery="${item.id}" title="Eliminar">Borrar</button></td>
    </tr>`;
  }).join("") : empty(14);

  const totals = rows.reduce((acc, item) => {
    const t = totalsFor(item);
    const provRate = providerIvaRate(item.providerId);
    acc.saleNet += t.saleNet;
    acc.providerNet += t.providerNet;
    acc.profitNet += t.profitNet;
    // c/IVA a pagar al proveedor, con la tasa de CADA proveedor
    acc.providerGross += t.providerNet * (1 + provRate);
    // IVA a ingresar = débito por ventas (21%) − crédito por compras (tasa del proveedor)
    acc.ivaDebt += t.saleNet * IVA_RATE - t.providerNet * provRate;
    return acc;
  }, { saleNet: 0, providerNet: 0, profitNet: 0, providerGross: 0, ivaDebt: 0 });

  $("#kpiRevenue").textContent = money(totals.saleNet * (1 + IVA_RATE));
  $("#kpiPayable").textContent = money(totals.providerGross);
  $("#kpiProfit").textContent = money(totals.profitNet);
  $("#kpiIva").textContent = money(totals.ivaDebt - retIvaForDeliveries(rows));
}

/**
 * Retenciones de IVA ya confirmadas (facturas de cliente PAGO) que tocan a
 * estos remitos, PRORRATEADAS. Si una factura junta remitos de más de un
 * período (ej. junio y julio en una sola factura), no restamos la
 * retención completa apenas aparezca un remito de esa factura — restamos
 * solo la porción de la retención que corresponde a la venta de ESTE
 * período, según qué parte del monto total de la factura cae en `rows`.
 * Evita restar de más (o duplicar la resta) al mirar distintos meses/semanas.
 */
function retIvaForDeliveries(rows) {
  const idsInView = new Set(rows.map((r) => r.id));
  const relevantInvoices = state.invoices.filter((inv) =>
    inv.type === "client" && inv.status === "PAGO" && (inv.deliveryIds || []).some((id) => idsInView.has(id))
  );
  return relevantInvoices.reduce((sum, inv) => {
    const invDeliveries = (inv.deliveryIds || []).map((id) => byId(state.deliveries, id)).filter(Boolean);
    const invTotalSale = invDeliveries.reduce((s, d) => s + totalsFor(d).saleNet, 0);
    if (invTotalSale <= 0) return sum;
    const inViewSale = invDeliveries
      .filter((d) => idsInView.has(d.id))
      .reduce((s, d) => s + totalsFor(d).saleNet, 0);
    const fraction = inViewSale / invTotalSale;
    return sum + invoiceRetentions(inv).retIva * fraction;
  }, 0);
}

// Estado del orden actual de la tabla de Precios. Por defecto: Cliente,
// despues Sala, despues Producto -- asi arranca ya agrupado de forma util.
let ruleSort = { key: "client", dir: "asc" };

function ruleSortValue(item, key) {
  if (key === "client") return byId(state.clients, item.clientId)?.name || "";
  if (key === "location") return byId(state.locations, item.locationId)?.name || "";
  if (key === "provider") return byId(state.providers, item.providerId)?.name || "";
  if (key === "product") return byId(state.products, item.productId)?.name || "";
  if (key === "salePrice") return Number(item.salePrice) || 0;
  if (key === "commissionPct") return Number(item.commissionPct) || 0;
  if (key === "cost") return item.providerCost !== undefined ? Number(item.providerCost) : item.salePrice * (1 - Number(item.commissionPct || 0) / 100);
  if (key === "validFrom") return item.validFrom || "";
  return "";
}

/** Filtros de la tabla de Precios: Sala y Producto, combinables entre sí. */
function filteredRules() {
  const locationId = $("#ruleLocationFilter").value;
  const productId = $("#ruleProductFilter").value;
  return state.priceRules.filter((item) => {
    if (locationId && item.locationId !== locationId) return false;
    if (productId && item.productId !== productId) return false;
    return true;
  });
}

function renderRules() {
  const prevLocation = $("#ruleLocationFilter").value;
  const sortedLocationsForFilter = sortByName(state.locations.map((loc) => ({
    ...loc,
    name: `${loc.name} (${byId(state.clients, loc.clientId)?.name || ""})`
  })));
  $("#ruleLocationFilter").innerHTML = `<option value="">Todas</option>` + sortedLocationsForFilter.map(optionHtml).join("");
  if (state.locations.some((l) => l.id === prevLocation)) $("#ruleLocationFilter").value = prevLocation;

  const prevProduct = $("#ruleProductFilter").value;
  $("#ruleProductFilter").innerHTML = `<option value="">Todos</option>${sortByName(state.products).map(optionHtml).join("")}`;
  if (state.products.some((p) => p.id === prevProduct)) $("#ruleProductFilter").value = prevProduct;

  const sorted = filteredRules().sort((a, b) => {
    const va = ruleSortValue(a, ruleSort.key);
    const vb = ruleSortValue(b, ruleSort.key);
    const cmp = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb));
    return ruleSort.dir === "asc" ? cmp : -cmp;
  });

  document.querySelectorAll("#rules th.sortable").forEach((th) => {
    th.classList.toggle("sort-active", th.dataset.sort === ruleSort.key);
    const arrow = th.dataset.sort === ruleSort.key ? (ruleSort.dir === "asc" ? "▲" : "▼") : "▲";
    th.innerHTML = `${th.textContent.replace(/[▲▼]/g, "").trim()} <span class="sort-arrow">${arrow}</span>`;
  });

  $("#ruleRows").innerHTML = sorted.map((item) => {
    const client = byId(state.clients, item.clientId)?.name || "";
    const loc = byId(state.locations, item.locationId)?.name || "";
    const provider = byId(state.providers, item.providerId)?.name || "";
    const product = byId(state.products, item.productId)?.name || "";
    return `<tr>
      <td>${escapeHtml(client)}</td>
      <td>${escapeHtml(loc)}</td>
      <td>${escapeHtml(provider)}</td>
      <td>${escapeHtml(product)}</td>
      <td class="num">${money(item.salePrice)}</td>
      <td class="num">${Number(item.commissionPct || 0).toFixed(2)}%</td>
      <td class="num">${money(item.providerCost !== undefined ? Number(item.providerCost) : item.salePrice * (1 - Number(item.commissionPct || 0) / 100))}</td>
      <td>${item.validFrom}</td>
      <td><button type="button" data-delete-rule="${item.id}" title="Eliminar">Borrar</button></td>
    </tr>`;
  }).join("");
}

document.querySelectorAll("#deliveries th.sortable").forEach((th) => {
  th.addEventListener("click", () => {
    if (deliverySort.key === th.dataset.sort) {
      deliverySort.dir = deliverySort.dir === "asc" ? "desc" : "asc";
    } else {
      deliverySort = { key: th.dataset.sort, dir: "asc" };
    }
    renderDeliveries();
  });
});

/** Ícono de nota en Remitos: click muestra el texto completo (el hover ya lo muestra vía title). */
document.body.addEventListener("click", (event) => {
  const noteBtn = event.target.closest(".note-icon");
  if (!noteBtn) return;
  alert(noteBtn.dataset.note);
});

document.querySelectorAll("#rules th.sortable").forEach((th) => {
  th.addEventListener("click", () => {
    if (ruleSort.key === th.dataset.sort) {
      ruleSort.dir = ruleSort.dir === "asc" ? "desc" : "asc";
    } else {
      ruleSort = { key: th.dataset.sort, dir: "asc" };
    }
    renderRules();
  });
});

function renderCatalogs() {
  $("#providerList").innerHTML = state.providers.map((item) =>
    `<li><span>${escapeHtml(item.name)}${item.ivaRatePct != null && Number(item.ivaRatePct) !== 21 ? ` - IVA ${String(item.ivaRatePct).replace(".", ",")}%` : ""}</span><span><button type="button" class="edit-btn" data-edit-provider="${item.id}">Editar</button> <button type="button" class="edit-btn danger" data-delete-provider="${item.id}">Borrar</button></span></li>`
  ).join("");
  $("#clientList").innerHTML = state.clients.map((item) =>
    `<li><span>${escapeHtml(item.name)} - ${cycleLabel(item.billingCycle)}${item.billingCycle === "weekly" ? ` (arranca ${dayLabel(item.weekStartDay)})` : ""}</span><span><button type="button" class="edit-btn" data-edit-client="${item.id}">Editar</button> <button type="button" class="edit-btn danger" data-delete-client="${item.id}">Borrar</button></span></li>`
  ).join("");
  $("#locationList").innerHTML = state.locations.map((item) =>
    `<li><span>${escapeHtml(item.name)} - ${escapeHtml(byId(state.clients, item.clientId)?.name || "")}</span><span><button type="button" class="edit-btn" data-edit-location="${item.id}">Editar</button> <button type="button" class="edit-btn danger" data-delete-location="${item.id}">Borrar</button></span></li>`
  ).join("");
  $("#productList").innerHTML = state.products.map((item) =>
    `<li><span>${escapeHtml(item.name)} - ${escapeHtml(item.unit)}</span><span><button type="button" class="edit-btn" data-edit-product="${item.id}">Editar</button> <button type="button" class="edit-btn danger" data-delete-product="${item.id}">Borrar</button></span></li>`
  ).join("");
}

/**
 * Chequea si un registro de catálogo todavía está referenciado en algún
 * lado antes de dejarlo borrar. Devuelve un array de strings con lo que
 * lo está bloqueando (vacío = se puede borrar tranquilo).
 */
function catalogReferences(type, id) {
  const blockers = [];
  const count = (arr, label) => { if (arr.length) blockers.push(`${arr.length} ${label}`); };

  if (type === "client") {
    count(state.locations.filter((l) => l.clientId === id), "sala(s)");
    count(state.deliveries.filter((d) => d.clientId === id), "remito(s)");
    count(state.priceRules.filter((r) => r.clientId === id), "regla(s) de precio");
    count(state.invoices.filter((i) => i.clientId === id), "factura(s)");
  }
  if (type === "provider") {
    count(state.deliveries.filter((d) => d.providerId === id), "remito(s)");
    count(state.priceRules.filter((r) => r.providerId === id), "regla(s) de precio");
    count(state.invoices.filter((i) => i.type === "provider" && i.providerId === id), "factura(s)");
  }
  if (type === "location") {
    count(state.deliveries.filter((d) => d.locationId === id), "remito(s)");
    count(state.priceRules.filter((r) => r.locationId === id), "regla(s) de precio");
    count(state.invoices.filter((i) => i.locationId === id), "factura(s)");
  }
  if (type === "product") {
    count(state.deliveries.filter((d) => d.productId === id), "remito(s)");
    count(state.priceRules.filter((r) => r.productId === id), "regla(s) de precio");
  }
  return blockers;
}

function tryDeleteCatalogItem(type, id, collectionName, label) {
  const blockers = catalogReferences(type, id);
  if (blockers.length) {
    alert(`No se puede borrar "${label}" — todavía está referenciado por: ${blockers.join(", ")}.\n\nPrimero corregí o borrá esas referencias (por ejemplo, reasigná esas salas/remitos/reglas a otro cliente) y volvé a intentar.`);
    return;
  }
  if (!confirm(`¿Borrar "${label}" definitivamente? No tiene nada vinculado, así que es seguro.`)) return;
  state[collectionName] = state[collectionName].filter((item) => item.id !== id);
  render();
}

function deliveryStatusLabel(status) {
  return ({ PENDIENTE: "PENDIENTE", FACTURADO: "FACTURADO", COBRADO: "COBRADO", PROV_PENDIENTE: "PROV. PENDIENTE", PAGO: "PAGO", SIN_COBRO: "SIN COBRO" })[status] || status;
}

/** Etiqueta corta del tipo de remito, para el selector inline de la tabla y el form de carga. */
function billingModeLabel(mode) {
  return ({
    NORMAL: "Normal",
    DEVOLUCION_COBRA_CLIENTE: "Devolución — cobra cliente",
    DEVOLUCION_SIN_COBRO: "Devolución — sin cobro"
  })[mode] || "Normal";
}

function dayLabel(day) {
  return ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"][day] || "sabado";
}

function renderReports() {
  // Las devoluciones "sin cobro" no se le facturan a nadie — no tiene sentido
  // que aparezcan acá como "pendiente de cobro/pago" ni sumen a nada. Las
  // "cobra cliente" SÍ quedan (se le cobra al cliente normal, solo cambia
  // del lado del proveedor, y eso ya lo resuelve totalsFor con providerNet=0).
  const rows = filteredDeliveries().filter((item) => (item.billingMode || "NORMAL") !== "DEVOLUCION_SIN_COBRO");
  renderSalaWeekRows(rows);
  $("#reportGridFilterLabel").textContent = "Mostrando: " + activeFiltersLabel();
  renderReceivables(rows);
  renderProviderPayables(rows);
  renderGroup("#profitRows", rows, (item) => byId(state.locations, item.locationId)?.name || "", (t) => t.profitNet);
}

/**
 * "Pendiente de cobro" = remitos cuyo estado todavía es PENDIENTE o
 * FACTURADO (la sala todavía no pagó). Una vez que pasa a COBRADO,
 * PROV_PENDIENTE o PAGO, el cliente ya pagó su factura.
 */
function renderReceivables(rows) {
  const map = new Map();
  rows.forEach((item) => {
    const clientName = byId(state.clients, item.clientId)?.name || "";
    const current = map.get(item.clientId) || { name: clientName, total: 0, pending: 0 };
    const gross = totalsFor(item).saleNet * (1 + IVA_RATE);
    current.total += gross;
    const status = deliveryStatus(item.id);
    if (status === "PENDIENTE" || status === "FACTURADO") current.pending += gross;
    map.set(item.clientId, current);
  });
  const grouped = [...map.values()].sort((a, b) => b.total - a.total);
  const total = grouped.reduce((sum, item) => sum + item.total, 0);
  const totalPending = grouped.reduce((sum, item) => sum + item.pending, 0);
  $("#receivableRows").innerHTML = grouped.length
    ? `<tr><th>Cliente</th><th class="num">Devengado total</th><th class="num">Pendiente de cobro</th></tr>
      ${grouped.map((item) => `<tr><td>${escapeHtml(item.name)}</td><td class="num">${money(item.total)}</td><td class="num">${money(item.pending)}</td></tr>`).join("")}
      <tr><th>Total clientes</th><th class="num">${money(total)}</th><th class="num">${money(totalPending)}</th></tr>`
    : `<tr><td class="empty">Sin datos.</td></tr>`;
}

/** Texto legible de qué filtros del toolbar de arriba están afectando estos 3 resúmenes. */
function activeFiltersLabel() {
  const f = activeFilters();
  const parts = [];
  parts.push(f.month ? `mes ${f.month}` : "todos los meses (acumulado)");
  if (f.clientId) parts.push(`cliente ${byId(state.clients, f.clientId)?.name || f.clientId}`);
  if (f.providerId) parts.push(`proveedor ${byId(state.providers, f.providerId)?.name || f.providerId}`);
  if (f.week) parts.push(`semana/OC ${f.week}`);
  return parts.join(" · ") + " (cambiá los filtros de arriba de todo para ver otro período)";
}

/**
 * El reporte central: una fila por sala/periodo con la factura al cliente
 * y la factura al proveedor lado a lado, remitos incluidos, y un estado
 * que te dice exactamente qué reclamar. Replica la planilla real de
 * "Cobros y pagos" pero calculado solo desde los remitos cargados.
 */
function renderSalaWeekRows(rows) {
  const map = new Map();
  rows.forEach((item) => {
    const client = byId(state.clients, item.clientId)?.name || "";
    const location = byId(state.locations, item.locationId)?.name || "";
    const period = periodLabelFor(item);
    const key = `${item.clientId}|${item.locationId}|${periodKeyFor(item)}`;
    const current = map.get(key) || { client, location, period, sortKey: `${client}|${location}|${item.date}`, deliveryIds: [] };
    current.deliveryIds.push(item.id);
    map.set(key, current);
  });

  const grouped = [...map.values()].sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  $("#salaWeekRows").innerHTML = grouped.length ? `<tr>
      <th>Cliente</th><th>Sala</th><th>Periodo</th>
      <th>Factura Hojaldra</th><th>Factura proveedor</th><th>Estado / reclamo</th>
    </tr>${grouped.map(rowForSalaWeek).join("")}`
    : `<tr><td class="empty">Sin datos.</td></tr>`;
}

function rowForSalaWeek(group) {
  const ids = group.deliveryIds;
  const deliveries = ids.map((id) => byId(state.deliveries, id)).filter(Boolean);
  const remitos = [...new Set(deliveries.map((d) => d.receiptNo))].join(", ");

  // OJO: antes usaba .find() y solo agarraba la PRIMERA factura que tocara
  // este grupo. Si dos remitos del mismo cliente/sala/semana terminaban en
  // DOS facturas distintas, la segunda desaparecía del reporte sin avisar.
  // Ahora se listan todas.
  const clientInvoices = state.invoices.filter((inv) => inv.type === "client" && ids.some((id) => (inv.deliveryIds || []).includes(id)));
  const providerInvoices = state.invoices.filter((inv) => inv.type === "provider" && ids.some((id) => (inv.deliveryIds || []).includes(id)));

  const invoicedDeliveryIds = new Set(clientInvoices.flatMap((inv) => inv.deliveryIds || []));
  const sinFacturar = ids.filter((id) => !invoicedDeliveryIds.has(id)).length;

  const clientCell = clientInvoices.length
    ? clientInvoices.map((inv) =>
        `${escapeHtml(inv.number)}<br><span class="cell-sub">${money(inv.amountGross)}${inv.paymentDate ? ` · pagado ${fmtDDMMYY(inv.paymentDate)}` : " · sin cobrar"}</span>`
      ).join("<hr class=\"cell-sep\">") + (sinFacturar ? `<br><span class="cell-sub">+ ${sinFacturar} remito(s) sin facturar todavía</span>` : "")
    : `<span class="cell-sub">sin facturar</span>`;

  const providerCell = providerInvoices.length
    ? providerInvoices.map((inv) =>
        `${escapeHtml(inv.number)}<br><span class="cell-sub">${money(inv.amountGross)}${inv.paymentDate ? ` · pagado ${fmtDDMMYY(inv.paymentDate)}` : " · sin pagar"}</span>`
      ).join("<hr class=\"cell-sep\">")
    : `<span class="cell-sub">-</span>`;

  const allClientPaid = clientInvoices.length > 0 && sinFacturar === 0 && clientInvoices.every((inv) => inv.status === "PAGO");
  const anyProviderPending = providerInvoices.some((inv) => inv.status !== "PAGO");

  let estado = "";
  if (!clientInvoices.length) estado = `<span class="status RECLAMAR">FALTA FACTURAR A LA SALA</span>`;
  else if (sinFacturar > 0) estado = `<span class="status RECLAMAR">FALTAN REMITOS POR FACTURAR</span>`;
  else if (!allClientPaid) estado = `<span class="status PENDIENTE">ESPERANDO COBRO</span>`;
  else if (!providerInvoices.length) estado = `<span class="status RECLAMAR">⚠ RECLAMAR FACTURA AL PROVEEDOR</span>`;
  else if (anyProviderPending) estado = `<span class="status PROV_PENDIENTE">FALTA PAGAR AL PROVEEDOR</span>`;
  else estado = `<span class="status PAGO">CERRADO</span>`;

  return `<tr>
    <td>${escapeHtml(group.client)}</td>
    <td>${escapeHtml(group.location)}</td>
    <td>${escapeHtml(group.period)}<br><span class="cell-sub">Remitos: ${escapeHtml(remitos)}</span></td>
    <td>${clientCell}</td>
    <td>${providerCell}</td>
    <td>${estado}</td>
  </tr>`;
}

/**
 * Panel "Balance semanal de entregas": elegís Cliente + Sala + Semana y
 * ves el desglose por producto — exactamente lo que se le manda al
 * cliente junto con la factura. Es de solo lectura, no crea nada.
 */
function renderBalancePanel() {
  const clientSelect = $("#balanceClientId");
  const locationSelect = $("#balanceLocationId");
  const periodSelect = $("#balancePeriod");

  const prevClient = clientSelect.value;
  clientSelect.innerHTML = `<option value="">Elegí...</option>` + sortByName(state.clients).map(optionHtml).join("");
  if (state.clients.some((c) => c.id === prevClient)) clientSelect.value = prevClient;
  const clientId = clientSelect.value;

  const prevLocation = locationSelect.value;
  const locations = sortByName(state.locations.filter((loc) => !clientId || loc.clientId === clientId));
  locationSelect.innerHTML = `<option value="">Elegí...</option>` + locations.map(optionHtml).join("");
  if (locations.some((l) => l.id === prevLocation)) locationSelect.value = prevLocation;
  const locationId = locationSelect.value;

  const prevPeriod = periodSelect.value;
  let periods = [];
  if (clientId && locationId) {
    const seen = new Map();
    state.deliveries
      .filter((d) => d.clientId === clientId && d.locationId === locationId)
      .forEach((d) => {
        const key = periodKeyFor(d);
        if (!seen.has(key)) seen.set(key, periodLabelFor(d));
      });
    periods = [...seen.entries()].sort((a, b) => b[0].localeCompare(a[0], undefined, { numeric: true }));
  }
  periodSelect.innerHTML = `<option value="">Elegí...</option>` + periods.map(([key, label]) => `<option value="${escapeHtml(key)}">${escapeHtml(label)}</option>`).join("");
  if (periods.some(([key]) => key === prevPeriod)) periodSelect.value = prevPeriod;
  const period = periodSelect.value;

  if (!clientId || !locationId || !period) {
    $("#balanceRows").innerHTML = `<tr><td class="empty">Elegí cliente, sala y semana para ver el detalle.</td></tr>`;
    return;
  }

  const groupDeliveries = state.deliveries.filter((d) =>
    d.clientId === clientId && d.locationId === locationId && periodKeyFor(d) === period
    // Sin cobro: nunca se le manda al cliente, ni siquiera para que vea el
    // motivo — no forma parte de lo que se le está facturando.
    && (d.billingMode || "NORMAL") !== "DEVOLUCION_SIN_COBRO"
  );

  const byProduct = new Map();
  groupDeliveries.forEach((d) => {
    const t = totalsFor(d);
    const current = byProduct.get(d.productId) || { qty: 0, saleNet: 0, remitos: new Set(), ids: [] };
    current.qty += Number(d.quantity || 0);
    current.saleNet += t.saleNet;
    current.remitos.add(d.receiptNo);
    current.ids.push(d.id);
    byProduct.set(d.productId, current);
  });

  const allIds = groupDeliveries.map((d) => d.id);
  // OJO: iba con .find() y solo agarraba la PRIMERA factura de cliente que
  // tocara este grupo — si el grupo terminó repartido en dos facturas, la
  // segunda desaparecía y encima el N° de la primera se mostraba mal
  // pegado a filas que en realidad pertenecen a la otra. Con .filter() se
  // buscan TODAS las que tocan el grupo, y por cada fila de producto se
  // muestran las que realmente cubren ESOS remitos puntuales.
  const clientInvoices = state.invoices.filter((inv) => inv.type === "client" && allIds.some((id) => (inv.deliveryIds || []).includes(id)));

  const rows = [...byProduct.entries()].map(([productId, data]) => {
    const productName = byId(state.products, productId)?.name || "";
    const invoiceNumbers = clientInvoices
      .filter((inv) => data.ids.some((id) => (inv.deliveryIds || []).includes(id)))
      .map((inv) => inv.number);
    return { productName, invoiceNumbers, ...data };
  }).sort((a, b) => a.productName.localeCompare(b.productName));

  const totalQty = rows.reduce((s, r) => s + r.qty, 0);
  const totalSale = rows.reduce((s, r) => s + r.saleNet, 0);

  $("#balanceRows").innerHTML = `<tr>
      <th>Producto</th><th class="num">Cantidad Total</th><th class="num">$ s/iva</th><th class="num">$ c/iva</th><th>N° Remitos</th><th>N° Factura</th>
    </tr>
    ${rows.map((r) => `<tr>
      <td>${escapeHtml(r.productName)}</td>
      <td class="num">${r.qty.toLocaleString("es-AR")}</td>
      <td class="num">${money(r.saleNet)}</td>
      <td class="num">${money(r.saleNet * (1 + IVA_RATE))}</td>
      <td>${escapeHtml([...r.remitos].join(", "))}</td>
      <td>${r.invoiceNumbers.length ? escapeHtml(r.invoiceNumbers.join(", ")) : `<span class="cell-sub">sin facturar</span>`}</td>
    </tr>`).join("")}
    <tr><th>TOTAL</th><th class="num">${totalQty.toLocaleString("es-AR")}</th><th class="num">${money(totalSale)}</th><th class="num">${money(totalSale * (1 + IVA_RATE))}</th><th></th><th></th></tr>`;
}

/**
 * Panel "Control de entregas por proveedor": elegís Proveedor + Cliente
 * (+ Sala opcional) + Semana/OC y ves cuánto entregó ese proveedor por
 * producto, para cotejarlo con el proveedor ANTES de que te facture. Es de
 * solo lectura y NO muestra precios de venta (no es lo que se le manda al
 * cliente). Excluye los mismos remitos que candidateDeliveries excluye para
 * facturar a proveedor: devoluciones sin cobro y las que cobra el cliente.
 * Incluye remitos ya facturados por el proveedor (muestra el N° de factura).
 */
function renderProviderControlPanel() {
  const providerSelect = $("#pcProviderId");
  const clientSelect = $("#pcClientId");
  const locationSelect = $("#pcLocationId");
  const periodSelect = $("#pcPeriod");

  const prevProvider = providerSelect.value;
  providerSelect.innerHTML = `<option value="">Elegí...</option>` + sortByName(state.providers).map(optionHtml).join("");
  if (state.providers.some((p) => p.id === prevProvider)) providerSelect.value = prevProvider;
  const providerId = providerSelect.value;

  const prevClient = clientSelect.value;
  clientSelect.innerHTML = `<option value="">Elegí...</option>` + sortByName(state.clients).map(optionHtml).join("");
  if (state.clients.some((c) => c.id === prevClient)) clientSelect.value = prevClient;
  const clientId = clientSelect.value;

  const prevLocation = locationSelect.value;
  const locations = sortByName(state.locations.filter((loc) => !clientId || loc.clientId === clientId));
  locationSelect.innerHTML = `<option value="">Todas las salas</option>` + locations.map(optionHtml).join("");
  if (locations.some((l) => l.id === prevLocation)) locationSelect.value = prevLocation;
  const locationId = locationSelect.value;

  const countsForProvider = (d) => {
    const mode = d.billingMode || "NORMAL";
    return mode !== "DEVOLUCION_SIN_COBRO" && mode !== "DEVOLUCION_COBRA_CLIENTE";
  };

  const prevPeriod = periodSelect.value;
  let periods = [];
  if (providerId && clientId) {
    const seen = new Map();
    state.deliveries
      .filter((d) => d.providerId === providerId && d.clientId === clientId && (!locationId || d.locationId === locationId) && countsForProvider(d))
      .forEach((d) => {
        const key = periodKeyFor(d);
        if (!seen.has(key)) seen.set(key, periodLabelFor(d));
      });
    periods = [...seen.entries()].sort((a, b) => b[0].localeCompare(a[0], undefined, { numeric: true }));
  }
  periodSelect.innerHTML = `<option value="">Elegí...</option>` + periods.map(([key, label]) => `<option value="${escapeHtml(key)}">${escapeHtml(label)}</option>`).join("");
  if (periods.some(([key]) => key === prevPeriod)) periodSelect.value = prevPeriod;
  const period = periodSelect.value;

  const rowsEl = $("#providerControlRows");
  if (!providerId || !clientId || !period) {
    rowsEl.innerHTML = `<tr><td class="empty">Elegí proveedor, cliente y semana para ver lo que entregó.</td></tr>`;
    return;
  }

  const group = state.deliveries.filter((d) =>
    d.providerId === providerId && d.clientId === clientId
    && (!locationId || d.locationId === locationId)
    && periodKeyFor(d) === period
    && countsForProvider(d)
  );

  const salaIds = [...new Set(group.map((d) => d.locationId))]
    .sort((a, b) => (byId(state.locations, a)?.name || "").localeCompare(byId(state.locations, b)?.name || ""));
  const showSalas = !locationId && salaIds.length > 1;

  const byProduct = new Map();
  group.forEach((d) => {
    const current = byProduct.get(d.productId) || { qty: 0, bySala: new Map(), remitos: new Set(), ids: [] };
    const qty = Number(d.quantity || 0);
    current.qty += qty;
    current.bySala.set(d.locationId, (current.bySala.get(d.locationId) || 0) + qty);
    if (d.receiptNo) current.remitos.add(d.receiptNo);
    current.ids.push(d.id);
    byProduct.set(d.productId, current);
  });

  const providerInvoices = state.invoices.filter((inv) =>
    inv.type === "provider" && (inv.deliveryIds || []).some((id) => group.some((d) => d.id === id))
  );

  const rows = [...byProduct.entries()].map(([productId, data]) => {
    const productName = byId(state.products, productId)?.name || "";
    const invoiceNumbers = providerInvoices
      .filter((inv) => data.ids.some((id) => (inv.deliveryIds || []).includes(id)))
      .map((inv) => inv.number);
    return { productName, invoiceNumbers, ...data };
  }).sort((a, b) => a.productName.localeCompare(b.productName));

  const fmtQty = (n) => Number(n).toLocaleString("es-AR");
  const totalQty = rows.reduce((s, r) => s + r.qty, 0);
  const salaTotals = salaIds.map((id) => rows.reduce((s, r) => s + (r.bySala.get(id) || 0), 0));
  const salaHeaders = showSalas ? salaIds.map((id) => `<th class="num">${escapeHtml(byId(state.locations, id)?.name || "")}</th>`).join("") : "";

  rowsEl.innerHTML = `<tr>
      <th>Producto</th>${salaHeaders}<th class="num">Cantidad total</th><th>N° Remitos</th><th>N° Factura proveedor</th>
    </tr>
    ${rows.map((r) => `<tr>
      <td>${escapeHtml(r.productName)}</td>
      ${showSalas ? salaIds.map((id) => `<td class="num">${r.bySala.get(id) ? fmtQty(r.bySala.get(id)) : "-"}</td>`).join("") : ""}
      <td class="num">${fmtQty(r.qty)}</td>
      <td>${escapeHtml([...r.remitos].join(", "))}</td>
      <td>${r.invoiceNumbers.length ? escapeHtml(r.invoiceNumbers.join(", ")) : `<span class="cell-sub">sin facturar</span>`}</td>
    </tr>`).join("")}
    <tr><th>TOTAL</th>${showSalas ? salaTotals.map((t) => `<th class="num">${fmtQty(t)}</th>`).join("") : ""}<th class="num">${fmtQty(totalQty)}</th><th></th><th></th></tr>`;
}

["#pcProviderId", "#pcClientId", "#pcLocationId", "#pcPeriod"].forEach((selector) => {
  $(selector).addEventListener("change", renderProviderControlPanel);
});

["#balanceClientId", "#balanceLocationId", "#balancePeriod"].forEach((selector) => {
  $(selector).addEventListener("change", renderBalancePanel);
});

// ============ Pestaña Pagos (Ordenes de pago + cheques) ============

// Cheques todavía no guardados, mientras se arma una OP nueva. Se resetea
// después de guardar o al cambiar de cliente.
let opDraftChecks = [];

function opSelectedInvoiceIds() {
  return [...document.querySelectorAll("#opInvoicePicker .op-invoice-check:checked")].map((el) => el.dataset.invoiceId);
}

function renderOpClientSelect() {
  const select = $("#opClientId");
  const prev = select.value;
  select.innerHTML = `<option value="">Elegí...</option>` + sortByName(state.clients).map(optionHtml).join("");
  if (state.clients.some((c) => c.id === prev)) select.value = prev;
}

/**
 * Semana u OC a la que corresponde una factura de cliente, sacada de los
 * remitos que cubre (NO de la fecha de emisión, que puede ser posterior).
 * Semanal: "Sem. 32" o "Sem. 30–32" (rango si son consecutivas, lista si no).
 * OC: "OC 1234" o "Sin OC". Mensual: el mes. Sin remitos: "-".
 */
function invoicePeriodLabel(inv) {
  const items = (inv.deliveryIds || []).map((id) => byId(state.deliveries, id)).filter(Boolean);
  if (!items.length) return "-";
  const client = byId(state.clients, inv.clientId) || byId(state.clients, items[0].clientId);
  if (client?.billingCycle === "po") {
    const oc = String(inv.ocNumber || "").trim() || ocKeyForDelivery(items[0]);
    return oc ? `OC ${oc}` : "Sin OC";
  }
  if (client?.billingCycle === "monthly") {
    return [...new Set(items.map((d) => d.date.slice(0, 7)))].sort().join(", ");
  }
  const weeks = [...new Set(items.map((d) => Number(periodKeyFor(d))))].sort((a, b) => a - b);
  if (weeks.length === 1) return `Sem. ${weeks[0]}`;
  const consecutive = weeks.every((w, i) => i === 0 || w === weeks[i - 1] + 1);
  return consecutive ? `Sem. ${weeks[0]}–${weeks[weeks.length - 1]}` : `Sem. ${weeks.join(", ")}`;
}

/** Detalle para el tooltip de la columna Sem./OC (rango de fechas de cada período). */
function invoicePeriodTitle(inv) {
  const items = (inv.deliveryIds || []).map((id) => byId(state.deliveries, id)).filter(Boolean);
  return [...new Set(items.map((d) => periodLabelFor(d)))].join(" | ");
}

function renderOpInvoicePicker() {
  const clientId = $("#opClientId").value;
  const container = $("#opInvoicePicker");
  if (!clientId) {
    container.innerHTML = `<p class="picker-empty">Elegí un cliente para ver sus facturas pendientes de cobro.</p>`;
    renderOpBreakdown();
    return;
  }
  const candidates = pendingClientInvoicesForOP(clientId);
  if (!candidates.length) {
    container.innerHTML = `<p class="picker-empty">Este cliente no tiene facturas pendientes de cobro (o ya están todas en alguna OP).</p>`;
    renderOpBreakdown();
    return;
  }
  container.innerHTML = `<table class="picker-table">
    <thead><tr><th></th><th>Sala</th><th>N Factura</th><th>Sem. / OC</th><th>Emisión</th><th class="num">Total c/IVA</th></tr></thead>
    <tbody>
      ${candidates.map((inv) => {
        const loc = byId(state.locations, inv.locationId)?.name || "";
        return `<tr>
          <td><input type="checkbox" class="op-invoice-check" data-invoice-id="${inv.id}" /></td>
          <td>${escapeHtml(loc)}</td>
          <td>${escapeHtml(inv.number)}</td>
          <td title="${escapeHtml(invoicePeriodTitle(inv))}">${escapeHtml(invoicePeriodLabel(inv))}</td>
          <td>${fmtDDMMYY(inv.issueDate)}</td>
          <td class="num">${money(inv.amountGross)}</td>
        </tr>`;
      }).join("")}
    </tbody>
  </table>`;
  container.querySelectorAll(".op-invoice-check").forEach((el) => el.addEventListener("change", renderOpBreakdown));
  renderOpBreakdown();
}

/**
 * Desglose "en vivo" de la OP que se está armando. Retención IVA y Ganancias
 * se leen directo de los inputs $ (#opRetIva / #opRetGanancias) — no hay
 * cálculo automático a partir de ningún %, porque el % nunca representa
 * exactamente lo que el cliente termina reteniendo (varía de OP a OP). Se
 * carga a mano el monto real del comprobante; si esa OP no tiene esa
 * retención, se deja en 0.
 */
function draftOpBreakdown() {
  const invoiceIds = opSelectedInvoiceIds();
  const totalGross = round2(invoiceIds.reduce((sum, id) => sum + Number(byId(state.invoices, id)?.amountGross || 0), 0));
  const retIva = round2(Number($("#opRetIva")?.value || 0));
  const retGanancias = round2(Number($("#opRetGanancias")?.value || 0));
  const retIIBB = round2(Number($("#opRetIIBB")?.value || 0));
  const netoAAbonar = round2(totalGross - retIva - retGanancias - retIIBB);
  return { totalGross, retIva, retGanancias, retIIBB, netoAAbonar };
}

function renderOpBreakdown() {
  const b = draftOpBreakdown();
  $("#opBreakdown").innerHTML = `<div class="table-wrap small" style="max-height:none">
    <table class="breakdown-table">
      <tbody>
        <tr><td>1. Total facturas tildadas (c/IVA)</td><td class="num">${money(b.totalGross)}</td></tr>
        <tr><td>2. Retención IVA</td><td class="num">−${money(b.retIva)}</td></tr>
        <tr><td>3. Retención Ganancias</td><td class="num">−${money(b.retGanancias)}</td></tr>
        <tr><td>4. Retención IIBB</td><td class="num">−${money(b.retIIBB)}</td></tr>
        <tr class="total"><td>5. Neto a abonar</td><td class="num">${money(b.netoAAbonar)}</td></tr>
      </tbody>
    </table>
  </div>`;
  renderOpChequeSummary();
}

function renderOpChequeRows() {
  const metodo = $("#opMetodo").value;
  $("#opChequeSectionTitle").textContent = metodo === "TRANSFERENCIA"
    ? "2. Cargar transferencias hasta cerrar el neto a abonar"
    : "2. Cargar cheques hasta cerrar el neto a abonar";
  $("#opAddChequeBtn").textContent = metodo === "TRANSFERENCIA" ? "+ Agregar transferencia" : "+ Agregar cheque";

  const container = $("#opChequeRows");
  if (!opDraftChecks.length) {
    container.innerHTML = `<p class="picker-empty">${metodo === "TRANSFERENCIA" ? `Todavía no cargaste ninguna transferencia — hacé click en "+ Agregar transferencia" para poner fecha y monto.` : `Todavía no cargaste ningún cheque — hacé click en "+ Agregar cheque".`}</p>`;
    return;
  }
  if (metodo === "TRANSFERENCIA") {
    container.innerHTML = opDraftChecks.map((c, idx) => `
      <div class="cheque-draft-row" style="grid-template-columns: 1fr 1fr 34px;">
        <label>Fecha<input type="date" value="${c.fechaPago}" data-op-cheque-field="fechaPago" data-op-cheque-idx="${idx}" /></label>
        <label>Monto<input type="number" min="0" step="0.01" value="${c.monto}" data-op-cheque-field="monto" data-op-cheque-idx="${idx}" /></label>
        <button type="button" class="remove-cheque-btn" data-remove-op-cheque="${idx}" title="Quitar">✕</button>
      </div>`).join("");
    return;
  }
  container.innerHTML = opDraftChecks.map((c, idx) => `
    <div class="cheque-draft-row">
      <label>N° cheque<input type="text" value="${escapeHtml(c.numero)}" data-op-cheque-field="numero" data-op-cheque-idx="${idx}" /></label>
      <label>Banco<input type="text" value="${escapeHtml(c.banco)}" data-op-cheque-field="banco" data-op-cheque-idx="${idx}" /></label>
      <label>Emisión<input type="date" value="${c.fechaEmision}" data-op-cheque-field="fechaEmision" data-op-cheque-idx="${idx}" /></label>
      <label>Fecha pago<input type="date" value="${c.fechaPago}" data-op-cheque-field="fechaPago" data-op-cheque-idx="${idx}" /></label>
      <label>Monto<input type="number" min="0" step="0.01" value="${c.monto}" data-op-cheque-field="monto" data-op-cheque-idx="${idx}" /></label>
      <button type="button" class="remove-cheque-btn" data-remove-op-cheque="${idx}" title="Quitar">✕</button>
    </div>`).join("");
}

function renderOpChequeSummary() {
  const netoAAbonar = draftOpBreakdown().netoAAbonar;
  const chequesTotal = round2(opDraftChecks.reduce((sum, c) => sum + Number(c.monto || 0), 0));
  const diff = round2(netoAAbonar - chequesTotal);
  const diffHtml = Math.abs(diff) < 0.01
    ? `<span class="ok">Cierra exacto ✓</span>`
    : diff > 0
      ? `<span class="warn">Falta cubrir ${money(diff)}</span>`
      : `<span class="warn">Te pasaste por ${money(-diff)} — revisá los montos</span>`;
  const metodoLabel = $("#opMetodo").value === "TRANSFERENCIA" ? "Suma de transferencias" : "Suma de cheques";
  $("#opChequeSummary").innerHTML = `<div class="summary-row" style="display:flex;gap:18px;flex-wrap:wrap;padding:8px 0;">
    <span>Neto a abonar: <strong>${money(netoAAbonar)}</strong></span>
    <span>${metodoLabel}: <strong>${money(chequesTotal)}</strong></span>
    ${diffHtml}
  </div>`;
}

$("#opClientId").addEventListener("change", () => {
  opDraftChecks = [];
  renderOpInvoicePicker();
  renderOpChequeRows();
});
$("#opMetodo").addEventListener("change", () => {
  opDraftChecks = [];
  renderOpChequeRows();
  renderOpChequeSummary();
});
["#opRetIva", "#opRetGanancias", "#opRetIIBB"].forEach((sel) => $(sel).addEventListener("input", renderOpBreakdown));

$("#opAddChequeBtn").addEventListener("click", () => {
  // Se propone como monto lo que todavía falta cubrir del neto a abonar
  // (no lo que ya está cargado en otras filas), para no tener que
  // retipear el total cuando el pago es único y completo — que es el
  // caso más común. Si no llega a cubrir todo (o ya se pasó), el aviso
  // de abajo ("Falta cubrir" / "Te pasaste por") sigue avisando igual.
  const yaCubierto = round2(opDraftChecks.reduce((sum, c) => sum + Number(c.monto || 0), 0));
  const falta = round2(Math.max(0, draftOpBreakdown().netoAAbonar - yaCubierto));
  const draft = $("#opMetodo").value === "TRANSFERENCIA"
    ? { fechaPago: "", monto: falta }
    : { numero: "", banco: "", fechaEmision: "", fechaPago: "", monto: falta };
  opDraftChecks.push(draft);
  renderOpChequeRows();
  renderOpChequeSummary();
});

document.body.addEventListener("input", (event) => {
  const idx = event.target.dataset?.opChequeIdx;
  const field = event.target.dataset?.opChequeField;
  if (idx === undefined || !field) return;
  opDraftChecks[idx][field] = field === "monto" ? Number(event.target.value || 0) : event.target.value;
  if (field === "monto") renderOpChequeSummary();
});

document.body.addEventListener("click", (event) => {
  const removeIdx = event.target.dataset?.removeOpCheque;
  if (removeIdx === undefined) return;
  opDraftChecks.splice(Number(removeIdx), 1);
  renderOpChequeRows();
  renderOpChequeSummary();
});

$("#opForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const invoiceIds = opSelectedInvoiceIds();
  const metodo = $("#opMetodo").value;
  if (!invoiceIds.length) {
    alert("Tildá al menos una factura para armar la OP.");
    return;
  }
  if (!opDraftChecks.length) {
    alert(metodo === "TRANSFERENCIA" ? "Cargá al menos una transferencia antes de guardar." : "Cargá al menos un cheque antes de guardar.");
    return;
  }
  const op = {
    id: cryptoId(),
    clientId: $("#opClientId").value,
    number: $("#opNumber").value.trim(),
    date: new Date().toISOString().slice(0, 10),
    invoiceIds,
    metodo,
    // Los montos de retención que realmente valen son estos dos — los que
    // el usuario cargó a mano leyendo el comprobante real. opBreakdown()
    // los usa siempre que estén presentes (siempre, desde que se sacó el
    // cálculo automático a partir de un %), en vez de recalcular con un %.
    manualRetIva: draftOpBreakdown().retIva,
    manualRetGanancias: draftOpBreakdown().retGanancias,
    manualRetIIBB: draftOpBreakdown().retIIBB
  };
  state.paymentOrders.push(op);
  opDraftChecks.forEach((c) => {
    state.checks.push({
      id: cryptoId(),
      paymentOrderId: op.id,
      metodo,
      numero: c.numero || "",
      banco: c.banco || "",
      fechaEmision: c.fechaEmision || "",
      fechaPago: c.fechaPago,
      monto: Number(c.monto || 0),
      // Las transferencias se dan por confirmadas al cargarlas (no rebotan).
      // Los cheques arrancan RECIBIDO y hay que marcarlos ACREDITADO a mano.
      status: metodo === "TRANSFERENCIA" ? "ACREDITADO" : "RECIBIDO"
    });
  });
  opDraftChecks = [];
  $("#opForm").reset();
  renderOpChequeRows();
  render();
});

// Paginado de la lista de OP: arranca mostrando las últimas 8, "Mostrar más"
// suma de a 8. Se resetea a 8 cada vez que cambia el buscador o el filtro,
// para no mostrar de golpe una lista larga después de filtrar por otra cosa.
let opListVisibleCount = 8;
const OP_LIST_PAGE_SIZE = 8;

function renderOpList() {
  const search = ($("#opListSearch")?.value || "").trim().toLowerCase();
  const filterMode = $("#opListFilter")?.value || "all";
  const ops = [...state.paymentOrders].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  if (!ops.length) {
    $("#opList").innerHTML = `<p class="legend">Todavía no armaste ninguna Orden de Pago.</p>`;
    return;
  }

  let filtered = ops.filter((op) => {
    const clientName = (byId(state.clients, op.clientId)?.name || "").toLowerCase();
    const number = (op.number || op.id || "").toLowerCase();
    if (search && !clientName.includes(search) && !number.includes(search)) return false;
    if (filterMode === "open" && opIsFullyResolved(op)) return false;
    if (filterMode === "closed" && !opIsFullyResolved(op)) return false;
    return true;
  });

  if (!filtered.length) {
    $("#opList").innerHTML = `<p class="legend">Ninguna OP coincide con esa búsqueda/filtro.</p>`;
    return;
  }

  const visible = filtered.slice(0, opListVisibleCount);
  const remaining = filtered.length - visible.length;
  $("#opList").innerHTML = visible.map((op) => renderOpCard(op)).join("")
    + (remaining > 0 ? `<button type="button" id="opListShowMore" class="small" style="margin-top:8px;">Mostrar ${Math.min(remaining, OP_LIST_PAGE_SIZE)} más (quedan ${remaining})</button>` : "");
  const showMoreBtn = $("#opListShowMore");
  if (showMoreBtn) showMoreBtn.addEventListener("click", () => {
    opListVisibleCount += OP_LIST_PAGE_SIZE;
    renderOpList();
  });
}

$("#opListSearch").addEventListener("input", () => {
  opListVisibleCount = OP_LIST_PAGE_SIZE;
  renderOpList();
});
$("#opListFilter").addEventListener("change", () => {
  opListVisibleCount = OP_LIST_PAGE_SIZE;
  renderOpList();
});

$("#opListToggle").addEventListener("click", () => {
  const body = $("#opListBody");
  const collapsed = body.style.display === "none";
  body.style.display = collapsed ? "" : "none";
  $("#opListToggle").textContent = collapsed ? "Colapsar" : "Expandir";
});

function renderOpCard(op) {
    const clientName = byId(state.clients, op.clientId)?.name || "";
    const invoices = opInvoices(op);
    const checks = opChecks(op);
    const b = opBreakdown(op);
    const resolved = opIsFullyResolved(op);
    const statusBadge = resolved
      ? `<span class="status PAGO">CERRADA</span>`
      : `<span class="status PENDIENTE">${checks.filter((c) => !checkIsResolved(c)).length} cheque(s) pendiente(s)</span>`;
    const chips = invoices.map((inv) => {
      const loc = byId(state.locations, inv.locationId)?.name || "";
      return `<span class="chip">${escapeHtml(loc)} ${escapeHtml(inv.number)}</span>`;
    }).join("");
    const checkRows = checks.map((c) => `<tr>
        <td>${c.metodo === "TRANSFERENCIA" ? "Transferencia" : escapeHtml(c.numero || "-")}</td>
        <td>${c.metodo === "TRANSFERENCIA" ? "-" : escapeHtml(c.banco || "-")}</td>
        <td>${c.fechaPago ? fmtDDMMYY(c.fechaPago) : "-"}</td>
        <td class="num">${money(c.monto)}</td>
        <td><span class="status ${c.status}">${c.status === "ENDOSADO_PARCIAL" ? "ENDOSADO (parcial)" : c.status}</span>${c.status === "ENDOSADO" || c.status === "ENDOSADO_PARCIAL" ? (checksEndorsedInvoiceLabel(c)) : ""}</td>
        <td>
          ${c.status === "RECIBIDO" ? `<button type="button" class="small" data-check-acreditado="${c.id}">Marcar acreditado</button> <button type="button" class="small" data-check-rechazado="${c.id}">Marcar rechazado</button>` : ""}
          <button type="button" class="small remove-btn" data-delete-check="${c.id}" title="Borrar este cheque">Borrar</button>
        </td>
      </tr>`).join("");
    const addRowHtml = op.metodo === "TRANSFERENCIA"
      ? `<div class="cheque-draft-row" style="margin-top:10px; grid-template-columns: 1fr 1fr 34px;">
          <label>Fecha<input type="date" data-add-check-field="fechaPago" data-add-check-op="${op.id}" /></label>
          <label>Monto<input type="number" min="0" step="0.01" data-add-check-field="monto" data-add-check-op="${op.id}" /></label>
          <button type="button" class="small" data-add-check-submit="${op.id}" title="Agregar transferencia">+</button>
        </div>`
      : `<div class="cheque-draft-row" style="margin-top:10px">
          <label>N° cheque<input type="text" data-add-check-field="numero" data-add-check-op="${op.id}" /></label>
          <label>Banco<input type="text" data-add-check-field="banco" data-add-check-op="${op.id}" /></label>
          <label>Emisión<input type="date" data-add-check-field="fechaEmision" data-add-check-op="${op.id}" /></label>
          <label>Fecha pago<input type="date" data-add-check-field="fechaPago" data-add-check-op="${op.id}" /></label>
          <label>Monto<input type="number" min="0" step="0.01" data-add-check-field="monto" data-add-check-op="${op.id}" /></label>
          <button type="button" class="small" data-add-check-submit="${op.id}" title="Agregar cheque">+</button>
        </div>`;
    return `<div class="op-card">
      <div class="op-header" data-toggle-op="${op.id}">
        <div><strong>OP ${escapeHtml(op.number || op.id)}</strong> · ${escapeHtml(clientName)} · ${fmtDDMMYY(op.date)}
          <span class="tag">${invoices.length} factura(s) · ${op.metodo === "TRANSFERENCIA" ? "Transferencia" : "Cheque"}</span>
        </div>
        <div>${statusBadge}</div>
      </div>
      <div class="op-detail" id="op-detail-${op.id}">
        <p class="legend">Facturas cubiertas:</p>
        ${chips}
        <table class="breakdown-table" style="margin-top:10px">
          <tbody>
            <tr><td>Total facturas c/IVA</td><td class="num">${money(b.totalGross)}</td></tr>
            <tr><td>Ret. IVA</td><td class="num">−${money(b.retIva)}</td></tr>
            <tr><td>Ret. Ganancias</td><td class="num">−${money(b.retGanancias)}</td></tr>
            <tr><td>Ret. IIBB</td><td class="num">−${money(b.retIIBB)}</td></tr>
            <tr class="total"><td>Neto a abonar</td><td class="num">${money(b.netoAAbonar)}</td></tr>
          </tbody>
        </table>
        <table style="margin-top:10px">
          <thead><tr><th>${op.metodo === "TRANSFERENCIA" ? "Instrumento" : "Cheque"}</th><th>Banco</th><th>Fecha pago</th><th class="num">Monto</th><th>Estado</th><th></th></tr></thead>
          <tbody>${checkRows}</tbody>
        </table>
        ${addRowHtml}
        <button type="button" class="remove-btn small" style="margin-top:10px" data-delete-op="${op.id}">Borrar OP</button>
        <p class="legend">"Borrar OP" borra la orden completa con todos sus ${op.metodo === "TRANSFERENCIA" ? "transferencias" : "cheques"} — para corregir uno puntual, usá el botón "Borrar" de esa fila y volvelo a cargar acá arriba.</p>
      </div>
    </div>`;
}

function renderPagosTab() {
  renderOpClientSelect();
  renderOpInvoicePicker();
  renderOpChequeRows();
  renderOpChequeSummary();
  renderOpList();
  renderEndosoSection();
}

// Cheques tildados en el formulario de endoso (se resetea al guardar, al
// cancelar, o al cambiar de factura de proveedor).
let endosoSelectedCheckIds = [];

function renderEndosoSection() {
  const invoiceSelect = $("#endosoInvoiceId");
  const prevValue = invoiceSelect.value;
  const pending = state.invoices.filter((inv) => inv.type === "provider" && inv.status !== "PAGO");
  invoiceSelect.innerHTML = `<option value="">Elegí una factura pendiente...</option>` + pending.map((inv) => {
    const provider = byId(state.providers, inv.providerId)?.name || "";
    const coverage = providerInvoiceCoverage(inv.id);
    const falta = round2(Number(inv.amountGross) - coverage.total);
    return `<option value="${inv.id}">${escapeHtml(provider)} · ${escapeHtml(inv.number)} · falta ${money(falta)} de ${money(inv.amountGross)}</option>`;
  }).join("");
  if (pending.some((inv) => inv.id === prevValue)) invoiceSelect.value = prevValue;

  const invoiceId = invoiceSelect.value;
  const invoice = byId(state.invoices, invoiceId);

  // Un cheque sigue disponible para endosar mientras le quede saldo sin
  // asignar — no solo los RECIBIDO "vírgenes": uno ENDOSADO_PARCIAL (que ya
  // cubrió otra factura y le sobró plata) también puede seguir aplicándose.
  const availableChecks = state.checks.filter((c) => (c.status === "RECIBIDO" || c.status === "ENDOSADO_PARCIAL") && checkRemaining(c) > 0);
  $("#endosoCheckPicker").innerHTML = availableChecks.length
    ? `<table class="picker-table">
        <thead><tr><th></th><th>Cliente / OP</th><th>N° cheque</th><th>Banco</th><th>Fecha pago</th><th class="num">Disponible</th></tr></thead>
        <tbody>${availableChecks.map((c) => {
          const op = byId(state.paymentOrders, c.paymentOrderId);
          const client = op ? byId(state.clients, op.clientId)?.name || "" : "";
          const checked = endosoSelectedCheckIds.includes(c.id);
          const remaining = checkRemaining(c);
          const partialNote = c.status === "ENDOSADO_PARCIAL" ? `<span class="cell-sub"> (de ${money(c.monto)}, ya endosó parte)</span>` : "";
          return `<tr>
            <td><input type="checkbox" data-endoso-check="${c.id}" ${checked ? "checked" : ""} /></td>
            <td>${escapeHtml(client)}${op ? ` <span class="cell-sub">OP ${escapeHtml(op.number || op.id)}</span>` : ""}</td>
            <td>${escapeHtml(c.numero || "-")}</td>
            <td>${escapeHtml(c.banco || "-")}</td>
            <td>${c.fechaPago ? fmtDDMMYY(c.fechaPago) : "-"}</td>
            <td class="num">${money(remaining)}${partialNote}</td>
          </tr>`;
        }).join("")}</tbody>
      </table>`
    : `<p class="picker-empty">No hay cheques disponibles para endosar por ahora.</p>`;

  const selectedTotal = round2(availableChecks
    .filter((c) => endosoSelectedCheckIds.includes(c.id))
    .reduce((sum, c) => sum + checkRemaining(c), 0));

  if (!invoice) {
    $("#endosoSummary").innerHTML = "";
    $("#endosoDirectPayment").innerHTML = "";
    return;
  }

  const yaCubierto = providerInvoiceCoverage(invoice.id).total;
  const faltaAntes = round2(Number(invoice.amountGross) - yaCubierto);
  const diff = round2(selectedTotal - faltaAntes);
  const diffHtml = Math.abs(diff) < 1
    ? `<span class="ok">Cierra exacto ✓</span>`
    : diff > 0
      ? `<span class="ok">Con esto sobra ${money(diff)} — queda como saldo disponible en el/los cheque(s) para el próximo pago</span>`
      : `<span class="warn">Todavía falta cubrir ${money(-diff)} — completá abajo con un pago directo, o tildá otro cheque</span>`;

  $("#endosoSummary").innerHTML = `<div style="display:flex;gap:18px;flex-wrap:wrap;">
    <span>Factura a cubrir: <strong>${money(invoice.amountGross)}</strong></span>
    ${yaCubierto > 0 ? `<span>Ya cubierto antes: <strong>${money(yaCubierto)}</strong></span>` : ""}
    <span>Cheques tildados (disponible): <strong>${money(selectedTotal)}</strong></span>
    ${diffHtml}
  </div>`;

  const falta = Math.max(0, round2(faltaAntes - selectedTotal));
  $("#endosoDirectPayment").innerHTML = falta > 0
    ? `<p class="legend">Pago complementario (efectivo/transferencia) para cubrir lo que falta — opcional, también se puede cargar después desde Facturas:</p>
       <div class="cheque-draft-row" style="grid-template-columns: 1fr 1fr 1fr;">
         <label>Fecha<input type="date" id="endosoDirectFecha" /></label>
         <label>Monto<input type="number" min="0" step="0.01" id="endosoDirectMonto" value="${falta}" /></label>
         <label>Medio<select id="endosoDirectMedio">
             <option value="TRANSFERENCIA">Transferencia</option>
             <option value="EFECTIVO">Efectivo</option>
           </select></label>
       </div>`
    : "";
}

$("#endosoInvoiceId").addEventListener("change", () => {
  endosoSelectedCheckIds = [];
  renderEndosoSection();
});

document.body.addEventListener("change", (event) => {
  const checkId = event.target.dataset?.endosoCheck;
  if (!checkId) return;
  if (event.target.checked) endosoSelectedCheckIds.push(checkId);
  else endosoSelectedCheckIds = endosoSelectedCheckIds.filter((id) => id !== checkId);
  renderEndosoSection();
});

$("#endosoForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const invoiceId = $("#endosoInvoiceId").value;
  if (!invoiceId) {
    alert("Elegí una factura de proveedor primero.");
    return;
  }
  if (!endosoSelectedCheckIds.length) {
    alert("Tildá al menos un cheque para endosar.");
    return;
  }
  const invoice = byId(state.invoices, invoiceId);
  const montoDirectoInput = $("#endosoDirectMonto");
  const montoDirecto = Number(montoDirectoInput?.value || 0);
  const fechaDirecto = $("#endosoDirectFecha")?.value || "";
  if (montoDirecto > 0 && !fechaDirecto) {
    alert("Completá la fecha del pago complementario (o poné el monto en 0 si no hace falta).");
    return;
  }
  // Reparte lo que hace falta cubrir entre los cheques tildados, en el orden
  // en que están tildados, tomando de cada uno solo lo que se necesita — si
  // un cheque tiene más saldo del que hace falta, el resto le queda
  // disponible (no se le asigna a esta factura) para el próximo endoso.
  let faltaCubrir = Math.max(0, round2(Number(invoice.amountGross) - providerInvoiceCoverage(invoiceId).total));
  endosoSelectedCheckIds.forEach((id) => {
    const check = byId(state.checks, id);
    if (!check || faltaCubrir <= 0) return;
    const disponible = checkRemaining(check);
    if (disponible <= 0) return;
    const aplicar = round2(Math.min(disponible, faltaCubrir));
    if (aplicar <= 0) return;
    check.allocations = check.allocations || [];
    check.allocations.push({ invoiceId, amount: aplicar });
    check.status = checkRemaining(check) > 0 ? "ENDOSADO_PARCIAL" : "ENDOSADO";
    faltaCubrir = round2(faltaCubrir - aplicar);
  });
  if (montoDirecto > 0) {
    state.directPayments = state.directPayments || [];
    state.directPayments.push({
      id: cryptoId(),
      invoiceId,
      invoiceType: "provider",
      fecha: fechaDirecto,
      monto: montoDirecto,
      medio: $("#endosoDirectMedio")?.value === "EFECTIVO" ? "EFECTIVO" : "TRANSFERENCIA"
    });
  }
  endosoSelectedCheckIds = [];
  $("#endosoForm").reset();
  render();
});

document.body.addEventListener("click", (event) => {
  const toggleId = event.target.closest("[data-toggle-op]")?.dataset.toggleOp;
  if (toggleId) {
    $(`#op-detail-${toggleId}`).classList.toggle("open");
    return;
  }
  const acreditarId = event.target.dataset?.checkAcreditado;
  if (acreditarId) {
    const check = byId(state.checks, acreditarId);
    if (check) {
      check.status = "ACREDITADO";
      render();
    }
    return;
  }
  const rechazarId = event.target.dataset?.checkRechazado;
  if (rechazarId) {
    const check = byId(state.checks, rechazarId);
    if (check) {
      check.status = "RECHAZADO";
      render();
    }
    return;
  }
  const deleteOpId = event.target.dataset?.deleteOp;
  if (deleteOpId) {
    if (!confirm("¿Borrar esta Orden de Pago y sus cheques? Las facturas que cubría vuelven a quedar pendientes de cobro.")) return;
    state.paymentOrders = state.paymentOrders.filter((op) => op.id !== deleteOpId);
    state.checks = state.checks.filter((c) => c.paymentOrderId !== deleteOpId);
    render();
    return;
  }
  const deleteCheckId = event.target.dataset?.deleteCheck;
  if (deleteCheckId) {
    const check = byId(state.checks, deleteCheckId);
    const warning = check?.status === "ENDOSADO" || check?.status === "ENDOSADO_PARCIAL"
      ? "Este cheque está endosado (total o parcialmente) a una o más facturas de proveedor — si lo borrás, esas facturas van a quedar sin esa parte de cobertura (podés volver a endosar otro cheque después). ¿Confirmás?"
      : "¿Borrar este cheque? Podés volver a cargarlo con el formulario de abajo.";
    if (!confirm(warning)) return;
    state.checks = state.checks.filter((c) => c.id !== deleteCheckId);
    render();
    return;
  }
  const addCheckOpId = event.target.dataset?.addCheckSubmit;
  if (addCheckOpId) {
    const op = byId(state.paymentOrders, addCheckOpId);
    const metodo = op?.metodo === "TRANSFERENCIA" ? "TRANSFERENCIA" : "CHEQUE";
    const fields = {};
    document.querySelectorAll(`[data-add-check-op="${addCheckOpId}"]`).forEach((input) => {
      fields[input.dataset.addCheckField] = input.value;
    });
    if (!fields.monto || Number(fields.monto) <= 0) {
      alert(metodo === "TRANSFERENCIA" ? "Cargá al menos el monto de la transferencia." : "Cargá al menos el monto del cheque.");
      return;
    }
    state.checks.push({
      id: cryptoId(),
      paymentOrderId: addCheckOpId,
      metodo,
      numero: fields.numero || "",
      banco: fields.banco || "",
      fechaEmision: fields.fechaEmision || "",
      fechaPago: fields.fechaPago || "",
      monto: Number(fields.monto || 0),
      status: metodo === "TRANSFERENCIA" ? "ACREDITADO" : "RECIBIDO"
    });
    render();
  }
});


function renderExpenses() {
  const rows = [...state.expenses].sort((a, b) => b.date.localeCompare(a.date));
  $("#expenseRows").innerHTML = rows.length ? `<tr><th>Fecha</th><th>Categoría</th><th>Descripción</th><th class="num">Monto</th><th></th></tr>
    ${rows.map((item) => `<tr>
      <td>${fmtDDMMYY(item.date)}</td>
      <td>${escapeHtml(item.category)}</td>
      <td>${escapeHtml(item.description)}</td>
      <td class="num">${money(item.amount)}</td>
      <td><button type="button" data-delete-expense="${item.id}" title="Eliminar">Borrar</button></td>
    </tr>`).join("")}`
    : `<tr><td class="empty">Sin gastos cargados.</td></tr>`;
}

addFromForm($("#expenseForm"), "expenses", (v) => ({
  id: cryptoId(),
  date: v.date,
  category: v.category,
  description: v.description,
  amount: Number(v.amount)
}));

// (el if protege por si app.js se actualiza sin el index.html nuevo)
if ($("#ivaPeriodForm")) {
  $("#ivaPeriodForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (saveIvaPeriod(formValues($("#ivaPeriodForm")))) {
      $("#ivaPeriodForm").reset();
      render();
    }
  });
}

function monthKey(dateText) {
  return dateText.slice(0, 7);
}

/** Fecha ISO usable (AAAA-MM-DD con año razonable). Atrapa vacías y typos como 0206-07-20. */
function isValidISODate(text) {
  return /^\d{4}-\d{2}-\d{2}$/.test(text || "") && Number(text.slice(0, 4)) >= 2000;
}

/**
 * Fecha en que un cobro cayó en el banco, para ubicarlo en un mes de
 * Liquidez. Si el cheque/transferencia tiene fecha de pago válida se usa
 * esa. Si no (vacía o con typo), se estima con la fecha de pago de la
 * factura y, en última instancia, con la fecha de la OP — así la plata no
 * desaparece del resumen. Estas estimaciones se avisan abajo de la tabla
 * para que se corrija la fecha en la OP.
 */
function checkCashDate(check) {
  if (isValidISODate(check.fechaPago)) return check.fechaPago;
  const op = byId(state.paymentOrders, check.paymentOrderId);
  if (!op) return "";
  const paid = opInvoices(op).map((inv) => inv.paymentDate).filter(isValidISODate).sort();
  if (paid.length) return paid[paid.length - 1];
  return isValidISODate(op.date) ? op.date : "";
}

/**
 * Posición de IVA mes a mes, con la misma mecánica que la DDJJ de ARCA
 * (F.2051), a partir de los números que presenta el contador:
 *   saldo técnico a favor de ARCA = débito − crédito (− saldo técnico a favor
 *                                   del contribuyente que venga arrastrado)
 *   disponible  = saldo previo (neto de usos) + retenciones/percepciones
 *   se aplica   = lo menor entre disponible y lo que hay que pagar
 *   en efectivo = lo que hay que pagar y el disponible no cubre (VEP)
 *   saldo final = disponible − se aplica
 *   pasa al mes siguiente = saldo final − usos posteriores (compensaciones
 *                           contra IVA de otros períodos, devoluciones, etc.)
 * Verificado contra las DDJJ de agosto y septiembre 2026.
 * El saldo previo se arrastra solo; si se carga a mano en un período, pisa
 * el arrastrado (sirve para el primer período cargado).
 */
function ivaPositionRows() {
  const sorted = [...(state.ivaPeriods || [])].sort((a, b) => a.period.localeCompare(b.period));
  let carry = 0;
  let technicalCarry = 0;
  return sorted.map((p) => {
    const hasManualPrev = p.saldoPrevio !== null && p.saldoPrevio !== undefined && p.saldoPrevio !== "";
    const previo = hasManualPrev ? Number(p.saldoPrevio) : carry;
    const debito = Number(p.debito || 0);
    const credito = Number(p.credito || 0);
    const retenciones = Number(p.retenciones || 0);
    const usos = Number(p.usos || 0);
    const ivaPeriodo = round2(debito - credito);
    const tecnico = round2(ivaPeriodo - technicalCarry);
    const aFavorARCA = Math.max(0, tecnico);
    const nextTechnicalCarry = tecnico < 0 ? -tecnico : 0;
    const disponible = round2(previo + retenciones);
    const aplicado = Math.min(disponible, aFavorARCA);
    const efectivo = round2(aFavorARCA - aplicado);
    const saldoFinal = round2(disponible - aplicado);
    const pasa = round2(saldoFinal - usos);
    const hasDDJJ = p.saldoDDJJ !== null && p.saldoDDJJ !== undefined && p.saldoDDJJ !== "";
    const row = {
      id: p.id, period: p.period, debito, credito, retenciones, usos, previo, ivaPeriodo,
      aFavorARCA, efectivo, saldoFinal, pasa,
      saldoDDJJ: hasDDJJ ? Number(p.saldoDDJJ) : null,
      diff: hasDDJJ ? round2(saldoFinal - Number(p.saldoDDJJ)) : null
    };
    carry = pasa;
    technicalCarry = nextTechnicalCarry;
    return row;
  });
}

/** Alta o corrección de un período de IVA (si ya existe ese mes, lo reemplaza). */
function saveIvaPeriod(values) {
  const num = (v) => (v === "" || v === null || v === undefined ? null : Number(v));
  if (!/^\d{4}-\d{2}$/.test(values.period || "")) return false;
  const item = {
    id: cryptoId(),
    period: values.period,
    debito: Number(values.debito || 0),
    credito: Number(values.credito || 0),
    retenciones: Number(values.retenciones || 0),
    usos: Number(values.usos || 0),
    saldoPrevio: num(values.saldoPrevio),
    saldoDDJJ: num(values.saldoDDJJ)
  };
  if (!Array.isArray(state.ivaPeriods)) state.ivaPeriods = []; // importaciones viejas no la traen
  const idx = state.ivaPeriods.findIndex((x) => x.period === item.period);
  if (idx >= 0) {
    item.id = state.ivaPeriods[idx].id;
    state.ivaPeriods[idx] = item;
  } else {
    state.ivaPeriods.push(item);
  }
  return true;
}

function renderIvaPosition() {
  if (!$("#ivaRows") || !$("#ivaSummary")) return; // index.html viejo, sin el panel
  const rows = ivaPositionRows();
  if (!rows.length) {
    $("#ivaRows").innerHTML = `<tr><td class="empty">Todavía no cargaste ninguna declaración de IVA.</td></tr>`;
    $("#ivaSummary").innerHTML = "";
    return;
  }
  const body = rows.map((r) => {
    const control = r.diff === null ? "" : (Math.abs(r.diff) < 1 ? "✓ coincide" : `⚠ difiere ${money(r.diff)}`);
    return `<tr>
      <td>${escapeHtml(r.period)}</td>
      <td class="num">${money(r.debito)}</td>
      <td class="num">${money(r.credito)}</td>
      <td class="num">${money(r.ivaPeriodo)}</td>
      <td class="num">${money(r.previo)}</td>
      <td class="num">${money(r.retenciones)}</td>
      <td class="num">${money(r.efectivo)}</td>
      <td class="num">${money(r.saldoFinal)}</td>
      <td class="num">${money(r.usos)}</td>
      <td class="num">${money(r.pasa)}</td>
      <td>${control}</td>
      <td><button type="button" data-edit-iva="${r.id}">Editar</button> <button type="button" data-delete-iva="${r.id}">Borrar</button></td>
    </tr>`;
  }).join("");
  $("#ivaRows").innerHTML = `<tr>
      <th>Período</th><th class="num">Débito fiscal</th><th class="num">Crédito fiscal</th><th class="num">IVA del período</th>
      <th class="num">Saldo previo</th><th class="num">Retenciones y percepciones</th><th class="num">IVA a pagar en efectivo</th>
      <th class="num">Saldo final</th><th class="num">Usado después</th><th class="num">Pasa al mes siguiente</th><th>Control vs DDJJ</th><th></th>
    </tr>${body}`;

  const last = rows[rows.length - 1];
  const recent = rows.slice(-3);
  const avg = recent.reduce((sum, r) => sum + Math.max(0, r.ivaPeriodo), 0) / recent.length;
  const parts = [`Saldo de IVA a favor que pasa al mes siguiente (después de ${escapeHtml(last.period)}): <strong>${money(last.pasa)}</strong>.`];
  if (last.efectivo > 0) {
    parts.push(`En ${escapeHtml(last.period)} hubo IVA a pagar en efectivo: <strong>${money(last.efectivo)}</strong> (cargalo en Gastos cuando lo pagues).`);
  }
  if (last.pasa <= 0) {
    parts.push("No queda saldo a favor: el IVA de los próximos períodos sale del banco.");
  } else if (avg > 0) {
    const months = last.pasa / avg;
    parts.push(`IVA promedio de los últimos ${recent.length} período(s): ${money(avg)}. Sin retenciones nuevas, ese saldo cubre unos <strong>${months.toFixed(1).replace(".", ",")} meses</strong> de IVA; después el IVA sale del banco. Es una estimación: el IVA cambia bastante de un mes a otro.`);
  }
  $("#ivaSummary").innerHTML = parts.join(" ");
}

/**
 * Resumen mensual con DOS miradas, a propósito separadas:
 *  - Devengado: lo que ganás según los remitos, cobres o no todavía.
 *  - Caja real: solo plata que efectivamente entró/salió (facturas PAGO,
 *    ya neto de retenciones) — esto es lo que se compara contra el banco.
 * El IVA a reservar es devengado, pero descontando lo que un cliente ya
 * te retuvo y pagó directo a AFIP ese mes (no hay que separarlo dos veces).
 */
function renderMonthlyTable() {
  if (document.activeElement !== $("#openingBalance")) {
    $("#openingBalance").value = state.openingBalance || "";
  }
  const months = new Set();
  state.deliveries.forEach((d) => months.add(monthKey(d.date)));
  state.invoices.forEach((inv) => { if (inv.paymentDate) months.add(monthKey(inv.paymentDate)); });
  state.expenses.forEach((e) => months.add(monthKey(e.date)));
  state.paymentOrders.forEach((op) => { if (isValidISODate(op.date)) months.add(monthKey(op.date)); });
  state.checks.forEach((c) => {
    const d = c.status === "ACREDITADO" ? checkCashDate(c) : "";
    if (d) months.add(monthKey(d));
  });
  (state.directPayments || []).forEach((p) => { if (p.fecha) months.add(monthKey(p.fecha)); });
  const sortedMonths = [...months].sort();

  if (!sortedMonths.length) {
    $("#monthlyRows").innerHTML = `<tr><td class="empty">Todavía no hay datos para armar el resumen.</td></tr>`;
    return;
  }

  const openingBalance = Number(state.openingBalance || 0);

  $("#monthlyRows").innerHTML = `<tr>
      <th rowspan="2">Mes</th>
      <th colspan="3" class="group-devengado">Devengado (contable — cobrés o no)</th>
      <th colspan="3" class="group-caja">Caja real (banco — solo plata que entró/salió)</th>
      <th colspan="4" class="group-iva">Impuestos (retenciones sufridas e IVA)</th>
    </tr>
    <tr>
      <th class="num">Ganancia del mes</th>
      <th class="num">Gastos</th>
      <th class="num">Ganancia acum.</th>
      <th class="num">Cobrado</th>
      <th class="num">Pagado a prov.</th>
      <th class="num">Caja acumulada</th>
      <th class="num">IVA retenido</th>
      <th class="num">Ganancias retenida</th>
      <th class="num">IIBB retenido</th>
      <th class="num">IVA a reservar (neto; − = a favor)</th>
    </tr>`;

  let accruedCum = 0;
  let cashCum = openingBalance;
  let totalAccrued = 0, totalExpenses = 0, totalCobrado = 0, totalPagado = 0, totalIvaRetenido = 0, totalGanRetenida = 0, totalIibbRetenido = 0, totalIvaNeto = 0;
  const rowsHtml = sortedMonths.map((month) => {
    const accrued = state.deliveries
      .filter((d) => monthKey(d.date) === month)
      .reduce((sum, d) => sum + totalsFor(d).profitNet, 0);
    const ivaDevengado = state.deliveries
      .filter((d) => monthKey(d.date) === month)
      .reduce((sum, d) => {
        const t = totalsFor(d);
        // débito por ventas al 21% − crédito por compras a la tasa del proveedor
        return sum + t.saleNet * IVA_RATE - t.providerNet * providerIvaRate(d.providerId);
      }, 0);
    const expensesMonth = state.expenses
      .filter((e) => monthKey(e.date) === month)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const netAccrued = accrued - expensesMonth;
    accruedCum += netAccrued;

    // Caja real: solo plata que efectivamente entró/salió del banco de
    // Hojaldra este mes. Del lado de cobros, eso es la parte ACREDITADA de
    // los cheques (nunca la endosada — esa nunca pasó por la cuenta). Del
    // lado de pagos a proveedor, son los pagos directos (efectivo/
    // transferencia) que se registraron a mano — nunca lo endosado.
    const cobradoReal = round2(state.checks
      .filter((c) => {
        if (c.status !== "ACREDITADO") return false;
        const d = checkCashDate(c);
        return d && monthKey(d) === month;
      })
      .reduce((sum, c) => sum + Number(c.monto || 0), 0));
    const pagadoReal = round2((state.directPayments || [])
      .filter((p) => p.fecha && monthKey(p.fecha) === month)
      .reduce((sum, p) => sum + Number(p.monto || 0), 0));
    // Retenciones sufridas: salen de las OPs del mes (el cliente retiene al
    // emitir el pago). El cobrado de arriba ya viene neto de estas retenciones.
    const retMonth = state.paymentOrders
      .filter((op) => isValidISODate(op.date) && monthKey(op.date) === month)
      .reduce((acc, op) => {
        const b = opBreakdown(op);
        acc.iva += b.retIva;
        acc.gan += b.retGanancias;
        acc.iibb += b.retIIBB;
        return acc;
      }, { iva: 0, gan: 0, iibb: 0 });
    const ivaRetenido = round2(retMonth.iva);
    const ganRetenida = round2(retMonth.gan);
    const iibbRetenido = round2(retMonth.iibb);
    const cashResult = cobradoReal - pagadoReal - expensesMonth;
    cashCum += cashResult;
    const ivaNeto = ivaDevengado - ivaRetenido;

    totalAccrued += accrued;
    totalExpenses += expensesMonth;
    totalCobrado += cobradoReal;
    totalPagado += pagadoReal;
    totalIvaRetenido += ivaRetenido;
    totalGanRetenida += ganRetenida;
    totalIibbRetenido += iibbRetenido;
    totalIvaNeto += ivaNeto;

    return `<tr>
      <td>${month}</td>
      <td class="num">${money(accrued)}</td>
      <td class="num">${money(expensesMonth)}</td>
      <td class="num">${money(accruedCum)}</td>
      <td class="num">${money(cobradoReal)}</td>
      <td class="num">${money(pagadoReal)}</td>
      <td class="num">${money(cashCum)}</td>
      <td class="num">${money(ivaRetenido)}</td>
      <td class="num">${money(ganRetenida)}</td>
      <td class="num">${money(iibbRetenido)}</td>
      <td class="num">${money(ivaNeto)}</td>
    </tr>`;
  }).join("");

  const totalsRow = `<tr class="totals-row">
      <th>TOTAL A LA FECHA</th>
      <th class="num">${money(totalAccrued)}</th>
      <th class="num">${money(totalExpenses)}</th>
      <th class="num">${money(accruedCum)}</th>
      <th class="num">${money(totalCobrado)}</th>
      <th class="num">${money(totalPagado)}</th>
      <th class="num">${money(cashCum)}</th>
      <th class="num">${money(totalIvaRetenido)}</th>
      <th class="num">${money(totalGanRetenida)}</th>
      <th class="num">${money(totalIibbRetenido)}</th>
      <th class="num">${money(totalIvaNeto)}</th>
    </tr>`;

  // Aviso de fechas a corregir: cobros cuya fecha de pago está vacía o mal
  // cargada (se contaron igual, en un mes estimado).
  const estimated = state.checks.filter((c) =>
    c.status === "ACREDITADO" && Number(c.monto || 0) > 0 && !isValidISODate(c.fechaPago)
  );
  const warningRow = estimated.length
    ? `<tr><td colspan="11" class="legend">⚠️ Revisá la fecha de cobro de ${estimated.length} pago(s) (suman ${money(estimated.reduce((s, c) => s + Number(c.monto || 0), 0))}): la fecha está vacía o mal cargada, así que se contaron en un mes estimado. Corregila en la OP: ${estimated.map((c) => {
        const op = byId(state.paymentOrders, c.paymentOrderId);
        const d = checkCashDate(c);
        return `${escapeHtml(op ? (op.number || op.id) : "sin OP")} (${money(c.monto)} → ${d ? monthKey(d) : "sin mes"})`;
      }).join("; ")}.</td></tr>`
    : "";

  $("#monthlyRows").innerHTML += rowsHtml + totalsRow + warningRow;
}

$("#openingBalance").addEventListener("input", (event) => {
  state.openingBalance = Number(event.target.value || 0);
  saveState();
  renderMonthlyTable();
});

/**
 * "Pendiente de pago" = remitos cuyo estado todavía no es PAGO — incluye
 * los que ni siquiera están habilitados para pagarle al proveedor todavía
 * (falta que la sala pague primero). Es "lo que en algún momento le vamos
 * a tener que pagar a este proveedor y todavía no le pagamos", no
 * necesariamente "lo que hay que pagar ya mismo" (para eso está la
 * columna "Estado / reclamo" de la tabla de arriba, que sí distingue caso
 * por caso).
 */
function renderProviderPayables(rows) {
  const map = new Map();
  rows.forEach((item) => {
    // Cobra cliente: nunca se le paga nada al proveedor por este remito —
    // ni siquiera vale la pena mostrar la fila en $0, directo no cuenta acá.
    if ((item.billingMode || "NORMAL") === "DEVOLUCION_COBRA_CLIENTE") return;
    const provider = byId(state.providers, item.providerId)?.name || "";
    const period = periodLabelFor(item);
    const key = `${item.providerId}|${period}`;
    const current = map.get(key) || { provider, period, total: 0, pending: 0, receiptNos: [] };
    const gross = totalsFor(item).providerNet * (1 + providerIvaRate(item.providerId));
    current.total += gross;
    if (deliveryStatus(item.id) !== "PAGO") current.pending += gross;
    if (item.receiptNo && !current.receiptNos.includes(item.receiptNo)) current.receiptNos.push(item.receiptNo);
    map.set(key, current);
  });
  const grouped = [...map.values()].sort((a, b) => a.provider.localeCompare(b.provider));
  const total = grouped.reduce((sum, item) => sum + item.total, 0);
  const totalPending = grouped.reduce((sum, item) => sum + item.pending, 0);
  $("#payableRows").innerHTML = grouped.length
    ? `<tr><th>Proveedor</th><th>Periodo</th><th>Remitos</th><th class="num">Devengado c/IVA</th><th class="num">Pendiente de pago</th></tr>
      ${grouped.map((item) => `<tr><td>${escapeHtml(item.provider)}</td><td>${escapeHtml(item.period)}</td><td>${escapeHtml(item.receiptNos.join(", "))}</td><td class="num">${money(item.total)}</td><td class="num">${money(item.pending)}</td></tr>`).join("")}
      <tr><th colspan="3">Total proveedores</th><th class="num">${money(total)}</th><th class="num">${money(totalPending)}</th></tr>`
    : `<tr><td class="empty">Sin datos.</td></tr>`;
}

// Orden de la tabla de Facturas: elegida por el usuario haciendo click en un
// header ordenable (ver el body-listener de data-sort-field más abajo). No
// hace falta guardarlo en el state porque es solo una preferencia de vista.
let invoiceSort = { field: "issueDate", dir: "desc" };

// field=null significa "columna no ordenable" (las celdas compuestas, como
// Cheque/OP, no tienen un único valor comparable).
const INVOICE_COLUMNS = [
  { field: "type", label: "Tipo" },
  { field: "entity", label: "Entidad" },
  { field: "location", label: "Sala" },
  { field: "number", label: "N Factura" },
  { field: "ocNumber", label: "N° OC" },
  { field: "issueDate", label: "Emision" },
  { field: "deliveryCount", label: "Remitos", num: true },
  { field: null, label: "Cheque / Orden de pago (si aplica)" },
  { field: "paymentDate", label: "Pago" },
  { field: "amountGross", label: "Monto c/IVA", num: true },
  { field: "neto", label: "Neto real", num: true },
  { field: "status", label: "Estado" },
  { field: null, label: "" }
];

function invoiceRowData(item) {
  const entity = item.type === "client"
    ? byId(state.clients, item.clientId)?.name || ""
    : byId(state.providers, item.providerId)?.name || "";
  const distinctLocations = [...new Set((item.deliveryIds || []).map((id) => byId(state.deliveries, id)?.locationId).filter(Boolean))];
  const location = item.locationId
    ? byId(state.locations, item.locationId)?.name || ""
    : distinctLocations.length > 1
      ? `Varias salas (${distinctLocations.length})`
      : distinctLocations.length === 1
        ? byId(state.locations, distinctLocations[0])?.name || ""
        : "";
  const ret = invoiceRetentions(item);
  const op = item.type === "client" ? clientInvoiceOP(item.id) : null;
  return {
    ...item,
    entity,
    location,
    neto: Number(item.amountGross || 0) - ret.retIva - ret.retGanancias - ret.retIIBB,
    deliveryCount: (item.deliveryIds || []).length,
    op
  };
}

function sortInvoiceRows(rows) {
  const { field, dir } = invoiceSort;
  const mult = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    let va = a[field];
    let vb = b[field];
    if (typeof va === "string") va = va.toLowerCase();
    if (typeof vb === "string") vb = vb.toLowerCase();
    if (va === undefined || va === "") va = dir === "asc" ? "\uffff" : "";
    if (vb === undefined || vb === "") vb = dir === "asc" ? "\uffff" : "";
    if (va < vb) return -1 * mult;
    if (va > vb) return 1 * mult;
    return 0;
  });
}

function sortArrow(field) {
  if (invoiceSort.field !== field) return "";
  return invoiceSort.dir === "asc" ? " ▲" : " ▼";
}

/** IDs de facturas de cliente ya metidas en alguna OP (para no ofrecerlas dos veces). */
function invoicesLinkedToSomeOP() {
  const set = new Set();
  state.paymentOrders.forEach((op) => (op.invoiceIds || []).forEach((id) => set.add(id)));
  return set;
}

/** Facturas de cliente candidatas a entrar en una OP nueva: de ESE cliente, sin OP todavía. */
function pendingClientInvoicesForOP(clientId) {
  const linked = invoicesLinkedToSomeOP();
  return state.invoices
    .filter((inv) => inv.type === "client" && inv.clientId === clientId && !linked.has(inv.id))
    .sort((a, b) => a.issueDate.localeCompare(b.issueDate));
}

function opInvoices(op) {
  return (op.invoiceIds || []).map((id) => byId(state.invoices, id)).filter(Boolean);
}

function opTotalGross(op) {
  return round2(opInvoices(op).reduce((sum, inv) => sum + Number(inv.amountGross || 0), 0));
}

/**
 * Desglose completo de una OP, paso a paso: total c/IVA -> neto s/IVA (usando
 * la alícuota de IVA de tus facturas, normalmente 21%) -> retención IVA
 * (siempre el 100% de ese componente de IVA) -> retención Ganancias (% sobre
 * el neto, nunca sobre el total c/IVA) -> neto a abonar. Si la OP tiene
 * retenciones cargadas a mano (manualRetIva/manualRetGanancias), se usan esas
 * en vez de recalcular con el %.
 */
function opBreakdown(op) {
  const totalGross = opTotalGross(op);
  const ivaInvoiceRatePct = Number(op.ivaInvoiceRatePct ?? IVA_RATE * 100);
  const netoSIva = round2(totalGross / (1 + ivaInvoiceRatePct / 100));
  const ivaComponent = round2(totalGross - netoSIva);
  let retIva, retGanancias;
  if (op.manualRetIva !== undefined || op.manualRetGanancias !== undefined) {
    retIva = round2(Number(op.manualRetIva || 0));
    retGanancias = round2(Number(op.manualRetGanancias || 0));
  } else {
    retIva = ivaComponent; // se retiene el 100% del IVA de la factura, siempre
    retGanancias = round2(netoSIva * (Number(op.gananciasRatePct ?? 6) / 100));
  }
  // IIBB siempre es un monto cargado a mano (OPs anteriores no lo tienen = 0).
  const retIIBB = round2(Number(op.manualRetIIBB || 0));
  const netoAAbonar = round2(totalGross - retIva - retGanancias - retIIBB);
  return { totalGross, netoSIva, ivaComponent, retIva, retGanancias, retIIBB, netoAAbonar, ivaInvoiceRatePct };
}

function opChecks(op) {
  return state.checks.filter((c) => c.paymentOrderId === op.id);
}

function opChecksTotal(op) {
  return round2(opChecks(op).reduce((sum, c) => sum + Number(c.monto || 0), 0));
}

/**
 * Un cheque "resuelto" es uno que ya no puede volver a moverse: se depositó
 * (ACREDITADO) o ya se terminó de endosar del todo (ENDOSADO). Un cheque
 * ENDOSADO_PARCIAL ya se usó para cubrir algo, pero todavía tiene saldo sin
 * asignar — cuenta como "resuelto" para el lado del cliente (ya se decidió
 * su destino), pero sigue disponible en el picker de endosos por el saldo
 * que le queda. RECIBIDO y RECHAZADO no cuentan como resueltos.
 */
function checkIsResolved(check) {
  return check.status === "ACREDITADO" || check.status === "ENDOSADO" || check.status === "ENDOSADO_PARCIAL";
}

/** Cuánto de un cheque ya se asignó a facturas de proveedor (endosos, parciales o completos). */
function checkAllocatedTotal(check) {
  return round2((check.allocations || []).reduce((sum, a) => sum + Number(a.amount || 0), 0));
}

/** Saldo de un cheque todavía sin asignar a ninguna factura — lo que queda disponible para el próximo endoso. */
function checkRemaining(check) {
  return round2(Number(check.monto || 0) - checkAllocatedTotal(check));
}

function opIsFullyResolved(op) {
  const checks = opChecks(op);
  if (!checks.length) return false;
  const allResolved = checks.every(checkIsResolved);
  const closeEnough = Math.abs(opChecksTotal(op) - opBreakdown(op).netoAAbonar) < 1;
  return allResolved && closeEnough;
}

function clientInvoiceOP(invoiceId) {
  return state.paymentOrders.find((op) => (op.invoiceIds || []).includes(invoiceId));
}

/**
 * Retenciones que un cliente le hizo a Hojaldra en UNA factura (IVA,
 * Ganancias, IIBB). La fuente de verdad son las OPs (opBreakdown), no los
 * campos viejos retIva/retGanancias de la factura: hoy nadie los carga y
 * valen 0, por eso las retenciones no se veían en Liquidez ni en Facturas.
 * Una OP puede juntar varias facturas: su retención se prorratea según el
 * peso de cada factura en el total bruto de la OP. Solo si la factura no
 * tiene OP (o es de proveedor) se usan los campos viejos, por compatibilidad.
 */
function invoiceRetentions(inv) {
  const legacy = {
    retIva: Number(inv.retIva || 0),
    retGanancias: Number(inv.retGanancias || 0),
    retIIBB: 0
  };
  if (inv.type !== "client") return legacy;
  const op = clientInvoiceOP(inv.id);
  if (!op) return legacy;
  const b = opBreakdown(op);
  if (!(b.totalGross > 0)) return legacy;
  const share = Number(inv.amountGross || 0) / b.totalGross;
  return {
    retIva: round2(b.retIva * share),
    retGanancias: round2(b.retGanancias * share),
    retIIBB: round2(b.retIIBB * share)
  };
}

/** Cheques (o la porción de un cheque) que quedaron aplicados a esta factura de proveedor, vía allocations. */
function checksEndorsedToInvoice(invoiceId) {
  return state.checks.filter((c) => (c.allocations || []).some((a) => a.invoiceId === invoiceId));
}

/** Cuánto de un cheque en particular se aplicó a una factura puntual. */
function checkAllocationFor(check, invoiceId) {
  return round2((check.allocations || []).filter((a) => a.invoiceId === invoiceId).reduce((sum, a) => sum + Number(a.amount || 0), 0));
}

/** Etiqueta chica "→ Nº factura (Proveedor) $monto" para mostrar al lado de un cheque endosado (total o parcial), con trazabilidad de a quién fue a parar cada parte. */
function checksEndorsedInvoiceLabel(check) {
  const invoiceIds = [...new Set((check.allocations || []).map((a) => a.invoiceId))];
  const labels = invoiceIds.map((invoiceId) => {
    const inv = byId(state.invoices, invoiceId);
    if (!inv) return null;
    const provider = byId(state.providers, inv.providerId)?.name || "";
    return `${escapeHtml(inv.number)} (${escapeHtml(provider)}) ${money(checkAllocationFor(check, invoiceId))}`;
  }).filter(Boolean);
  const remaining = checkRemaining(check);
  const remainingLabel = remaining > 0 ? ` · saldo disponible ${money(remaining)}` : "";
  return labels.length ? `<br><span class="cell-sub">→ ${labels.join(", ")}${remainingLabel}</span>` : "";
}

function directPaymentsForInvoice(invoiceId) {
  return (state.directPayments || []).filter((p) => p.invoiceId === invoiceId);
}

/**
 * Cuánto de una factura de PROVEEDOR ya está cubierto, y con qué: la parte
 * endosada (cheques que nunca tocaron el banco de Hojaldra) y la parte
 * pagada directo (efectivo/transferencia real). "total" es lo que hace falta
 * comparar contra el monto de la factura para saber si ya está resuelta —
 * no hace falta que cierre exacto, endosar de más es margen, no error.
 */
function providerInvoiceCoverage(invoiceId) {
  // Suma la porción asignada de cada cheque a ESTA factura puntual — no el
  // monto completo del cheque, porque un mismo cheque puede estar repartido
  // entre varias facturas (endoso parcial + saldo a favor para la próxima).
  const endorsed = round2(state.checks.reduce((sum, c) => sum + checkAllocationFor(c, invoiceId), 0));
  const direct = round2(directPaymentsForInvoice(invoiceId).reduce((sum, p) => sum + Number(p.monto || 0), 0));
  return { endorsed, direct, total: round2(endorsed + direct) };
}

function providerInvoiceIsResolved(invoiceId, amountGross) {
  return providerInvoiceCoverage(invoiceId).total >= Number(amountGross) - 1;
}

/**
 * El estado de una factura de CLIENTE ya no se tipea a mano — se deriva de
 * su OP. Corre al principio de cada render() para que todo lo que ya existía
 * (reportes, Liquidez, deliveryStatus) siga funcionando igual sin tener que
 * reescribirlo: el campo status se mantiene actualizado solo.
 *
 * Lo mismo aplica ahora del lado de PROVEEDOR: el estado se deriva de la
 * cobertura (cheques endosados + pagos directos) contra el monto de la
 * factura — nunca se tipea a mano. paymentDate queda como "la fecha más
 * reciente entre lo que la cubrió", para que Liquidez sepa en qué mes cayó.
 */
function syncClientInvoiceStatuses() {
  state.invoices.forEach((inv) => {
    if (inv.type === "client") {
      const op = clientInvoiceOP(inv.id);
      if (!op) {
        inv.status = "PENDIENTE";
        return;
      }
      const resolved = opIsFullyResolved(op);
      inv.status = resolved ? "PAGO" : "PENDIENTE";
      if (resolved && !inv.paymentDate) {
        const fechas = opChecks(op).map((c) => c.fechaPago).filter(Boolean).sort();
        inv.paymentDate = fechas[fechas.length - 1] || inv.paymentDate || "";
      }
      return;
    }
    if (inv.type === "provider") {
      const resolved = providerInvoiceIsResolved(inv.id, inv.amountGross);
      inv.status = resolved ? "PAGO" : "PENDIENTE";
      const fechas = [
        ...checksEndorsedToInvoice(inv.id).map((c) => c.fechaPago),
        ...directPaymentsForInvoice(inv.id).map((p) => p.fecha)
      ].filter(Boolean).sort();
      if (fechas.length) inv.paymentDate = fechas[fechas.length - 1];
      else if (!resolved) inv.paymentDate = "";
    }
  });
}

// Edición inline del pago directo (efectivo/transferencia) de una factura
// de proveedor — se pisa con null en cuanto se guarda/cancela/borra.
let editingDirectPaymentInvoiceId = null;

function renderInvoices() {
  const prevLocationFilter = $("#invoiceLocationFilter").value;
  $("#invoiceLocationFilter").innerHTML = `<option value="">Todas</option>` + sortByName(state.locations.map((loc) => ({
    ...loc,
    name: `${loc.name} (${byId(state.clients, loc.clientId)?.name || ""})`
  }))).map(optionHtml).join("");
  if (state.locations.some((l) => l.id === prevLocationFilter)) $("#invoiceLocationFilter").value = prevLocationFilter;

  const locationFilter = $("#invoiceLocationFilter").value;
  const typeFilter = $("#invoiceTypeFilter").value;
  const search = ($("#invoiceSearch").value || "").trim().toLowerCase();

  let rows = sortInvoiceRows((state.invoices || []).map(invoiceRowData));
  rows = rows.filter((item) => {
    if (typeFilter && item.type !== typeFilter) return false;
    if (locationFilter) {
      const distinctLocations = [...new Set((item.deliveryIds || []).map((id) => byId(state.deliveries, id)?.locationId).filter(Boolean))];
      const matchesLocation = item.locationId === locationFilter || distinctLocations.includes(locationFilter);
      if (!matchesLocation) return false;
    }
    if (search) {
      const haystack = `${item.entity} ${item.number}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  const header = `<tr>${INVOICE_COLUMNS.map((col) => {
    if (!col.field) return `<th${col.num ? ' class="num"' : ""}>${escapeHtml(col.label)}</th>`;
    return `<th data-sort-field="${col.field}" class="sortable${col.num ? " num" : ""}" title="Ordenar por ${escapeHtml(col.label)}">${escapeHtml(col.label)}${sortArrow(col.field)}</th>`;
  }).join("")}</tr>`;

  if (!rows.length) {
    $("#invoiceRows").innerHTML = header + empty(13);
    return;
  }
  $("#invoiceRows").innerHTML = header + rows.map((item) => {
    const entity = item.entity;
    const location = item.location;
    const nDeliveries = item.deliveryCount;
    const neto = item.neto;
    const ocCell = item.type === "client"
      ? `<input type="text" value="${escapeHtml(item.ocNumber || "")}" placeholder="N° OC" data-oc-invoice="${item.id}" class="ret-input" />`
      : `<span class="cell-sub">-</span>`;

    let chequeCell, pagoCell, actionsCell, estadoCell;
    if (item.type === "client") {
      chequeCell = item.op
        ? `<span class="cell-sub">OP ${escapeHtml(item.op.number || item.op.id)}</span>`
        : `<span class="cell-sub">Sin OP todavía</span>`;
      pagoCell = `<span class="cell-sub">${item.paymentDate ? fmtDDMMYY(item.paymentDate) : "-"}</span>`;
      actionsCell = `<button type="button" data-delete-invoice="${item.id}" title="Eliminar">Borrar</button>`;
      // El estado se deriva de la OP (syncClientInvoiceStatuses, corre al
      // principio de cada render()) — siempre está al día, mismo criterio
      // visual que Proveedor.
      estadoCell = `<span class="status ${item.status}">${item.status}</span>`;
    } else {
      const coverage = providerInvoiceCoverage(item.id);
      const directPayments = directPaymentsForInvoice(item.id);
      chequeCell = coverage.endorsed > 0
        ? `<span class="cell-sub">Endosado ${money(coverage.endorsed)}</span>`
        : `<span class="cell-sub">-</span>`;

      const isEditing = editingDirectPaymentInvoiceId === item.id;
      const falta = Math.max(0, round2(Number(item.amountGross || 0) - coverage.total));
      const directChips = directPayments.length
        ? directPayments.map((p) => `<span class="chip">${p.fecha ? fmtDDMMYY(p.fecha) : "-"} · ${money(p.monto)} (${p.medio === "EFECTIVO" ? "efectivo" : "transf."}) <button type="button" class="chip-remove" data-delete-direct-payment="${p.id}" title="Borrar este pago">✕</button></span>`).join("")
        : "";
      const summaryLine = `<span class="cell-sub">Cubierto ${money(coverage.total)} / ${money(item.amountGross)}${item.paymentDate ? " · " + fmtDDMMYY(item.paymentDate) : ""}</span>`;
      pagoCell = isEditing
        ? `<div class="cheque-draft-row" style="grid-template-columns: 1fr 1fr 1fr 30px; margin:0; white-space:normal;">
            <label>Fecha<input type="date" data-direct-payment-field="fecha" data-direct-payment-invoice="${item.id}" /></label>
            <label>Monto<input type="number" min="0" step="0.01" value="${falta}" data-direct-payment-field="monto" data-direct-payment-invoice="${item.id}" /></label>
            <label>Medio<select data-direct-payment-field="medio" data-direct-payment-invoice="${item.id}">
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="EFECTIVO">Efectivo</option>
              </select></label>
            <button type="button" class="small" data-direct-payment-save="${item.id}" title="Guardar pago">✓</button>
          </div>`
        : `<div style="white-space:normal;">${summaryLine}${directChips ? `<div>${directChips}</div>` : ""}</div>`;
      actionsCell = `${isEditing
          ? `<button type="button" class="small cancel-edit-btn" data-direct-payment-cancel="${item.id}">Cancelar</button>`
          : `<button type="button" class="small" data-direct-payment-add="${item.id}" title="Registrar pago en efectivo o transferencia">+ Pago directo</button>`}
        <button type="button" data-delete-invoice="${item.id}" title="Eliminar">Borrar</button>`;
      estadoCell = `<span class="status ${item.status}">${item.status}</span>`;
    }

    return `<tr>
      <td>${item.type === "client" ? "Cliente" : "Proveedor"}</td>
      <td>${escapeHtml(entity)}</td>
      <td>${escapeHtml(location)}</td>
      <td>${escapeHtml(item.number)}</td>
      <td>${ocCell}</td>
      <td>${fmtDDMMYY(item.issueDate)}</td>
      <td>${nDeliveries} remito(s)</td>
      <td>${chequeCell}</td>
      <td>${pagoCell}</td>
      <td class="num">${money(item.amountGross)}</td>
      <td class="num">${money(neto)}</td>
      <td>${estadoCell}</td>
      <td>${actionsCell}</td>
    </tr>`;
  }).join("");
}

// Ordenar Facturas: click en cualquier header ordenable. Si ya estaba
// ordenado por esa misma columna, invierte el sentido en vez de resetear.
document.body.addEventListener("click", (event) => {
  const sortTh = event.target.closest("th[data-sort-field]");
  if (!sortTh) return;
  const field = sortTh.dataset.sortField;
  if (invoiceSort.field === field) {
    invoiceSort = { field, dir: invoiceSort.dir === "asc" ? "desc" : "asc" };
  } else {
    invoiceSort = { field, dir: "asc" };
  }
  renderInvoices();
});

function renderGroup(selector, rows, keyFn, valueFn) {
  const map = new Map();
  rows.forEach((item) => {
    const key = keyFn(item);
    const value = valueFn(totalsFor(item));
    map.set(key, (map.get(key) || 0) + value);
  });
  const body = [...map.entries()].sort((a, b) => b[1] - a[1]);
  $(selector).innerHTML = body.length
    ? body.map(([name, value]) => `<tr><td>${escapeHtml(name)}</td><td class="num">${money(value)}</td></tr>`).join("")
    : `<tr><td class="empty">Sin datos.</td></tr>`;
}

function cycleLabel(value) {
  return ({ weekly: "Semanal", monthly: "Mensual", po: "Orden de compra" })[value] || value;
}

function empty(cols) {
  return `<tr><td colspan="${cols}" class="empty">Sin datos para el filtro actual.</td></tr>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
}

function formValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function addFromForm(form, collectionName, build) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const item = build(formValues(form));
    if (item === null) return; // build() puede cancelar (ej: duplicado rechazado)
    state[collectionName].push(item);
    form.reset();
    setDefaultDates();
    render();
  });
}

function setDefaultDates() {
  const today = new Date().toISOString().slice(0, 10);
  document.querySelectorAll('input[type="date"]').forEach((input) => {
    if (!input.value) input.value = today;
  });
}

function $(selector) {
  return document.querySelector(selector);
}

document.querySelectorAll(".tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tabs button, .panel").forEach((el) => el.classList.remove("active"));
    button.classList.add("active");
    $(`#${button.dataset.tab}`).classList.add("active");
  });
});

function toggleWeekStartDayField() {
  const cycle = $("#clientBillingCycle").value;
  $("#weekStartDayWrap").classList.toggle("is-hidden", cycle !== "weekly");
}
$("#clientBillingCycle").addEventListener("change", toggleWeekStartDayField);
toggleWeekStartDayField();

/** Muestra el campo "N° OC" solo cuando el cliente elegido factura por orden de compra — para no meterle ruido a los clientes semanales/mensuales. */
function toggleOcVisibility(form) {
  const ocWrap = form.querySelector(".oc-wrap");
  if (!ocWrap) return;
  const client = byId(state.clients, form.elements.clientId?.value);
  ocWrap.classList.toggle("is-hidden", client?.billingCycle !== "po");
}

["#monthFilter", "#clientFilter", "#providerFilter", "#locationFilter", "#weekFilter"].forEach((selector) => {
  $(selector).addEventListener("change", render);
});

["#ruleLocationFilter", "#ruleProductFilter"].forEach((selector) => {
  $(selector).addEventListener("change", renderRules);
});

["#invoiceLocationFilter", "#invoiceTypeFilter"].forEach((selector) => {
  $(selector).addEventListener("change", renderInvoices);
});
$("#invoiceSearch").addEventListener("input", renderInvoices);

["#deliveryForm", "#ruleForm", "#clientInvoiceForm", "#providerInvoiceForm"].forEach((selector) => {
  const form = $(selector);
  form.elements.clientId.addEventListener("change", () => {
    filterLocationSelectByClient(form);
    toggleOcVisibility(form);
  });
});

/**
 * Arma el listado de remitos candidatos (con checkbox) para las 2 facturas.
 * Se recalcula cada vez que cambia cliente/sala/proveedor, o cuando se
 * tilda/destilda un remito puntual.
 */
/** Recorta una lista de remitos candidatos a los de una semana puntual (si se cargó el filtro). */
/**
 * Antes exigía coincidencia exacta del texto contra el número de semana
 * ("31" andaba, "Semana 31" no) — y como el reporte de al lado SÍ te
 * muestra el período como "Semana 31 (28/07 - 03/08)", era muy fácil
 * escribir eso mismo acá y que el filtro no encontrara nada, dando la
 * falsa idea de que no había remitos para facturar. Ahora normaliza:
 * saca espacios de más, ignora mayúsculas/minúsculas, y le da lo mismo
 * "31", "Semana 31" o "semana31".
 */
function normalizeWeekFilterText(text) {
  return String(text).trim().toLowerCase().replace(/^semana\s*/, "").trim();
}

function filterByWeek(candidates, weekFilter) {
  if (weekFilter === undefined || weekFilter === "") return candidates;
  const target = normalizeWeekFilterText(weekFilter);
  if (target === "") return candidates;
  return candidates.filter((item) => normalizeWeekFilterText(periodKeyFor(item)) === target);
}

/**
 * Si los remitos tildados para la factura de cliente ya traen una OC
 * anotada (todos la misma), se la sugiere en el campo — sin pisar lo que
 * el usuario ya haya tipeado a mano. Así el "matchear a mano contra el
 * Drive" desaparece: si anotaste la OC al cargar el remito, ya está lista
 * acá cuando armás la factura.
 */
function suggestOcForClientInvoice(selectedDeliveries) {
  const ocInput = $("#clientInvoiceForm").elements.ocNumber;
  if (!ocInput || ocInput.value.trim()) return; // no pisar lo que el usuario ya escribió
  const ocs = new Set(selectedDeliveries.map((d) => (d.ocNumber || "").trim()).filter(Boolean));
  if (ocs.size === 1) ocInput.value = [...ocs][0];
}

function renderInvoicePickers() {
  renderPicker({
    containerSelector: "#clientInvoicePicker",
    totalSelector: "#clientInvoiceTotal",
    form: $("#clientInvoiceForm"),
    getCandidates: (data) => {
      if (!data.clientId || !data.locationId) return [];
      const candidates = candidateDeliveries({ clientId: data.clientId, locationId: data.locationId, mode: "client" });
      return filterByWeek(candidates, data.weekFilter);
    },
    valueFn: (t) => t.saleNet,
    emptyMessage: "No hay remitos pendientes de facturar para esta sala.",
    onSelectionChange: suggestOcForClientInvoice
  });

  renderPicker({
    containerSelector: "#providerInvoicePicker",
    totalSelector: "#providerInvoiceTotal",
    form: $("#providerInvoiceForm"),
    getCandidates: (data) => {
      if (!data.clientId || !data.providerId) return [];
      const candidates = candidateDeliveries({ clientId: data.clientId, locationId: data.locationId, providerId: data.providerId, mode: "provider" });
      return filterByWeek(candidates, data.weekFilter);
    },
    valueFn: (t) => t.providerNet,
    rateFn: (item) => providerIvaRate(item.providerId),
    showLocation: true,
    emptyMessage: "No hay remitos listos para este proveedor todavía — recordá que primero tiene que estar cobrada la factura del cliente."
  });
}

function renderPicker({ containerSelector, totalSelector, form, getCandidates, valueFn, emptyMessage, onSelectionChange, showLocation, rateFn = () => IVA_RATE }) {
  const container = $(containerSelector);
  const data = formValues(form);
  const candidates = getCandidates(data);

  if (!candidates.length) {
    container.innerHTML = `<p class="picker-empty">${emptyMessage || "No hay remitos pendientes para esta selección."}</p>`;
    $(totalSelector).textContent = money(0);
    return;
  }

  container.innerHTML = `<table class="picker-table">
    <thead><tr><th></th><th>Fecha</th>${showLocation ? "<th>Sala</th>" : ""}<th>Sem./OC</th><th>Remito</th><th>Producto</th><th class="num">Cant.</th><th class="num">Monto</th></tr></thead>
    <tbody>
      ${candidates.map((item) => {
        const t = totalsFor(item);
        const product = byId(state.products, item.productId)?.name || "";
        const locationCell = showLocation ? `<td>${escapeHtml(byId(state.locations, item.locationId)?.name || "-")}</td>` : "";
        return `<tr>
          <td><input type="checkbox" class="picker-check" data-picker-id="${item.id}" checked /></td>
          <td>${fmtDDMMYY(item.date)}</td>
          ${locationCell}
          <td title="${escapeHtml(periodLabelFor(item))}">${escapeHtml(weekShortLabel(item))}</td>
          <td>${escapeHtml(item.receiptNo)}</td>
          <td>${escapeHtml(product)}</td>
          <td class="num">${Number(item.quantity).toLocaleString("es-AR")}</td>
          <td class="num">${money(valueFn(t) * (1 + rateFn(item)))}</td>
        </tr>`;
      }).join("")}
    </tbody>
  </table>`;

  const recompute = () => {
    const checked = [...container.querySelectorAll(".picker-check:checked")].map((el) => el.dataset.pickerId);
    const selected = candidates.filter((item) => checked.includes(item.id));
    const total = selected.reduce((sum, item) => sum + valueFn(totalsFor(item)) * (1 + rateFn(item)), 0);
    $(totalSelector).textContent = money(total);
    form.dataset.selectedIds = JSON.stringify(checked);
    form.dataset.computedTotal = total.toFixed(2);
    onSelectionChange?.(selected);
  };
  container.querySelectorAll(".picker-check").forEach((el) => el.addEventListener("change", recompute));
  recompute();
  container._recompute = recompute;
}

/** Marcar/Desmarcar todos los remitos visibles en un picker de un solo click — para cargar facturas viejas sin destildar uno por uno. */
document.body.addEventListener("click", (event) => {
  const selectAllId = event.target.dataset?.selectAll;
  const selectNoneId = event.target.dataset?.selectNone;
  if (!selectAllId && !selectNoneId) return;
  const container = document.getElementById(selectAllId || selectNoneId);
  if (!container) return;
  const checked = Boolean(selectAllId);
  container.querySelectorAll(".picker-check").forEach((el) => {
    el.checked = checked;
  });
  container._recompute?.();
});

["#clientInvoiceForm", "#providerInvoiceForm"].forEach((selector) => {
  const form = $(selector);
  // OJO: escuchar "change" sobre el <form> entero (como estaba antes) rompía
  // los checkboxes de remitos, porque el click en un checkbox burbujea hasta
  // el form y disparaba renderInvoicePickers() de nuevo, que reconstruye la
  // tabla y vuelve a tildar todo. Por eso los tildes "no se guardaban".
  // Escuchamos puntualmente los selects que sí deben recalcular candidatos.
  ["clientId", "locationId", "providerId"].forEach((field) => {
    form.elements[field]?.addEventListener("change", () => {
      // al cambiar de sala/cliente, cualquier OC autosugerida para la
      // sala anterior deja de tener sentido — se limpia para que la
      // próxima tanda de remitos tildados pueda sugerir la suya propia.
      if (selector === "#clientInvoiceForm" && (field === "clientId" || field === "locationId") && form.elements.ocNumber) {
        form.elements.ocNumber.value = "";
      }
      renderInvoicePickers();
    });
  });
  form.elements.weekFilter?.addEventListener("input", renderInvoicePickers);
});

/** Chequeo de duplicados: mismo proveedor + N de remito + sala + producto ya cargado. */
function findDuplicateDelivery(v) {
  return state.deliveries.find((item) =>
    item.providerId === v.providerId &&
    item.receiptNo.trim().toLowerCase() === v.receiptNo.trim().toLowerCase() &&
    item.locationId === v.locationId &&
    item.productId === v.productId
  );
}

addFromForm($("#deliveryForm"), "deliveries", (v) => {
  const dup = findDuplicateDelivery(v);
  if (dup) {
    const product = byId(state.products, dup.productId)?.name || "";
    const loc = byId(state.locations, dup.locationId)?.name || "";
    const confirmMsg = `Ya existe un remito ${dup.receiptNo} de este proveedor para ${loc} / ${product}, con ${dup.quantity} unidades, fecha ${fmtDDMMYY(dup.date)}.\n\n¿Cargar igual (por ejemplo, es una corrección real)?`;
    if (!confirm(confirmMsg)) return null;
  }
  return {
    id: cryptoId(),
    date: v.date,
    receiptNo: v.receiptNo,
    clientId: v.clientId,
    locationId: v.locationId,
    providerId: v.providerId,
    productId: v.productId,
    quantity: Number(v.quantity),
    note: v.note,
    billingMode: v.billingMode || "NORMAL",
    ocNumber: (v.ocNumber || "").trim()
  };
});

addFromForm($("#ruleForm"), "priceRules", (v) => {
  const salePrice = Number(v.salePrice);
  // "hasCost" = Yamila tipeó el costo real (no el campo espejo autocompletado
  // por sincronización). Si tipeó el %, aunque el costo también tenga un
  // valor en pantalla, ese valor es solo un espejo redondeado — no se guarda
  // como fuente de verdad.
  const lastEdited = $("#ruleForm").dataset.lastEditedField;
  const hasCost = lastEdited === "cost" && v.providerCost !== undefined && v.providerCost !== "";
  const providerCost = hasCost ? round2(Number(v.providerCost)) : undefined;
  // Si cargó el costo real del proveedor, ESE es el dato que se guarda y el
  // que se usa después para calcular plata (totalsFor) — nunca se
  // reconstruye multiplicando por un % redondeado, por chico que sea el
  // redondeo, porque con cantidades grandes esos centavos se notan. La
  // comisión % se calcula igual, pero queda solo de referencia/visual.
  const commissionPct = hasCost
    ? round4(commissionFromCost(salePrice, providerCost))
    : round4(Number(v.commissionPct || 0));
  const built = {
    id: cryptoId(),
    clientId: v.clientId,
    locationId: v.locationId,
    providerId: v.providerId,
    productId: v.productId,
    salePrice,
    commissionPct,
    validFrom: v.validFrom
  };
  if (hasCost) built.providerCost = providerCost;
  return built;
});

/**
 * Sincroniza en vivo Costo proveedor <-> Comision % en el form de precios,
 * para que Yamila pueda cargar el que tenga a mano y el otro se calcule
 * solo, con precisión completa (no a mano con calculadora). Guarda además
 * cuál de los dos campos fue el que ella tipeó realmente (el otro se
 * autocompleta como espejo) — el submit handler necesita saber esto para
 * no terminar guardando el valor redondeado del campo espejo como si fuera
 * el dato real.
 */
(function setupRuleCostSync() {
  const form = $("#ruleForm");
  if (!form) return;
  const saleInput = form.querySelector('[name="salePrice"]');
  const costInput = form.querySelector('[name="providerCost"]');
  const pctInput = form.querySelector('[name="commissionPct"]');
  if (!saleInput || !costInput || !pctInput) return;

  costInput.addEventListener("input", () => {
    form.dataset.lastEditedField = "cost";
    const sale = Number(saleInput.value);
    const cost = Number(costInput.value);
    if (sale > 0 && costInput.value !== "") {
      pctInput.value = round4(commissionFromCost(sale, cost));
    }
  });

  pctInput.addEventListener("input", () => {
    form.dataset.lastEditedField = "pct";
    const sale = Number(saleInput.value);
    const pct = Number(pctInput.value);
    if (sale > 0 && pctInput.value !== "") {
      costInput.value = round2(sale * (1 - pct / 100));
    }
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      costInput.value = "";
      delete form.dataset.lastEditedField;
    }, 0);
  });
})();

/**
 * Como addFromForm, pero si el form tiene un editingId activo, actualiza
 * el item existente en vez de agregar uno nuevo — y nunca le cambia el id
 * (rompería todo lo que ya lo referencia: salas, remitos, facturas...).
 */
function addOrEditFromForm(form, collectionName, build, submitLabelDefault) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const editingId = form.dataset.editingId || null;
    const item = build(formValues(form), editingId);
    if (item === null) return;
    if (editingId) {
      const idx = state[collectionName].findIndex((i) => i.id === editingId);
      if (idx !== -1) state[collectionName][idx] = item;
      exitEditMode(form, submitLabelDefault);
    } else {
      state[collectionName].push(item);
    }
    form.reset();
    toggleWeekStartDayField();
    render();
  });

  const cancelBtn = form.querySelector(".cancel-edit-btn");
  if (cancelBtn) cancelBtn.addEventListener("click", () => {
    form.reset();
    toggleWeekStartDayField();
    exitEditMode(form, submitLabelDefault);
  });
}

function enterEditMode(form, submitLabel, editingId) {
  form.dataset.editingId = editingId;
  form.querySelector('button[type="submit"]').textContent = submitLabel;
  form.querySelector(".cancel-edit-btn")?.classList.remove("is-hidden");
}

function exitEditMode(form, submitLabelDefault) {
  delete form.dataset.editingId;
  form.querySelector('button[type="submit"]').textContent = submitLabelDefault;
  form.querySelector(".cancel-edit-btn")?.classList.add("is-hidden");
}

addOrEditFromForm($("#providerForm"), "providers", (v, editingId) => ({
  id: editingId || slug(v.name),
  name: v.name,
  taxId: v.taxId,
  ivaRatePct: Number(v.ivaRatePct) || 21
}), "Agregar proveedor");

addOrEditFromForm($("#clientForm"), "clients", (v, editingId) => ({
  id: editingId || slug(v.name),
  name: v.name,
  billingCycle: v.billingCycle,
  weekStartDay: v.billingCycle === "weekly" ? Number(v.weekStartDay ?? 6) : undefined
}), "Agregar cliente");

addOrEditFromForm($("#locationForm"), "locations", (v, editingId) => ({
  id: editingId || slug(`${v.clientId}-${v.name}`),
  clientId: v.clientId,
  name: v.name
}), "Agregar sala");

addOrEditFromForm($("#productForm"), "products", (v, editingId) => ({
  id: editingId || slug(v.name),
  name: v.name,
  unit: v.unit
}), "Agregar producto");

document.body.addEventListener("click", (event) => {
  const deleteProviderId = event.target.dataset?.deleteProvider;
  const deleteClientId = event.target.dataset?.deleteClient;
  const deleteLocationId = event.target.dataset?.deleteLocation;
  const deleteProductId = event.target.dataset?.deleteProduct;
  if (deleteProviderId) {
    const item = byId(state.providers, deleteProviderId);
    tryDeleteCatalogItem("provider", deleteProviderId, "providers", item?.name || deleteProviderId);
  }
  if (deleteClientId) {
    const item = byId(state.clients, deleteClientId);
    tryDeleteCatalogItem("client", deleteClientId, "clients", item?.name || deleteClientId);
  }
  if (deleteLocationId) {
    const item = byId(state.locations, deleteLocationId);
    tryDeleteCatalogItem("location", deleteLocationId, "locations", item?.name || deleteLocationId);
  }
  if (deleteProductId) {
    const item = byId(state.products, deleteProductId);
    tryDeleteCatalogItem("product", deleteProductId, "products", item?.name || deleteProductId);
  }
});

document.body.addEventListener("click", (event) => {
  const providerId = event.target.dataset?.editProvider;
  const clientId = event.target.dataset?.editClient;
  const locationId = event.target.dataset?.editLocation;
  const productId = event.target.dataset?.editProduct;

  if (providerId) {
    const item = byId(state.providers, providerId);
    const form = $("#providerForm");
    form.elements.name.value = item.name;
    form.elements.taxId.value = item.taxId || "";
    form.elements.ivaRatePct.value = String(item.ivaRatePct ?? 21);
    enterEditMode(form, "Guardar cambios", providerId);
  }
  if (clientId) {
    const item = byId(state.clients, clientId);
    const form = $("#clientForm");
    form.elements.name.value = item.name;
    form.elements.billingCycle.value = item.billingCycle;
    if (item.weekStartDay !== undefined) form.elements.weekStartDay.value = item.weekStartDay;
    toggleWeekStartDayField();
    enterEditMode(form, "Guardar cambios", clientId);
  }
  if (locationId) {
    const item = byId(state.locations, locationId);
    const form = $("#locationForm");
    form.elements.clientId.value = item.clientId;
    form.elements.name.value = item.name;
    enterEditMode(form, "Guardar cambios", locationId);
  }
  if (productId) {
    const item = byId(state.products, productId);
    const form = $("#productForm");
    form.elements.name.value = item.name;
    form.elements.unit.value = item.unit;
    enterEditMode(form, "Guardar cambios", productId);
  }
});

addFromForm($("#clientInvoiceForm"), "invoices", (v) => {
  const ids = JSON.parse($("#clientInvoiceForm").dataset.selectedIds || "[]");
  const computedTotal = Number($("#clientInvoiceForm").dataset.computedTotal || 0);
  if (!ids.length) {
    alert("Tildá al menos un remito para vincular a esta factura.");
    return null;
  }
  // Si no se tipeó una OC a mano pero todos los remitos tildados ya
  // comparten una, se usa esa como red de seguridad (además del
  // autocompletado que ya corre en vivo en el picker).
  let ocNumber = (v.ocNumber || "").trim();
  if (!ocNumber) {
    const ocs = new Set(ids.map((id) => (byId(state.deliveries, id)?.ocNumber || "").trim()).filter(Boolean));
    if (ocs.size === 1) ocNumber = [...ocs][0];
  }
  // Pegar la OC de vuelta en los remitos que todavía no la tenían anotada
  // — así queda prolija para la próxima vez que se mire esta sala, sin
  // depender de que se haya anotado a tiempo.
  if (ocNumber) {
    ids.forEach((id) => {
      const d = byId(state.deliveries, id);
      if (d && !d.ocNumber) d.ocNumber = ocNumber;
    });
  }
  return {
    id: cryptoId(),
    type: "client",
    clientId: v.clientId,
    locationId: v.locationId,
    providerId: "",
    deliveryIds: ids,
    number: v.number,
    issueDate: v.issueDate,
    paymentDate: "",
    amountGross: computedTotal,
    status: "PENDIENTE",
    ocNumber
  };
});

addFromForm($("#providerInvoiceForm"), "invoices", (v) => {
  const ids = JSON.parse($("#providerInvoiceForm").dataset.selectedIds || "[]");
  const computedTotal = Number($("#providerInvoiceForm").dataset.computedTotal || 0);
  if (!ids.length) {
    alert("Tildá al menos un remito para vincular a esta factura.");
    return null;
  }
  return {
    id: cryptoId(),
    type: "provider",
    clientId: v.clientId,
    locationId: v.locationId,
    providerId: v.providerId,
    deliveryIds: ids,
    number: v.number,
    issueDate: v.issueDate,
    paymentDate: "",
    amountGross: computedTotal,
    // Alícuota con la que se calculó amountGross, congelada: si después
    // cambia la ficha del proveedor, esta factura no se mueve.
    ivaRatePct: round2(providerIvaRate(v.providerId) * 100),
    status: "PENDIENTE"
  };
});

/** Anotar la OC de un remito directamente en la tabla, apenas te la mandan — sin esperar a facturar. */
document.body.addEventListener("change", (event) => {
  const ocDeliveryId = event.target.dataset?.ocDelivery;
  const ocInvoiceId = event.target.dataset?.ocInvoice;
  const billingModeDeliveryId = event.target.dataset?.billingModeDelivery;
  if (ocDeliveryId) {
    const item = byId(state.deliveries, ocDeliveryId);
    if (item) {
      item.ocNumber = event.target.value.trim();
      render();
    }
  }
  if (ocInvoiceId) {
    const item = byId(state.invoices, ocInvoiceId);
    if (item) {
      item.ocNumber = event.target.value.trim();
      render();
    }
  }
  if (billingModeDeliveryId) {
    const item = byId(state.deliveries, billingModeDeliveryId);
    if (item) {
      // Si el remito ya estaba facturado (a cliente y/o proveedor) y lo
      // marcás como devolución ahora, avisamos — porque las facturas ya
      // emitidas no se tocan solas, y puede quedar una factura vieja
      // incluyendo un remito que ahora decís que no se cobra.
      const already = deliveryStatus(item.id);
      const newMode = event.target.value;
      if (newMode !== "NORMAL" && already !== "PENDIENTE" && already !== "SIN_COBRO") {
        if (!confirm(`Este remito ya está en estado "${deliveryStatusLabel(already)}" (ya tiene alguna factura). Marcarlo como devolución ahora NO va a modificar ninguna factura ya emitida — solo afecta a las próximas. ¿Seguís igual?`)) {
          render(); // repinta para volver el <select> a su valor anterior
          return;
        }
      }
      item.billingMode = newMode;
      render();
    }
  }
});

document.body.addEventListener("click", (event) => {
  const deliveryId = event.target.dataset?.deleteDelivery;
  const ruleId = event.target.dataset?.deleteRule;
  const invoiceId = event.target.dataset?.deleteInvoice;
  const expenseId = event.target.dataset?.deleteExpense;
  const chequeId = event.target.dataset?.saveCheque;
  if (chequeId) {
    const invoiceItem = state.invoices.find((item) => item.id === chequeId);
    const numeroInput = document.querySelector(`input[data-cheque-numero="${chequeId}"]`);
    const fechaInput = document.querySelector(`input[data-cheque-fecha="${chequeId}"]`);
    const ordenPagoInput = document.querySelector(`input[data-orden-pago="${chequeId}"]`);
    if (invoiceItem) {
      invoiceItem.chequeNumero = numeroInput?.value || "";
      invoiceItem.chequeFechaRecepcion = fechaInput?.value || "";
      invoiceItem.ordenPago = ordenPagoInput?.value || "";
      render();
    }
  }
  if (expenseId) {
    state.expenses = state.expenses.filter((item) => item.id !== expenseId);
    render();
  }
  const ivaDeleteId = event.target.dataset?.deleteIva;
  const ivaEditId = event.target.dataset?.editIva;
  if (ivaDeleteId) {
    const item = (state.ivaPeriods || []).find((x) => x.id === ivaDeleteId);
    if (item && confirm(`¿Borrar la declaración de IVA de ${item.period}?`)) {
      state.ivaPeriods = (state.ivaPeriods || []).filter((x) => x.id !== ivaDeleteId);
      render();
    }
  }
  if (ivaEditId) {
    const item = (state.ivaPeriods || []).find((x) => x.id === ivaEditId);
    const form = $("#ivaPeriodForm");
    if (item && form) {
      const set = (name, value) => { form.elements[name].value = value === null || value === undefined ? "" : value; };
      set("period", item.period);
      set("debito", item.debito);
      set("credito", item.credito);
      set("retenciones", item.retenciones);
      set("usos", item.usos || "");
      set("saldoPrevio", item.saldoPrevio);
      set("saldoDDJJ", item.saldoDDJJ);
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
  if (deliveryId) {
    if (clientInvoicedDeliveryIds().has(deliveryId) || providerInvoicedDeliveryIds().has(deliveryId)) {
      alert("Este remito ya está vinculado a una factura — no se puede borrar así nomás. Primero borrá o corregí esa factura desde la pestaña Facturas.");
      return;
    }
    state.deliveries = state.deliveries.filter((item) => item.id !== deliveryId);
    render();
  }
  if (ruleId) {
    state.priceRules = state.priceRules.filter((item) => item.id !== ruleId);
    render();
  }
  if (invoiceId) {
    // Si es una factura de proveedor con cheques endosados (total o
    // parcialmente), se le saca a cada cheque solo la porción que tenía
    // asignada a ESTA factura — el resto de sus asignaciones a otras
    // facturas queda intacto. El cheque recalcula su estado según cuánto
    // saldo le quede sin asignar.
    state.checks.forEach((c) => {
      if (!(c.allocations || []).some((a) => a.invoiceId === invoiceId)) return;
      c.allocations = c.allocations.filter((a) => a.invoiceId !== invoiceId);
      if (!c.allocations.length) {
        c.status = "RECIBIDO";
      } else {
        c.status = checkRemaining(c) > 0 ? "ENDOSADO_PARCIAL" : "ENDOSADO";
      }
    });
    state.directPayments = (state.directPayments || []).filter((p) => p.invoiceId !== invoiceId);
    state.invoices = state.invoices.filter((item) => item.id !== invoiceId);
    render();
  }
  const addPaymentId = event.target.dataset?.directPaymentAdd;
  if (addPaymentId) {
    editingDirectPaymentInvoiceId = addPaymentId;
    renderInvoices();
    return;
  }
  const cancelPaymentId = event.target.dataset?.directPaymentCancel;
  if (cancelPaymentId) {
    editingDirectPaymentInvoiceId = null;
    renderInvoices();
    return;
  }
  const savePaymentInvoiceId = event.target.dataset?.directPaymentSave;
  if (savePaymentInvoiceId) {
    const fields = {};
    document.querySelectorAll(`[data-direct-payment-invoice="${savePaymentInvoiceId}"]`).forEach((input) => {
      fields[input.dataset.directPaymentField] = input.value;
    });
    if (!fields.fecha || !fields.monto || Number(fields.monto) <= 0) {
      alert("Completá fecha y monto antes de guardar el pago.");
      return;
    }
    state.directPayments = state.directPayments || [];
    state.directPayments.push({
      id: cryptoId(),
      invoiceId: savePaymentInvoiceId,
      invoiceType: "provider",
      fecha: fields.fecha,
      monto: Number(fields.monto),
      medio: fields.medio === "EFECTIVO" ? "EFECTIVO" : "TRANSFERENCIA"
    });
    editingDirectPaymentInvoiceId = null;
    render();
    return;
  }
  const deleteDirectPaymentId = event.target.dataset?.deleteDirectPayment;
  if (deleteDirectPaymentId) {
    if (!confirm("¿Borrar este pago directo?")) return;
    state.directPayments = (state.directPayments || []).filter((p) => p.id !== deleteDirectPaymentId);
    render();
    return;
  }
});

$("#exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hojaldra-admin-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

/**
 * Fusiona un JSON importado con lo que ya está cargado, EN VEZ de
 * reemplazar todo. Pensado para subir los masters sala por sala sin
 * pisar lo anterior.
 *  - Catálogos (proveedores/clientes/salas/productos): si el id ya
 *    existe, se deja el que ya estaba (no se pisa) — así no rompe
 *    referencias existentes con datos distintos. Si es nuevo, se agrega.
 *  - Reglas de precio: se evita agregar una regla EXACTAMENTE igual
 *    (mismo cliente+sala+proveedor+producto+vigencia) dos veces.
 *  - Remitos: mismo criterio que ya usa la carga manual (proveedor +
 *    N remito + sala + producto) para no duplicar el mismo remito.
 *  - Facturas y gastos: se agregan por id (los ids son únicos random,
 *    solo chocarían si se importa el mismo archivo dos veces).
 * Devuelve un resumen de cuántos remitos se saltearon por duplicados.
 */
function mergeState(imported) {
  const summary = { addedDeliveries: 0, skippedDeliveries: 0, addedRules: 0, skippedRules: 0 };

  ["providers", "clients", "locations", "products"].forEach((key) => {
    const existingIds = new Set(state[key].map((item) => item.id));
    (imported[key] || []).forEach((item) => {
      if (!existingIds.has(item.id)) {
        state[key].push(item);
        existingIds.add(item.id);
      }
    });
  });

  const ruleKey = (r) => `${r.clientId}|${r.locationId}|${r.providerId}|${r.productId}|${r.validFrom}`;
  const existingRuleKeys = new Set(state.priceRules.map(ruleKey));
  (imported.priceRules || []).forEach((r) => {
    const key = ruleKey(r);
    if (!existingRuleKeys.has(key)) {
      state.priceRules.push(r);
      existingRuleKeys.add(key);
      summary.addedRules++;
    } else {
      summary.skippedRules++;
    }
  });

  const delivKey = (d) => `${d.providerId}|${String(d.receiptNo).trim().toLowerCase()}|${d.locationId}|${d.productId}`;
  const existingDelivKeys = new Set(state.deliveries.map(delivKey));
  (imported.deliveries || []).forEach((d) => {
    const key = delivKey(d);
    if (!existingDelivKeys.has(key)) {
      state.deliveries.push(d);
      existingDelivKeys.add(key);
      summary.addedDeliveries++;
    } else {
      summary.skippedDeliveries++;
    }
  });

  const existingInvoiceIds = new Set(state.invoices.map((i) => i.id));
  (imported.invoices || []).forEach((inv) => {
    if (!existingInvoiceIds.has(inv.id)) {
      state.invoices.push(inv);
      existingInvoiceIds.add(inv.id);
    }
  });

  const existingExpenseIds = new Set(state.expenses.map((e) => e.id));
  (imported.expenses || []).forEach((e) => {
    if (!existingExpenseIds.has(e.id)) {
      state.expenses.push(e);
      existingExpenseIds.add(e.id);
    }
  });

  const existingDirectPaymentIds = new Set((state.directPayments || []).map((p) => p.id));
  (imported.directPayments || []).forEach((p) => {
    if (!existingDirectPaymentIds.has(p.id)) {
      state.directPayments.push(p);
      existingDirectPaymentIds.add(p.id);
    }
  });

  // Declaraciones de IVA: se agregan solo los períodos que todavía no están cargados.
  const existingIvaPeriods = new Set((state.ivaPeriods || []).map((p) => p.period));
  (imported.ivaPeriods || []).forEach((p) => {
    if (!existingIvaPeriods.has(p.period)) {
      if (!Array.isArray(state.ivaPeriods)) state.ivaPeriods = [];
      state.ivaPeriods.push(p);
      existingIvaPeriods.add(p.period);
    }
  });

  return summary;
}

$("#importFile").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const imported = JSON.parse(await file.text());
  const mergeMode = $("#importMergeMode").checked;

  if (mergeMode) {
    const summary = mergeState(imported);
    render();
    alert(`Fusión completa.\n\nRemitos agregados: ${summary.addedDeliveries}${summary.skippedDeliveries ? ` (se saltearon ${summary.skippedDeliveries} por estar duplicados)` : ""}\nReglas de precio agregadas: ${summary.addedRules}${summary.skippedRules ? ` (se saltearon ${summary.skippedRules} por estar duplicadas)` : ""}`);
  } else {
    if (!confirm("Esto va a BORRAR todos los datos actuales y reemplazarlos por el archivo importado. ¿Seguro que querés reemplazar en vez de fusionar?")) {
      event.target.value = "";
      return;
    }
    allowShrinkOnce = true;
    state = imported;
    render();
  }
  event.target.value = "";
});

function slug(value) {
  const base = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  let candidate = base || cryptoId();
  const used = new Set([...state.providers, ...state.clients, ...state.locations, ...state.products].map((item) => item.id));
  while (used.has(candidate)) candidate = `${base}_${cryptoId().slice(0, 4)}`;
  return candidate;
}

async function boot() {
  setSyncStatus("cargando");
  state = await loadState();
  // Si la carga quedó frenada, no se renderiza nada: el cartel tapa todo
  // y render() terminaría llamando a saveState().
  if (saveBlockedReason) return;
  setupSessionUi();
  setDefaultDates();
  render();
}
boot();
