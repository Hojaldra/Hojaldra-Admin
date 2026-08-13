const IVA_RATE = 0.21;
const STORAGE_KEY = "hojaldra-admin-v4";

// --- Backend en Google Sheets / Apps Script ---
// Pegá acá la URL de tu implementación (termina en /exec) y el mismo token
// que pusiste en Code.gs. Mientras diga "REEMPLAZAR", la app sigue andando
// solo con localStorage (como hasta ahora), no se rompe nada.
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxtc0qqle_vhZc3qBhzSavyf1xhlypRDNj-PfD-aQWwnA31JKRa9NB_Wi-e7DRvO95k/exec";
const APPS_SCRIPT_TOKEN = "f2MmUefHnfBuwQLr9lEiCJAoWx-xwuNQMwClY6q4m-E";
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
    rule("aeroparque", "aep", "cp", "med_mt", 490, commissionFromCost(490, 380), "2026-01-01"),
    rule("aeroparque", "aep", "cp", "med_grasa", 490, commissionFromCost(490, 380), "2026-01-01"),
    rule("ezeiza", "ezemis", "cp", "med_mt", 490, commissionFromCost(490, 380), "2026-01-01"),
    rule("crossracer", "ameo", "cp", "med_mt", 520, commissionFromCost(520, 380), "2026-01-01"),
    rule("crossracer", "ameo", "cp", "sant_mt", 950, commissionFromCost(950, 825), "2026-01-01"),
    rule("crossracer", "ameo", "cp", "minion", 5400, commissionFromCost(5400, 4500), "2026-01-01"),
    rule("crossracer", "latam", "cp", "sant_mt", 950, commissionFromCost(950, 825), "2026-01-01"),
    rule("crossracer", "visa", "cp", "med_mt", 520, commissionFromCost(520, 380), "2026-01-01"),
    rule("crossracer", "bbva", "cp", "med_mt", 520, commissionFromCost(520, 380), "2026-01-01"),
    rule("crossracer", "star", "cp", "med_mt", 520, commissionFromCost(520, 380), "2026-01-01"),
    rule("crossracer", "ezeizalounge", "cp", "med_mt", 520, commissionFromCost(520, 380), "2026-01-01")
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
  expenses: [],
  openingBalance: 0
};

// state arranca con un placeholder; boot() lo reemplaza por la copia real
// (nube o local) antes del primer render(). Ningún formulario puede
// enviarse antes de eso porque los <select> están vacíos hasta el primer
// render() — así que no hay ventana real para pisar datos con el seed.
let state = structuredClone(seed);

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

// Todos los precios se expresan en una sola métrica: comisión % sobre la
// venta s/IVA. Los que antes venían como "costo proveedor" se convierten acá
// mismo: comisión% = (venta - costo) / venta * 100.
function rule(clientId, locationId, providerId, productId, salePrice, commissionPct, validFrom) {
  return { id: cryptoId(), clientId, locationId, providerId, productId, salePrice, commissionPct: round2(commissionPct), validFrom };
}

function commissionFromCost(salePrice, providerCost) {
  return ((salePrice - providerCost) / salePrice) * 100;
}

function round2(value) {
  return Math.round(Number(value) * 100) / 100;
}

function delivery(date, receiptNo, clientId, locationId, providerId, productId, quantity, note) {
  return { id: cryptoId(), date, receiptNo, clientId, locationId, providerId, productId, quantity, note };
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

  try {
    const url = `${APPS_SCRIPT_URL}?token=${encodeURIComponent(APPS_SCRIPT_TOKEN)}`;
    const json = await jsonpRequest(url);
    if (json.error) throw new Error(json.error);
    setSyncStatus("guardado", json.savedAt);
    return hydrate(json.data || cached);
  } catch (err) {
    console.error("No se pudo conectar con la nube, sigo con la copia local:", err);
    setSyncStatus("offline");
    return hydrate(cached);
  }
}

function hydrate(saved) {
  if (!saved || !Object.keys(saved).length) return structuredClone(seed);
  const merged = { ...structuredClone(seed), ...saved, invoices: saved.invoices || [], expenses: saved.expenses || [] };
  merged.priceRules = (merged.priceRules || []).map(migrateRuleToCommission);
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
 * Migración de datos viejos: si en localStorage todavía hay reglas con
 * marginMode "cost" (de antes de unificar la métrica), las convierte a
 * comisión % equivalente al vuelo, una sola vez.
 */
function migrateRuleToCommission(item) {
  if (item.marginMode === "cost") {
    const { marginMode, providerCost, ...rest } = item;
    return { ...rest, commissionPct: round2(commissionFromCost(item.salePrice, item.providerCost)) };
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  scheduleCloudSave();
}

let cloudSaveTimer = null;

function scheduleCloudSave() {
  if (!CLOUD_CONFIGURED) return;
  setSyncStatus("pendiente");
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(pushCloudState, 800);
}

async function pushCloudState() {
  setSyncStatus("guardando");
  try {
    submitHiddenForm(APPS_SCRIPT_URL, {
      token: APPS_SCRIPT_TOKEN,
      data: JSON.stringify(state)
    });
    // Sin confirmación directa posible (ver submitHiddenForm) — le damos
    // un instante a Apps Script para procesar y confirmamos releyendo.
    await wait(1200);
    const url = `${APPS_SCRIPT_URL}?token=${encodeURIComponent(APPS_SCRIPT_TOKEN)}`;
    const json = await jsonpRequest(url);
    if (json.error) throw new Error(json.error);
    setSyncStatus("guardado", json.savedAt);
  } catch (err) {
    console.error("No se pudo confirmar el guardado en la nube (probablemente igual se guardó, revisar la Sheet):", err);
    setSyncStatus("error");
  }
}

// Si se corta y vuelve la conexión, reintenta mandar lo último.
window.addEventListener("online", () => {
  if (CLOUD_CONFIGURED) pushCloudState();
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
    "offline": "Sin conexión — usando copia local",
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
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value || 0);
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

/** Periodo de un remito segun el ciclo de facturacion de SU cliente. */
function periodKeyFor(clientId, dateText) {
  const client = byId(state.clients, clientId);
  if (!client) return dateText;
  if (client.billingCycle === "monthly") return dateText.slice(0, 7);
  if (client.billingCycle === "po") return "";
  const weekStartDay = client.weekStartDay ?? 6;
  return String(weekNumberFor(dateText, weekStartDay));
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

function periodLabelFor(clientId, dateText) {
  const client = byId(state.clients, clientId);
  if (!client) return "";
  if (client.billingCycle === "monthly") return dateText.slice(0, 7);
  if (client.billingCycle === "po") return "Orden de compra";
  const weekStartDay = client.weekStartDay ?? 6;
  const { start, end } = weekBoundsFor(dateText, weekStartDay);
  return `Semana ${periodKeyFor(clientId, dateText)} (${fmtDDMM(start)} - ${fmtDDMM(end)})`;
}

function activeFilters() {
  return {
    month: $("#monthFilter").value,
    clientId: $("#clientFilter").value,
    providerId: $("#providerFilter").value,
    week: $("#weekFilter").value
  };
}

function filteredDeliveries() {
  const f = activeFilters();
  return state.deliveries.filter((item) => {
    const inMonth = !f.month || item.date.startsWith(f.month);
    const inClient = !f.clientId || item.clientId === f.clientId;
    const inProvider = !f.providerId || item.providerId === f.providerId;
    const inWeek = !f.week || periodKeyFor(item.clientId, item.date) === String(f.week);
    return inMonth && inClient && inProvider && inWeek;
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

function totalsFor(item) {
  const priceRule = latestRule(item);
  const quantity = Number(item.quantity) || 0;
  if (!priceRule) {
    return { saleNet: 0, providerNet: 0, profitNet: 0, ruleMissing: true };
  }
  const saleNet = quantity * Number(priceRule.salePrice || 0);
  const providerNet = saleNet * (1 - Number(priceRule.commissionPct || 0) / 100);
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

/** IDs de remito cuya factura de cliente ya está PAGA (recién ahí se le puede avisar al proveedor). */
function clientPaidDeliveryIds() {
  const set = new Set();
  state.invoices.forEach((inv) => {
    if (inv.type === "client" && inv.status === "PAGO") (inv.deliveryIds || []).forEach((id) => set.add(id));
  });
  return set;
}

/**
 * Estado de un remito puntual a lo largo de todo el circuito:
 * PENDIENTE -> FACTURADO (facturado al cliente, todavía no cobrado) ->
 * COBRADO (la sala ya pagó, esperando facturarle al proveedor) ->
 * PAGO (ya se le pagó al proveedor - circuito cerrado).
 */
function deliveryStatus(deliveryId) {
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
 * todavía. mode="provider": remitos cuya factura de CLIENTE ya está PAGA
 * (recién ahí se le puede avisar al proveedor) y que todavía no tienen
 * factura de proveedor.
 */
function candidateDeliveries({ clientId, locationId, providerId, mode }) {
  const excluded = mode === "provider" ? providerInvoicedDeliveryIds() : clientInvoicedDeliveryIds();
  const clientPaid = mode === "provider" ? clientPaidDeliveryIds() : null;
  return state.deliveries
    .filter((item) => {
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
    providerFilter: $("#providerFilter").value
  };

  fillSelects("provider", state.providers);
  fillSelects("client", state.clients);
  fillSelects("product", state.products);
  fillSelects("location", state.locations.map((loc) => ({
    ...loc,
    name: `${loc.name} (${byId(state.clients, loc.clientId)?.name || ""})`
  })));

  $("#clientFilter").innerHTML = `<option value="">Todos</option>${state.clients.map(optionHtml).join("")}`;
  $("#providerFilter").innerHTML = `<option value="">Todos</option>${state.providers.map(optionHtml).join("")}`;
  $("#clientFilter").value = selected.clientFilter;
  $("#providerFilter").value = selected.providerFilter;

  filterLocationSelectByClient($("#deliveryForm"));
  filterLocationSelectByClient($("#ruleForm"));
  filterLocationSelectByClient($("#clientInvoiceForm"));
  filterLocationSelectByClient($("#providerInvoiceForm"));
}

/** Cuando se elige un cliente en un formulario, la sala solo muestra las de ESE cliente. */
function filterLocationSelectByClient(form) {
  const clientSelect = form.elements.clientId;
  const locationSelect = form.elements.locationId;
  if (!clientSelect || !locationSelect) return;
  const clientId = clientSelect.value;
  const options = state.locations.filter((loc) => !clientId || loc.clientId === clientId);
  const current = locationSelect.value;
  locationSelect.innerHTML = `<option value="">Elegí...</option>` + options.map(optionHtml).join("");
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

function render() {
  renderOptions();
  renderDeliveries();
  renderRules();
  renderCatalogs();
  renderReports();
  renderInvoices();
  renderInvoicePickers();
  renderBalancePanel();
  renderExpenses();
  renderMonthlyTable();
  saveState();
}

function renderDeliveries() {
  const rows = filteredDeliveries();
  $("#deliveryRows").innerHTML = rows.length ? rows.map((item) => {
    const t = totalsFor(item);
    const client = byId(state.clients, item.clientId)?.name || "";
    const loc = byId(state.locations, item.locationId)?.name || "";
    const provider = byId(state.providers, item.providerId)?.name || "";
    const product = byId(state.products, item.productId)?.name || "";
    const status = deliveryStatus(item.id);
    const noteCell = item.note
      ? `<button type="button" class="note-icon" data-view-note="${item.id}" title="${escapeHtml(item.note)}">📝</button>`
      : "";
    return `<tr>
      <td>${item.date}</td>
      <td>${escapeHtml(periodLabelFor(item.clientId, item.date))}</td>
      <td>${escapeHtml(item.receiptNo)}</td>
      <td>${noteCell}</td>
      <td>${escapeHtml(client)}</td>
      <td>${escapeHtml(loc)}</td>
      <td>${escapeHtml(provider)}</td>
      <td>${escapeHtml(product)}${t.ruleMissing ? " *" : ""}</td>
      <td class="num">${Number(item.quantity).toLocaleString("es-AR")}</td>
      <td class="num">${money(t.saleNet)}</td>
      <td class="num">${money(t.providerNet)}</td>
      <td class="num">${money(t.profitNet)}</td>
      <td><span class="status ${status}">${deliveryStatusLabel(status)}</span></td>
      <td><button type="button" data-delete-delivery="${item.id}" title="Eliminar">Borrar</button></td>
    </tr>`;
  }).join("") : empty(14);

  const totals = rows.reduce((acc, item) => {
    const t = totalsFor(item);
    acc.saleNet += t.saleNet;
    acc.providerNet += t.providerNet;
    acc.profitNet += t.profitNet;
    return acc;
  }, { saleNet: 0, providerNet: 0, profitNet: 0 });

  $("#kpiRevenue").textContent = money(totals.saleNet * (1 + IVA_RATE));
  $("#kpiPayable").textContent = money(totals.providerNet * (1 + IVA_RATE));
  $("#kpiProfit").textContent = money(totals.profitNet);
  $("#kpiIva").textContent = money(totals.profitNet * IVA_RATE - retIvaForDeliveries(rows));
}

/** Retenciones de IVA ya confirmadas (facturas de cliente PAGO) que tocan a estos remitos. */
function retIvaForDeliveries(rows) {
  const ids = new Set(rows.map((r) => r.id));
  const relevant = state.invoices.filter((inv) =>
    inv.type === "client" && inv.status === "PAGO" && (inv.deliveryIds || []).some((id) => ids.has(id))
  );
  return relevant.reduce((sum, inv) => sum + Number(inv.retIva || 0), 0);
}

function renderRules() {
  $("#ruleRows").innerHTML = state.priceRules.map((item) => {
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
      <td class="num">${item.commissionPct}%</td>
      <td class="num">${money(item.salePrice * (1 - Number(item.commissionPct || 0) / 100))}</td>
      <td>${item.validFrom}</td>
      <td><button type="button" data-delete-rule="${item.id}" title="Eliminar">Borrar</button></td>
    </tr>`;
  }).join("");
}

function renderCatalogs() {
  $("#providerList").innerHTML = state.providers.map((item) =>
    `<li>${escapeHtml(item.name)} <button type="button" class="edit-btn" data-edit-provider="${item.id}">Editar</button></li>`
  ).join("");
  $("#clientList").innerHTML = state.clients.map((item) =>
    `<li>${escapeHtml(item.name)} - ${cycleLabel(item.billingCycle)}${item.billingCycle === "weekly" ? ` (arranca ${dayLabel(item.weekStartDay)})` : ""} <button type="button" class="edit-btn" data-edit-client="${item.id}">Editar</button></li>`
  ).join("");
  $("#locationList").innerHTML = state.locations.map((item) =>
    `<li>${escapeHtml(item.name)} - ${escapeHtml(byId(state.clients, item.clientId)?.name || "")} <button type="button" class="edit-btn" data-edit-location="${item.id}">Editar</button></li>`
  ).join("");
  $("#productList").innerHTML = state.products.map((item) =>
    `<li>${escapeHtml(item.name)} - ${escapeHtml(item.unit)} <button type="button" class="edit-btn" data-edit-product="${item.id}">Editar</button></li>`
  ).join("");
}

function deliveryStatusLabel(status) {
  return ({ PENDIENTE: "PENDIENTE", FACTURADO: "FACTURADO", COBRADO: "COBRADO", PROV_PENDIENTE: "PROV. PENDIENTE", PAGO: "PAGO" })[status] || status;
}

function dayLabel(day) {
  return ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"][day] || "sabado";
}

function renderReports() {
  const rows = filteredDeliveries();
  renderSalaWeekRows(rows);
  $("#reportGridFilterLabel").textContent = "Mostrando: " + activeFiltersLabel();
  renderGroup("#receivableRows", rows, (item) => byId(state.clients, item.clientId)?.name || "", (t) => t.saleNet * (1 + IVA_RATE));
  renderProviderPayables(rows);
  renderGroup("#profitRows", rows, (item) => byId(state.locations, item.locationId)?.name || "", (t) => t.profitNet);
}

/** Texto legible de qué filtros del toolbar de arriba están afectando estos 3 resúmenes. */
function activeFiltersLabel() {
  const f = activeFilters();
  const parts = [];
  parts.push(f.month ? `mes ${f.month}` : "todos los meses (acumulado)");
  if (f.clientId) parts.push(`cliente ${byId(state.clients, f.clientId)?.name || f.clientId}`);
  if (f.providerId) parts.push(`proveedor ${byId(state.providers, f.providerId)?.name || f.providerId}`);
  if (f.week) parts.push(`semana ${f.week}`);
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
    const period = periodLabelFor(item.clientId, item.date);
    const key = `${item.clientId}|${item.locationId}|${periodKeyFor(item.clientId, item.date)}`;
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
        `${escapeHtml(inv.number)}<br><span class="cell-sub">${money(inv.amountGross)}${inv.paymentDate ? ` · pagado ${inv.paymentDate}` : " · sin cobrar"}</span>`
      ).join("<hr class=\"cell-sep\">") + (sinFacturar ? `<br><span class="cell-sub">+ ${sinFacturar} remito(s) sin facturar todavía</span>` : "")
    : `<span class="cell-sub">sin facturar</span>`;

  const providerCell = providerInvoices.length
    ? providerInvoices.map((inv) =>
        `${escapeHtml(inv.number)}<br><span class="cell-sub">${money(inv.amountGross)}${inv.paymentDate ? ` · pagado ${inv.paymentDate}` : " · sin pagar"}</span>`
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
  clientSelect.innerHTML = `<option value="">Elegí...</option>` + state.clients.map(optionHtml).join("");
  if (state.clients.some((c) => c.id === prevClient)) clientSelect.value = prevClient;
  const clientId = clientSelect.value;

  const prevLocation = locationSelect.value;
  const locations = state.locations.filter((loc) => !clientId || loc.clientId === clientId);
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
        const key = periodKeyFor(d.clientId, d.date);
        if (!seen.has(key)) seen.set(key, periodLabelFor(d.clientId, d.date));
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
    d.clientId === clientId && d.locationId === locationId && periodKeyFor(d.clientId, d.date) === period
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
  const clientInvoice = state.invoices.find((inv) => inv.type === "client" && allIds.some((id) => (inv.deliveryIds || []).includes(id)));

  const rows = [...byProduct.entries()].map(([productId, data]) => {
    const productName = byId(state.products, productId)?.name || "";
    return { productName, ...data };
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
      <td>${clientInvoice ? escapeHtml(clientInvoice.number) : ""}</td>
    </tr>`).join("")}
    <tr><th>TOTAL</th><th class="num">${totalQty.toLocaleString("es-AR")}</th><th class="num">${money(totalSale)}</th><th class="num">${money(totalSale * (1 + IVA_RATE))}</th><th></th><th></th></tr>`;
}

["#balanceClientId", "#balanceLocationId", "#balancePeriod"].forEach((selector) => {
  $(selector).addEventListener("change", renderBalancePanel);
});

function renderExpenses() {
  const rows = [...state.expenses].sort((a, b) => b.date.localeCompare(a.date));
  $("#expenseRows").innerHTML = rows.length ? `<tr><th>Fecha</th><th>Categoría</th><th>Descripción</th><th class="num">Monto</th><th></th></tr>
    ${rows.map((item) => `<tr>
      <td>${item.date}</td>
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

function monthKey(dateText) {
  return dateText.slice(0, 7);
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
      <th colspan="2" class="group-iva">IVA</th>
    </tr>
    <tr>
      <th class="num">Ganancia del mes</th>
      <th class="num">Gastos</th>
      <th class="num">Ganancia acum.</th>
      <th class="num">Cobrado</th>
      <th class="num">Pagado a prov.</th>
      <th class="num">Caja acumulada</th>
      <th class="num">Retenido por clientes</th>
      <th class="num">A reservar (neto)</th>
    </tr>`;

  let accruedCum = 0;
  let cashCum = openingBalance;
  let totalAccrued = 0, totalExpenses = 0, totalCobrado = 0, totalPagado = 0, totalIvaRetenido = 0, totalIvaNeto = 0;
  const rowsHtml = sortedMonths.map((month) => {
    const accrued = state.deliveries
      .filter((d) => monthKey(d.date) === month)
      .reduce((sum, d) => sum + totalsFor(d).profitNet, 0);
    const ivaDevengado = state.deliveries
      .filter((d) => monthKey(d.date) === month)
      .reduce((sum, d) => sum + totalsFor(d).profitNet * IVA_RATE, 0);
    const expensesMonth = state.expenses
      .filter((e) => monthKey(e.date) === month)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const netAccrued = accrued - expensesMonth;
    accruedCum += netAccrued;

    const paidInvoices = state.invoices.filter((inv) => inv.status === "PAGO" && inv.paymentDate && monthKey(inv.paymentDate) === month);
    const cobradoReal = paidInvoices
      .filter((inv) => inv.type === "client")
      .reduce((sum, inv) => sum + Number(inv.amountGross) - Number(inv.retIva || 0) - Number(inv.retGanancias || 0), 0);
    const pagadoReal = paidInvoices
      .filter((inv) => inv.type === "provider")
      .reduce((sum, inv) => sum + Number(inv.amountGross), 0);
    const ivaRetenido = paidInvoices
      .filter((inv) => inv.type === "client")
      .reduce((sum, inv) => sum + Number(inv.retIva || 0), 0);
    const cashResult = cobradoReal - pagadoReal - expensesMonth;
    cashCum += cashResult;
    const ivaNeto = ivaDevengado - ivaRetenido;

    totalAccrued += accrued;
    totalExpenses += expensesMonth;
    totalCobrado += cobradoReal;
    totalPagado += pagadoReal;
    totalIvaRetenido += ivaRetenido;
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
      <th class="num">${money(totalIvaNeto)}</th>
    </tr>`;

  $("#monthlyRows").innerHTML += rowsHtml + totalsRow;
}

$("#openingBalance").addEventListener("input", (event) => {
  state.openingBalance = Number(event.target.value || 0);
  saveState();
  renderMonthlyTable();
});

function renderProviderPayables(rows) {
  const map = new Map();
  rows.forEach((item) => {
    const provider = byId(state.providers, item.providerId)?.name || "";
    const period = periodLabelFor(item.clientId, item.date);
    const key = `${item.providerId}|${period}`;
    const current = map.get(key) || { provider, period, providerGross: 0 };
    current.providerGross += totalsFor(item).providerNet * (1 + IVA_RATE);
    map.set(key, current);
  });
  const grouped = [...map.values()].sort((a, b) => a.provider.localeCompare(b.provider));
  const total = grouped.reduce((sum, item) => sum + item.providerGross, 0);
  $("#payableRows").innerHTML = grouped.length
    ? `<tr><th>Proveedor</th><th>Periodo</th><th class="num">A pagar c/IVA</th></tr>
      ${grouped.map((item) => `<tr><td>${escapeHtml(item.provider)}</td><td>${escapeHtml(item.period)}</td><td class="num">${money(item.providerGross)}</td></tr>`).join("")}
      <tr><th colspan="2">Total proveedores</th><th class="num">${money(total)}</th></tr>`
    : `<tr><td class="empty">Sin datos.</td></tr>`;
}

// Estado del sort de la tabla de Facturas — persiste mientras dure la sesión,
// no hace falta guardarlo en el state porque es solo una preferencia de vista.
let invoiceSort = { field: "issueDate", dir: "desc" };
let invoicePendingFirst = false;

// field=null significa "columna no ordenable" (las celdas compuestas, como
// Retenciones o Cheque/OP, no tienen un único valor comparable).
const INVOICE_COLUMNS = [
  { field: "type", label: "Tipo" },
  { field: "entity", label: "Entidad" },
  { field: "location", label: "Sala" },
  { field: "number", label: "N Factura" },
  { field: "issueDate", label: "Emision" },
  { field: "deliveryCount", label: "Remitos", num: true },
  { field: null, label: "Retenciones (si aplica)" },
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
  const location = item.locationId ? byId(state.locations, item.locationId)?.name || "" : "";
  const retIva = Number(item.retIva || 0);
  const retGan = Number(item.retGanancias || 0);
  return {
    ...item,
    entity,
    location,
    neto: Number(item.amountGross || 0) - retIva - retGan,
    deliveryCount: (item.deliveryIds || []).length
  };
}

function sortInvoiceRows(rows) {
  const { field, dir } = invoiceSort;
  const mult = dir === "asc" ? 1 : -1;
  const sorted = [...rows].sort((a, b) => {
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
  // "Pendientes primero" no reemplaza el ordenamiento elegido — solo agrupa
  // arriba todo lo que no esté en PAGO, manteniendo el orden de columna
  // adentro de cada grupo.
  if (!invoicePendingFirst) return sorted;
  const pending = sorted.filter((r) => r.status !== "PAGO");
  const done = sorted.filter((r) => r.status === "PAGO");
  return [...pending, ...done];
}

function sortArrow(field) {
  if (invoiceSort.field !== field) return "";
  return invoiceSort.dir === "asc" ? " ▲" : " ▼";
}

function renderInvoices() {
  const rows = sortInvoiceRows((state.invoices || []).map(invoiceRowData));

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
    const retIva = Number(item.retIva || 0);
    const retGan = Number(item.retGanancias || 0);
    const neto = Number(item.amountGross || 0) - retIva - retGan;
    const retCell = item.type === "client"
      ? `<input type="number" min="0" step="0.01" placeholder="Ret. IVA" value="${item.retIva || ""}" data-ret-iva="${item.id}" class="ret-input" />
         <input type="number" min="0" step="0.01" placeholder="Ret. Ganancias" value="${item.retGanancias || ""}" data-ret-ganancias="${item.id}" class="ret-input" />`
      : `<span class="cell-sub">-</span>`;
    const chequeGuardado = item.chequeNumero || item.chequeFechaRecepcion;
    const chequeCell = item.type === "client"
      ? `<div class="cheque-field">
           <input type="text" placeholder="N° cheque" value="${item.chequeNumero || ""}" data-cheque-numero="${item.id}" class="ret-input" />
           <input type="date" title="Fecha de recepción del cheque" value="${item.chequeFechaRecepcion || ""}" data-cheque-fecha="${item.id}" class="ret-input" />
           <input type="text" placeholder="N° orden de pago (si mandan)" value="${item.ordenPago || ""}" data-orden-pago="${item.id}" class="ret-input" />
           <button type="button" data-save-cheque="${item.id}" class="edit-btn">Guardar cheque / OP</button>
           ${chequeGuardado ? `<span class="save-ok">✓ guardado</span>` : ""}
         </div>`
      : `<span class="cell-sub">-</span>`;
    return `<tr>
      <td>${item.type === "client" ? "Cliente" : "Proveedor"}</td>
      <td>${escapeHtml(entity)}</td>
      <td>${escapeHtml(location)}</td>
      <td>${escapeHtml(item.number)}</td>
      <td>${item.issueDate}</td>
      <td>${nDeliveries} remito(s)</td>
      <td>${retCell}</td>
      <td>${chequeCell}</td>
      <td><input type="date" value="${item.paymentDate || ""}" data-payment-date="${item.id}" /></td>
      <td class="num">${money(item.amountGross)}</td>
      <td class="num">${money(neto)}</td>
      <td><span class="status ${item.status}">${item.status}</span></td>
      <td>
        <button type="button" data-save-payment="${item.id}" title="Guardar pago">Pago</button>
        <button type="button" data-delete-invoice="${item.id}" title="Eliminar">Borrar</button>
      </td>
    </tr>`;
  }).join("");
}

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

["#monthFilter", "#clientFilter", "#providerFilter", "#weekFilter"].forEach((selector) => {
  $(selector).addEventListener("change", render);
});

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

$("#invoicesPendingFirstBtn").addEventListener("click", () => {
  invoicePendingFirst = !invoicePendingFirst;
  $("#invoicesPendingFirstBtn").classList.toggle("active", invoicePendingFirst);
  renderInvoices();
});

["#deliveryForm", "#ruleForm", "#clientInvoiceForm", "#providerInvoiceForm"].forEach((selector) => {
  const form = $(selector);
  form.elements.clientId.addEventListener("change", () => filterLocationSelectByClient(form));
});

/**
 * Arma el listado de remitos candidatos (con checkbox) para las 2 facturas.
 * Se recalcula cada vez que cambia cliente/sala/proveedor, o cuando se
 * tilda/destilda un remito puntual.
 */
function renderInvoicePickers() {
  renderPicker({
    containerSelector: "#clientInvoicePicker",
    totalSelector: "#clientInvoiceTotal",
    form: $("#clientInvoiceForm"),
    getCandidates: (data) => data.clientId && data.locationId
      ? candidateDeliveries({ clientId: data.clientId, locationId: data.locationId, mode: "client" })
      : [],
    valueFn: (t) => t.saleNet,
    emptyMessage: "No hay remitos pendientes de facturar para esta sala."
  });

  renderPicker({
    containerSelector: "#providerInvoicePicker",
    totalSelector: "#providerInvoiceTotal",
    form: $("#providerInvoiceForm"),
    getCandidates: (data) => data.clientId && data.locationId && data.providerId
      ? candidateDeliveries({ clientId: data.clientId, locationId: data.locationId, providerId: data.providerId, mode: "provider" })
      : [],
    valueFn: (t) => t.providerNet,
    emptyMessage: "No hay remitos listos para este proveedor todavía — recordá que primero tiene que estar cobrada la factura del cliente."
  });
}

function renderPicker({ containerSelector, totalSelector, form, getCandidates, valueFn, emptyMessage }) {
  const container = $(containerSelector);
  const data = formValues(form);
  const candidates = getCandidates(data);

  if (!candidates.length) {
    container.innerHTML = `<p class="picker-empty">${emptyMessage || "No hay remitos pendientes para esta selección."}</p>`;
    $(totalSelector).textContent = money(0);
    return;
  }

  container.innerHTML = `<table class="picker-table">
    <thead><tr><th></th><th>Fecha</th><th>Remito</th><th>Sala</th><th>Producto</th><th class="num">Cant.</th><th class="num">Monto</th></tr></thead>
    <tbody>
      ${candidates.map((item) => {
        const t = totalsFor(item);
        const loc = byId(state.locations, item.locationId)?.name || "";
        const product = byId(state.products, item.productId)?.name || "";
        return `<tr>
          <td><input type="checkbox" class="picker-check" data-picker-id="${item.id}" checked /></td>
          <td>${item.date}</td>
          <td>${escapeHtml(item.receiptNo)}</td>
          <td>${escapeHtml(loc)}</td>
          <td>${escapeHtml(product)}</td>
          <td class="num">${Number(item.quantity).toLocaleString("es-AR")}</td>
          <td class="num">${money(valueFn(t) * (1 + IVA_RATE))}</td>
        </tr>`;
      }).join("")}
    </tbody>
  </table>`;

  const recompute = () => {
    const checked = [...container.querySelectorAll(".picker-check:checked")].map((el) => el.dataset.pickerId);
    const total = candidates
      .filter((item) => checked.includes(item.id))
      .reduce((sum, item) => sum + valueFn(totalsFor(item)) * (1 + IVA_RATE), 0);
    $(totalSelector).textContent = money(total);
    form.dataset.selectedIds = JSON.stringify(checked);
    form.dataset.computedTotal = total.toFixed(2);
  };
  container.querySelectorAll(".picker-check").forEach((el) => el.addEventListener("change", recompute));
  recompute();
}

["#clientInvoiceForm", "#providerInvoiceForm"].forEach((selector) => {
  const form = $(selector);
  // OJO: escuchar "change" sobre el <form> entero (como estaba antes) rompía
  // los checkboxes de remitos, porque el click en un checkbox burbujea hasta
  // el form y disparaba renderInvoicePickers() de nuevo, que reconstruye la
  // tabla y vuelve a tildar todo. Por eso los tildes "no se guardaban".
  // Escuchamos puntualmente los selects que sí deben recalcular candidatos.
  ["clientId", "locationId", "providerId"].forEach((field) => {
    form.elements[field]?.addEventListener("change", renderInvoicePickers);
  });
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
    const confirmMsg = `Ya existe un remito ${dup.receiptNo} de este proveedor para ${loc} / ${product}, con ${dup.quantity} unidades, fecha ${dup.date}.\n\n¿Cargar igual (por ejemplo, es una corrección real)?`;
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
    note: v.note
  };
});

addFromForm($("#ruleForm"), "priceRules", (v) => ({
  id: cryptoId(),
  clientId: v.clientId,
  locationId: v.locationId,
  providerId: v.providerId,
  productId: v.productId,
  salePrice: Number(v.salePrice),
  commissionPct: round2(Number(v.commissionPct || 0)),
  validFrom: v.validFrom
}));

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
  taxId: v.taxId
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
  const providerId = event.target.dataset?.editProvider;
  const clientId = event.target.dataset?.editClient;
  const locationId = event.target.dataset?.editLocation;
  const productId = event.target.dataset?.editProduct;

  if (providerId) {
    const item = byId(state.providers, providerId);
    const form = $("#providerForm");
    form.elements.name.value = item.name;
    form.elements.taxId.value = item.taxId || "";
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
    status: v.status
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
    status: v.status
  };
});

document.body.addEventListener("click", (event) => {
  const deliveryId = event.target.dataset?.deleteDelivery;
  const ruleId = event.target.dataset?.deleteRule;
  const invoiceId = event.target.dataset?.deleteInvoice;
  const paymentId = event.target.dataset?.savePayment;
  const expenseId = event.target.dataset?.deleteExpense;
  const chequeId = event.target.dataset?.saveCheque;
  const noteId = event.target.dataset?.viewNote;
  if (noteId) {
    const item = byId(state.deliveries, noteId);
    if (item?.note) alert(`Nota del remito ${item.receiptNo}:\n\n${item.note}`);
  }
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
    state.invoices = state.invoices.filter((item) => item.id !== invoiceId);
    render();
  }
  if (paymentId) {
    const invoiceItem = state.invoices.find((item) => item.id === paymentId);
    const input = document.querySelector(`input[data-payment-date="${paymentId}"]`);
    const retIvaInput = document.querySelector(`input[data-ret-iva="${paymentId}"]`);
    const retGanInput = document.querySelector(`input[data-ret-ganancias="${paymentId}"]`);
    if (invoiceItem && input?.value) {
      invoiceItem.paymentDate = input.value;
      invoiceItem.status = "PAGO";
      if (retIvaInput) invoiceItem.retIva = Number(retIvaInput.value || 0);
      if (retGanInput) invoiceItem.retGanancias = Number(retGanInput.value || 0);
      render();
    }
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

$("#importFile").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  state = JSON.parse(await file.text());
  render();
});

$("#resetBtn").addEventListener("click", () => {
  if (!confirm("Restaurar datos demo?")) return;
  state = structuredClone(seed);
  render();
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
  $("#monthFilter").value = "2026-07";
  setDefaultDates();
  render();
}
boot();
