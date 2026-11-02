/* KISS demo: begroting, kostprijs, adviesprijs en minimumprijs voor controleopdrachten.
   Alle gegevens blijven in de browser van de gebruiker (localStorage). */
"use strict";

const LV = ["Junior", "Assistent", "Senior", "Manager", "Partner"];
const DRIVERS = ["Vast", "Omvang", "Voorraad", "Per extra entiteit", "Per omzetstroom", "Per proces", "Per bankrekening", "Alleen eerste jaar"];
const LEVEL3 = ["", "Laag", "Midden", "Hoog"];
const SIGTXT = { ROOD: "Onder minimum", ORANJE: "Onder advies", GROEN: "Op advies" };

const DEFAULTS = () => ({
  params: {
    tarief: [35, 45, 60, 80, 120], toeslag: 0.60, methode: "Marge", marge: 0.30, opslag: 0.30, minMarge: 0.15,
    omvang: [[0, 0.8], [5e6, 1], [2e7, 1.3], [5e7, 1.7]], complex: { 1: 0.9, 2: 1, 3: 1.25 }, risico: { 1: 0.9, 2: 1, 3: 1.2 }, eersteToeslag: 0.10
  },
  lib: [
    ["Algemeen", "Planning, opdrachtacceptatie en risicoanalyse", "Vast", 20, [0, .10, .40, .30, .20]],
    ["Algemeen", "Materialiteit en controleplan", "Vast", 8, [0, 0, .40, .40, .20]],
    ["Eerstejaarscontrole", "Beginbalans en vergelijkende cijfers", "Alleen eerste jaar", 16, [0, .20, .45, .25, .10]],
    ["Eerstejaarscontrole", "Inlezen klant, systemen en processen", "Alleen eerste jaar", 12, [0, .20, .40, .30, .10]],
    ["Processen en interne beheersing", "Opzet, bestaan en werking (per proces)", "Per proces", 6, [.15, .30, .40, .10, .05]],
    ["Processen en interne beheersing", "IT-omgeving", "Omvang", 6, [0, .20, .50, .25, .05]],
    ["Omzet", "Cijferanalyse en detailcontrole (per omzetstroom)", "Per omzetstroom", 14, [.30, .35, .25, .08, .02]],
    ["Omzet", "Cut-off (per omzetstroom)", "Per omzetstroom", 3, [.40, .35, .20, .05, 0]],
    ["Kostprijs omzet", "Kostprijs en brutomarge-analyse (per omzetstroom)", "Per omzetstroom", 10, [.25, .35, .30, .08, .02]],
    ["Debiteuren", "Saldobevestigingen en nacontrole", "Omvang", 10, [.40, .35, .20, .05, 0]],
    ["Voorraden", "Inventarisatie en waardering", "Voorraad", 18, [.25, .35, .30, .08, .02]],
    ["Materiële vaste activa", "Mutaties en waardering", "Omvang", 10, [.30, .40, .25, .05, 0]],
    ["Liquide middelen", "Bankbevestigingen en bankanalyse (per rekening)", "Per bankrekening", 2, [.50, .30, .20, 0, 0]],
    ["Crediteuren en overlopende passiva", "Volledigheid en nacontrole", "Omvang", 10, [.40, .35, .20, .05, 0]],
    ["Crediteuren en overlopende passiva", "Afgrenzing via bankanalyse (per rekening)", "Per bankrekening", 1, [.50, .35, .15, 0, 0]],
    ["Personeelskosten", "Cijferanalyse en salarisadministratie", "Omvang", 10, [.35, .35, .25, .05, 0]],
    ["Overige posten", "Overige balans- en resultaatposten", "Omvang", 8, [.20, .30, .35, .10, .05]],
    ["Consolidatie", "Deelnemingen en consolidatie", "Per extra entiteit", 12, [0, .20, .50, .25, .05]],
    ["Jaarrekening", "Toelichting en presentatie", "Vast", 12, [0, .30, .50, .15, .05]],
    ["Algemeen", "Afronding, rapportage en dossierreview", "Vast", 20, [0, .10, .35, .35, .20]]
  ].map(([post, wz, driver, uren, pct]) => ({ post, wz, driver, uren, pct })),
  opd: [
    { code: "K-01", omzet: 12e6, ent: 2, vrd: "Ja", eerste: "Nee", stromen: 2, proc: 4, bank: 3, def: [2, 2], posts: { "Omzet": [2, 3], "Voorraden": [3, 2] }, hon: 16500, ogk: 500, werk: [40, 60, 70, 35, 15] },
    { code: "K-02", omzet: 3.5e6, ent: 1, vrd: "Nee", eerste: "Nee", stromen: 1, proc: 3, bank: 1, def: [1, 1], posts: {}, hon: 17000, ogk: 0, werk: [18, 26, 28, 11, 5] },
    { code: "K-03", omzet: 28e6, ent: 3, vrd: "Ja", eerste: "Ja", stromen: 3, proc: 5, bank: 6, def: [3, 2], posts: { "Omzet": [3, 3] }, hon: 44000, ogk: 1500, werk: [70, 95, 115, 52, 22] },
    { code: "K-04", omzet: 8e6, ent: 1, vrd: "Nee", eerste: "Nee", stromen: 1, proc: 4, bank: 2, def: [2, 3], posts: {}, hon: 26500, ogk: 300, werk: [30, 44, 52, 24, 11] },
    { code: "K-05", omzet: 55e6, ent: 4, vrd: "Ja", eerste: "Nee", stromen: 4, proc: 6, bank: 9, def: [3, 3], posts: {}, hon: 76000, ogk: 2500, werk: [0, 0, 0, 0, 0] },
    { code: "K-06", omzet: 6e6, ent: 1, vrd: "Ja", eerste: "Nee", stromen: 2, proc: 3, bank: 2, def: [2, 1], posts: { "Voorraden": [2, 3] }, hon: 26000, ogk: 0, werk: [28, 40, 44, 18, 8] }
  ].map(o => ({ ...o, prijs: null, reden: "", status: "concept" }))
});

/* ---------- state ---------- */
const KEY = "kiss-app-v3";
let S;
try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
if (!S || !S.params || !S.lib || !Array.isArray(S.opd) || !S.opd.length) S = DEFAULTS();
let cur = 0;
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable: app keeps working in memory */ } }

/* ---------- helpers ---------- */
const $ = id => document.getElementById(id);
const nf0 = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const nfp = new Intl.NumberFormat("nl-NL", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nfh = new Intl.NumberFormat("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const eur = v => isFinite(v) ? nf0.format(v) : "–";
const pct = v => isFinite(v) ? nfp.format(v) : "–";
const hr = v => isFinite(v) ? nfh.format(v) : "–";
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const today = () => new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
const fileStamp = () => new Date().toISOString().slice(0, 10);
const safeName = s => (String(s || "opdracht").replace(/[^\w.-]+/g, "_").slice(0, 40) || "opdracht");

function toast(t) { const el = $("toast"); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { el.hidden = true; }, 2600); }

/* ---------- calculation ---------- */
function postVal(o, post) { return (o.posts && o.posts[post]) || o.def || [2, 2]; }
function omvangF(omzet) { const t = S.params.omvang; let f = t[0][1]; for (const [g, v] of t) if (omzet >= g) f = v; return f; }
function calc(o) {
  const p = S.params, of = omvangF(+o.omzet || 0), extra = Math.max(0, (+o.ent || 1) - 1), eerste = o.eerste === "Ja";
  const ef = eerste ? 1 + (+p.eersteToeslag || 0) : 1;
  const scaleOf = {
    "Vast": 1, "Omvang": of, "Voorraad": o.vrd === "Ja" ? of : 0, "Per extra entiteit": extra,
    "Per omzetstroom": Math.max(1, +o.stromen || 1) * of, "Per proces": Math.max(0, +o.proc || 0),
    "Per bankrekening": Math.max(0, +o.bank || 0), "Alleen eerste jaar": eerste ? 1 : 0
  };
  const rows = S.lib.map(w => {
    const v = postVal(o, w.post), cf = p.complex[v[0]] || 1, rf = p.risico[v[1]] || 1;
    const h = (+w.uren || 0) * (scaleOf[w.driver] ?? 0) * cf * rf * ef;
    return { ...w, h, cf, rf, lv: w.pct.map(x => h * (+x || 0)) };
  }).filter(r => r.h > 0);
  const lv = LV.map((_, i) => rows.reduce((s, r) => s + r.lv[i], 0));
  const uren = lv.reduce((a, b) => a + b, 0);
  const pers = lv.reduce((s, h, i) => s + h * p.tarief[i], 0), toe = pers * p.toeslag, ogk = +o.ogk || 0, kost = pers + toe + ogk;
  const advB = p.methode === "Marge" ? kost / (1 - p.marge) : kost * (1 + p.opslag);
  const min = kost / (1 - p.minMarge), adv = Math.max(advB, min);
  const hon = +o.hon || 0;
  const sig = !hon ? null : hon < min ? "ROOD" : hon < adv ? "ORANJE" : "GROEN";
  const wsum = (o.werk || []).reduce((a, b) => a + (+b || 0), 0);
  let nac = null;
  if (wsum > 0) {
    const wp = o.werk.reduce((s, h, i) => s + (+h || 0) * p.tarief[i], 0), wk = wp * (1 + p.toeslag) + ogk;
    nac = { uren: wsum, kost: wk, marge: hon ? (hon - wk) / hon : NaN, afw: uren ? (wsum - uren) / uren : NaN };
  }
  return { of, ef, eerste, extra, rows, lv, uren, pers, toe, ogk, kost, advB, min, adv, warn: advB < min, hon, sig, margeHon: hon ? (hon - kost) / hon : NaN, nac };
}

/* ---------- routing ---------- */
const VIEWS = ["opdracht", "portefeuille", "instellingen", "bibliotheek"];
function route() {
  const v = VIEWS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "opdracht";
  VIEWS.forEach(n => { $("v-" + n).hidden = n !== v; });
  document.querySelectorAll("[data-view]").forEach(a => { if (a.dataset.view === v) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  if (v === "opdracht") renderOpd();
  if (v === "portefeuille") renderPort();
  if (v === "instellingen") renderSet();
  if (v === "bibliotheek") renderLib();
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);

/* ---------- opdracht view ---------- */
function renderList() {
  const q = $("search").value.trim().toLowerCase();
  $("list").innerHTML = S.opd.map((o, i) => {
    if (q && !String(o.code).toLowerCase().includes(q)) return "";
    const c = calc(o);
    return `<li><button type="button" data-i="${i}" aria-current="${i === cur}">
      <span class="c">${esc(o.code || "(zonder code)")}</span>${c.sig ? `<span class="pill ${c.sig}">${SIGTXT[c.sig]}</span>` : "<span></span>"}
      <span class="s">${c.hon ? eur(c.hon) : "geen honorarium"}${o.status === "goedgekeurd" ? `<span class="done-dot">● afgerond</span>` : ""}</span></button></li>`;
  }).join("") || `<li class="hint" style="padding:8px 12px">Geen opdracht gevonden.</li>`;
  $("pick").innerHTML = S.opd.map((o, i) => `<option value="${i}" ${i === cur ? "selected" : ""}>${esc(o.code || "(zonder code)")}${o.status === "goedgekeurd" ? " · afgerond" : ""}</option>`).join("");
}
$("list").addEventListener("click", e => { const b = e.target.closest("button[data-i]"); if (!b) return; cur = +b.dataset.i; renderOpd(); });
$("search").addEventListener("input", renderList);
$("pick").addEventListener("change", e => { cur = +e.target.value; renderOpd(); });

$("f-werk").innerHTML = LV.map((l, i) => `<label>${l}<input id="f-w${i}" type="number" min="0" step="1" inputmode="numeric"></label>`).join("");

function loadForm() {
  const o = S.opd[cur]; o.def = o.def || [2, 2]; o.posts = o.posts || {};
  $("f-code").value = o.code || ""; $("f-omzet").value = o.omzet || ""; $("f-ent").value = o.ent || 1; $("f-vrd").value = o.vrd || "Nee";
  $("f-eerste").value = o.eerste || "Nee"; $("f-stromen").value = o.stromen || 1; $("f-proc").value = o.proc ?? ""; $("f-bank").value = o.bank ?? "";
  $("f-defrk").value = o.def[1]; $("f-defcx").value = o.def[0];
  $("f-hon").value = o.hon || ""; $("f-ogk").value = o.ogk || "";
  LV.forEach((_, i) => { $("f-w" + i).value = (o.werk && o.werk[i]) || ""; });
  $("a-prijs").value = o.prijs ?? ""; $("a-reden").value = o.reden || "";
}
function unapprove(o) { if (o.status === "goedgekeurd") { o.status = "concept"; o.afgerondOp = null; } }
function readForm() {
  const o = S.opd[cur];
  o.code = $("f-code").value.trim(); o.omzet = +$("f-omzet").value || 0; o.ent = Math.max(1, +$("f-ent").value || 1); o.vrd = $("f-vrd").value;
  o.eerste = $("f-eerste").value; o.stromen = Math.max(1, +$("f-stromen").value || 1); o.proc = Math.max(0, +$("f-proc").value || 0); o.bank = Math.max(0, +$("f-bank").value || 0);
  o.def = [+$("f-defcx").value, +$("f-defrk").value];
  o.hon = +$("f-hon").value || 0; o.ogk = +$("f-ogk").value || 0; o.werk = LV.map((_, i) => +$("f-w" + i).value || 0);
  unapprove(o); save();
}
const onFormInput = () => { readForm(); renderList(); renderCalc(); };
$("form").addEventListener("input", onFormInput);
$("form").addEventListener("submit", e => e.preventDefault());
$("f-code").addEventListener("input", onFormInput);
$("f-werk").addEventListener("input", onFormInput);

function renderOpd() { if (cur >= S.opd.length) cur = 0; renderList(); loadForm(); renderCalc(); }

function renderCalc() {
  const o = S.opd[cur], c = calc(o), p = S.params;
  // status + import note
  $("statusPill").innerHTML = o.status === "goedgekeurd" ? `<span class="pill goed">Afgerond</span>` : `<span class="pill concept">Concept</span>`;
  $("importNote").innerHTML = o.bron ? `<div class="note">Geopend uit een KISS-bestand van ${esc(o.bron.datum)}. Toen: kostprijs ${eur(o.bron.kost)}, minimumprijs ${eur(o.bron.min)}, adviesprijs ${eur(o.bron.adv)}${o.bron.prijs ? `, offerteprijs ${eur(o.bron.prijs)}` : ""}. De bedragen hieronder zijn berekend met de huidige instellingen.</div>` : "";
  // verdict
  const say = !c.sig ? `Vul het huidige honorarium in om te zien waar deze opdracht staat.`
    : c.sig === "ROOD" ? `Het honorarium ligt <b>${eur(c.min - c.hon)}</b> onder de minimumprijs.`
      : c.sig === "ORANJE" ? `Het honorarium haalt de minimumprijs, maar ligt <b>${eur(c.adv - c.hon)}</b> onder het advies.`
        : `Het honorarium ligt <b>${eur(c.hon - c.adv)}</b> boven de adviesprijs.`;
  $("verdict").innerHTML = `<div class="actions">${c.sig ? `<span class="pill ${c.sig}">${SIGTXT[c.sig]}</span>` : ""}<span class="hint">${esc(o.code || "Nieuwe opdracht")} · ${hr(c.uren)} uur</span></div>
    <div class="say">${say}</div>${c.sig ? `<div class="hint">Begrote marge bij het huidige honorarium: ${pct(c.margeHon)}</div>` : ""}`;
  $("prices").innerHTML = `<div class="kpi"><span>Kostprijs</span><b>${eur(c.kost)}</b></div>
    <div class="kpi min"><span>Minimumprijs</span><b>${eur(c.min)}</b></div>
    <div class="kpi adv"><span>Adviesprijs</span><b>${eur(c.adv)}</b></div>
    <div class="kpi cur"><span>Huidig</span><b>${c.hon ? eur(c.hon) : "–"}</b></div>`;
  // ladder
  const lo = Math.min(c.kost, c.hon || Infinity) * 0.9, hi = Math.max(c.adv, c.hon || 0) * 1.1;
  const X = v => Math.min(100, Math.max(0, (v - lo) / ((hi - lo) || 1) * 100));
  const a = X(c.min), b = X(c.adv);
  $("ladder").innerHTML = `<div class="track"><i style="width:${a}%;background:var(--red-bg)"></i><i style="width:${Math.max(0, b - a)}%;background:var(--amber-bg)"></i><i style="flex:1;background:var(--green-bg)"></i></div>
    <div class="mk kost" style="left:${X(c.kost)}%"><em>kostprijs</em></div><div class="mk" style="left:${a}%"><em>minimum</em></div><div class="mk" style="left:${b}%"><em>advies</em></div>
    ${c.hon ? `<div class="mk cur" style="left:${X(c.hon)}%"><em>huidig</em></div>` : ""}`;
  $("warns").innerHTML = (c.warn ? `<div class="warn">De berekende adviesprijs (${eur(c.advB)}) ligt onder de minimumprijs. KISS gebruikt de minimumprijs als advies. Controleer het prijsbeleid in Instellingen.</div>` : "") +
    `<p class="hint">${p.methode === "Marge" ? `Advies: marge op omzet ${pct(p.marge)}.` : `Advies: opslag op kostprijs ${pct(p.opslag)} (${pct(p.opslag / (1 + p.opslag))} marge op omzet).`} Minimum: marge op omzet ${pct(p.minMarge)}.</p>`;
  $("cost").innerHTML = LV.map((l, i) => `<tr><td>${l}: ${hr(c.lv[i])} u × ${eur(p.tarief[i])}</td><td>${eur(c.lv[i] * p.tarief[i])}</td></tr>`).join("") +
    `<tr class="t"><td>Personeelskosten</td><td>${eur(c.pers)}</td></tr><tr><td>Toeslag indirecte kosten ${pct(p.toeslag)}</td><td>${eur(c.toe)}</td></tr>
     <tr><td>Opdrachtgebonden kosten</td><td>${eur(c.ogk)}</td></tr><tr class="t"><td>Kostprijs</td><td>${eur(c.kost)}</td></tr>`;
  $("factors").textContent = `omvang ×${hr(c.of)} · ${o.stromen || 1} omzetstromen · ${o.proc || 0} processen · ${o.bank || 0} bankrekeningen · ${c.extra} extra entiteiten${c.eerste ? ` · eerste jaar +${Math.round((c.ef - 1) * 100)}%` : ""}`;
  // budget table
  let h = `<thead><tr><th>Werkzaamheid</th>${LV.map(l => `<th class="r">${l}</th>`).join("")}<th class="r">Totaal</th></tr></thead><tbody>`;
  for (const ps of [...new Set(c.rows.map(r => r.post))]) {
    const pv = postVal(o, ps), set = !!(o.posts && o.posts[ps]);
    h += `<tr class="post"><td colspan="7"><div class="pc"><b>${esc(ps)}</b>
      <label>Risico <select class="${set ? "set" : ""}" data-p="${esc(ps)}" data-x="1">${opt3(pv[1])}</select></label>
      <label>Complexiteit <select class="${set ? "set" : ""}" data-p="${esc(ps)}" data-x="0">${opt3(pv[0])}</select></label></div></td></tr>`;
    for (const r of c.rows.filter(x => x.post === ps)) {
      const f = r.cf * r.rf;
      h += `<tr><td>${esc(r.wz)}${Math.abs(f - 1) > 1e-9 ? `<span class="fx">×${hr(f)}</span>` : ""}</td>${r.lv.map((v, i) => `<td class="r num" data-l="${LV[i]}">${v ? hr(v) : "–"}</td>`).join("")}<td class="r num" data-l="Totaal"><b>${hr(r.h)}</b></td></tr>`;
    }
  }
  h += `</tbody><tfoot><tr><td>Totaal begrote uren</td>${c.lv.map((v, i) => `<td class="r num" data-l="${LV[i]}">${hr(v)}</td>`).join("")}<td class="r num" data-l="Totaal">${hr(c.uren)}</td></tr></tfoot>`;
  $("budget").innerHTML = h;
  // nacalculatie
  $("nacalc").innerHTML = c.nac ? `<div class="nac">
      <div class="kpi"><span>Werkelijke uren</span><b>${hr(c.nac.uren)}</b></div>
      <div class="kpi"><span>T.o.v. begroting</span><b>${(c.nac.afw > 0 ? "+" : "") + pct(c.nac.afw)}</b></div>
      <div class="kpi"><span>Werkelijke kosten</span><b>${eur(c.nac.kost)}</b></div>
      <div class="kpi ${c.nac.marge < p.minMarge ? "min" : "adv"}"><span>Gerealiseerde marge</span><b>${pct(c.nac.marge)}</b></div></div>`
    : `<p class="hint">Vul de werkelijke uren per niveau in om de gerealiseerde marge te zien.</p>`;
  // phone price bar
  $("mbar").innerHTML = `<span>${c.sig ? `<span class="pill ${c.sig}">${SIGTXT[c.sig]}</span>` : ""}</span><span>Min <b>${eur(c.min)}</b></span><span>Advies <b>${eur(c.adv)}</b></span>`;
  renderApprove(c);
}
function opt3(v) { return [1, 2, 3].map(k => `<option value="${k}" ${k == v ? "selected" : ""}>${LEVEL3[k]}</option>`).join(""); }

$("budget").addEventListener("change", e => {
  const t = e.target; if (!t.dataset.x) return;
  const o = S.opd[cur], x = +t.dataset.x, ps = t.dataset.p; o.posts = o.posts || {};
  const v = [...postVal(o, ps)]; v[x] = +t.value;
  if (v[0] === o.def[0] && v[1] === o.def[1]) delete o.posts[ps]; else o.posts[ps] = v;
  unapprove(o); save(); renderList(); renderCalc();
});

function renderApprove(c) {
  const o = S.opd[cur];
  const prijs = +$("a-prijs").value || 0, eff = prijs || c.adv;
  $("a-marge").value = pct((eff - c.kost) / eff);
  $("a-margelbl").textContent = prijs ? "Marge op offerteprijs" : "Marge bij adviesprijs";
  // afronding op honderden (knop "Adviesprijs overnemen") telt niet als afwijking
  const afwijk = prijs && Math.abs(prijs - c.adv) > 50, reden = $("a-reden").value.trim();
  let w = "";
  if (prijs && prijs < c.min) w = `<div class="warn bad">De offerteprijs ligt ${eur(c.min - prijs)} onder de minimumprijs. Akkoord van de partner nodig.</div>`;
  if (afwijk && !reden) w += `<div class="warn">De offerteprijs wijkt af van de adviesprijs. Leg de reden vast om af te ronden.</div>`;
  $("a-warn").innerHTML = w;
  $("approve").disabled = !o.code || (afwijk && !reden);
  $("approve").title = !o.code ? "Vul eerst een opdrachtcode in" : "";
  const done = o.status === "goedgekeurd";
  $("doneBox").hidden = !done;
  if (done) $("doneTxt").textContent = `Goedgekeurd op ${o.afgerondOp || today()} voor ${eur(o.prijs ?? c.adv)}. Sla de begroting op als bestand om hem later terug te zien.`;
  $("approve").textContent = done ? "Opnieuw goedkeuren" : "Goedkeuren en afronden";
}
["a-prijs", "a-reden"].forEach(id => $(id).addEventListener("input", () => {
  const o = S.opd[cur]; o.prijs = +$("a-prijs").value || null; o.reden = $("a-reden").value; unapprove(o); save(); renderList(); renderCalc();
}));
$("useAdv").addEventListener("click", () => { const c = calc(S.opd[cur]); $("a-prijs").value = Math.round(c.adv / 100) * 100; $("a-prijs").dispatchEvent(new Event("input")); });
$("approve").addEventListener("click", () => {
  const o = S.opd[cur], c = calc(o);
  o.prijs = +$("a-prijs").value || Math.round(c.adv); o.status = "goedgekeurd"; o.afgerondOp = today();
  save(); renderList(); renderCalc(); toast(`${o.code} afgerond voor ${eur(o.prijs)}`);
  $("doneBox").scrollIntoView({ behavior: "smooth", block: "nearest" });
});

function newOpd() {
  S.opd.push({ code: "K-" + String(S.opd.length + 1).padStart(2, "0"), omzet: 1e7, ent: 1, vrd: "Nee", eerste: "Nee", stromen: 1, proc: 3, bank: 1, def: [2, 2], posts: {}, hon: 0, ogk: 0, werk: [0, 0, 0, 0, 0], prijs: null, reden: "", status: "concept" });
  cur = S.opd.length - 1; save();
  if (location.hash !== "#opdracht" && location.hash !== "") location.hash = "opdracht"; else renderOpd();
  $("f-omzet").focus();
}
$("newBtn").addEventListener("click", newOpd);
$("newBtn2").addEventListener("click", newOpd);

/* ---------- export ---------- */
const menuBtn = $("exportBtn"), menu = $("exportMenu");
menuBtn.addEventListener("click", e => { e.stopPropagation(); const open = menu.hidden; menu.hidden = !open; menuBtn.setAttribute("aria-expanded", String(open)); });
document.addEventListener("click", e => { if (!menu.hidden && !menu.contains(e.target)) { menu.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); } });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !menu.hidden) { menu.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); menuBtn.focus(); } });
document.addEventListener("click", e => {
  const b = e.target.closest("[data-exp]"); if (!b) return;
  menu.hidden = true; menuBtn.setAttribute("aria-expanded", "false");
  const kind = b.dataset.exp;
  if (kind === "xlsx") exportXlsx(); else if (kind === "pdf") exportPdf(); else if (kind === "kiss") exportKiss();
});

function download(name, blob) {
  const url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function reportData(o) {
  const c = calc(o), p = S.params;
  return {
    o, c, p,
    kenmerken: [
      ["Opdrachtcode", o.code], ["Netto-omzet", eur(o.omzet)], ["Huidig honorarium", c.hon ? eur(c.hon) : "–"], ["Opdrachtgebonden kosten", eur(c.ogk)],
      ["Eerstejaarscontrole", o.eerste || "Nee"], ["Entiteiten", o.ent], ["Omzetstromen", o.stromen || 1], ["Processen", o.proc || 0],
      ["Bankrekeningen", o.bank || 0], ["Voorraden", o.vrd], ["Standaard risico", LEVEL3[o.def[1]]], ["Standaard complexiteit", LEVEL3[o.def[0]]]
    ],
    prijsbeleid: p.methode === "Marge" ? `Adviesprijs = kostprijs ÷ (1 − ${pct(p.marge)})` : `Adviesprijs = kostprijs × (1 + ${pct(p.opslag)})`,
    status: o.status === "goedgekeurd" ? `Afgerond op ${o.afgerondOp || today()}` : "Concept (nog niet afgerond)"
  };
}

function exportXlsx() {
  if (typeof XLSX === "undefined") { toast("Excel-export is niet geladen. Controleer de internetverbinding en probeer opnieuw."); return; }
  const { o, c, p, kenmerken, prijsbeleid, status } = reportData(S.opd[cur]);
  const wb = XLSX.utils.book_new();
  const EUR = "€ #,##0", PCT = "0.0%", H = "0.0";
  const money = v => ({ t: "n", v: Math.round(v * 100) / 100, z: EUR });
  const perc = v => isFinite(v) ? { t: "n", v, z: PCT } : "";
  // Samenvatting
  const sum = [
    ["KISS begroting", o.code], ["Status", status], ["Geëxporteerd op", today()], [],
    ["Klantkenmerken"], ...kenmerken.map(([k, v]) => [k, typeof v === "number" ? v : String(v)]),
    [], ["Prijs"],
    ["Begrote uren", { t: "n", v: Math.round(c.uren * 10) / 10, z: H }],
    ["Kostprijs", money(c.kost)], ["Minimumprijs", money(c.min)], ["Adviesprijs", money(c.adv)],
    ["Huidig honorarium", c.hon ? money(c.hon) : "–"], ["Begrote marge bij huidig honorarium", perc(c.margeHon)],
    ["Offerteprijs", o.prijs ? money(o.prijs) : "–"], ["Marge op offerteprijs", o.prijs ? perc((o.prijs - c.kost) / o.prijs) : "–"],
    ["Reden van afwijking", o.reden || ""], [],
    ["Prijsbeleid"], ["Methode", prijsbeleid], ["Minimale marge op omzet", perc(p.minMarge)], ["Toeslag indirecte kosten", perc(p.toeslag)],
    ...LV.map((l, i) => [`Direct tarief ${l}`, money(p.tarief[i])])
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(sum); ws1["!cols"] = [{ wch: 38 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Samenvatting");
  // Begroting
  const bud = [["Post", "Werkzaamheid", "Driver", "Risico", "Complexiteit", ...LV, "Totaal uren"]];
  for (const r of c.rows) {
    const v = postVal(o, r.post);
    bud.push([r.post, r.wz, r.driver, LEVEL3[v[1]], LEVEL3[v[0]], ...r.lv.map(x => ({ t: "n", v: Math.round(x * 10) / 10, z: H })), { t: "n", v: Math.round(r.h * 10) / 10, z: H }]);
  }
  bud.push(["Totaal", "", "", "", "", ...c.lv.map(x => ({ t: "n", v: Math.round(x * 10) / 10, z: H })), { t: "n", v: Math.round(c.uren * 10) / 10, z: H }]);
  const ws2 = XLSX.utils.aoa_to_sheet(bud); ws2["!cols"] = [{ wch: 32 }, { wch: 48 }, { wch: 18 }, { wch: 10 }, { wch: 12 }, ...LV.map(() => ({ wch: 10 })), { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Begroting");
  // Kostprijs
  const cost = [["Onderdeel", "Uren", "Tarief", "Bedrag"],
    ...LV.map((l, i) => [l, { t: "n", v: Math.round(c.lv[i] * 10) / 10, z: H }, money(p.tarief[i]), money(c.lv[i] * p.tarief[i])]),
    ["Personeelskosten", "", "", money(c.pers)], [`Toeslag indirecte kosten (${pct(p.toeslag)})`, "", "", money(c.toe)],
    ["Opdrachtgebonden kosten", "", "", money(c.ogk)], ["Kostprijs", "", "", money(c.kost)]];
  const ws3 = XLSX.utils.aoa_to_sheet(cost); ws3["!cols"] = [{ wch: 34 }, { wch: 10 }, { wch: 12 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws3, "Kostprijs");
  if (c.nac) {
    const nac = [["Niveau", "Begrote uren", "Werkelijke uren"], ...LV.map((l, i) => [l, { t: "n", v: Math.round(c.lv[i] * 10) / 10, z: H }, +o.werk[i] || 0]),
      ["Totaal", { t: "n", v: Math.round(c.uren * 10) / 10, z: H }, c.nac.uren], [],
      ["Werkelijke kosten", money(c.nac.kost)], ["Gerealiseerde marge", perc(c.nac.marge)], ["Afwijking uren t.o.v. begroting", perc(c.nac.afw)]];
    const ws4 = XLSX.utils.aoa_to_sheet(nac); ws4["!cols"] = [{ wch: 32 }, { wch: 16 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, ws4, "Nacalculatie");
  }
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  download(`KISS-begroting-${safeName(o.code)}-${fileStamp()}.xlsx`, new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  toast("Excel-bestand gedownload");
}

function buildReport() {
  const { o, c, p, kenmerken, prijsbeleid, status } = reportData(S.opd[cur]);
  let rows = "";
  for (const ps of [...new Set(c.rows.map(r => r.post))]) {
    const v = postVal(o, ps);
    rows += `<tr class="post"><td colspan="7">${esc(ps)} · risico ${LEVEL3[v[1]].toLowerCase()} · complexiteit ${LEVEL3[v[0]].toLowerCase()}</td></tr>`;
    for (const r of c.rows.filter(x => x.post === ps)) rows += `<tr><td>${esc(r.wz)}</td>${r.lv.map(x => `<td class="r">${x ? hr(x) : "–"}</td>`).join("")}<td class="r">${hr(r.h)}</td></tr>`;
  }
  $("print").innerHTML = `<div class="rep">
    <h1>Controlebegroting ${esc(o.code)}</h1>
    <div class="meta">${esc(status)} · afgedrukt op ${today()} · KISS demo</div>
    <div class="big">
      <div><span>Kostprijs</span><b>${eur(c.kost)}</b></div><div><span>Minimumprijs</span><b>${eur(c.min)}</b></div>
      <div><span>Adviesprijs</span><b>${eur(c.adv)}</b></div><div><span>${o.prijs ? "Offerteprijs" : "Huidig honorarium"}</span><b>${eur(o.prijs || c.hon)}</b></div>
    </div>
    ${o.reden ? `<p><b>Reden van afwijking:</b> ${esc(o.reden)}</p>` : ""}
    <h2>Klantkenmerken</h2><div class="kv">${kenmerken.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("")}</div>
    <h2>Begroting per werkzaamheid (uren)</h2>
    <table><thead><tr><th>Werkzaamheid</th>${LV.map(l => `<th class="r">${l}</th>`).join("")}<th class="r">Totaal</th></tr></thead>
    <tbody>${rows}<tr class="tot"><td>Totaal</td>${c.lv.map(x => `<td class="r">${hr(x)}</td>`).join("")}<td class="r">${hr(c.uren)}</td></tr></tbody></table>
    <h2>Kostprijsopbouw</h2>
    <table><tbody>${LV.map((l, i) => `<tr><td>${l}: ${hr(c.lv[i])} u × ${eur(p.tarief[i])}</td><td class="r">${eur(c.lv[i] * p.tarief[i])}</td></tr>`).join("")}
    <tr><td>Personeelskosten</td><td class="r">${eur(c.pers)}</td></tr><tr><td>Toeslag indirecte kosten ${pct(p.toeslag)}</td><td class="r">${eur(c.toe)}</td></tr>
    <tr><td>Opdrachtgebonden kosten</td><td class="r">${eur(c.ogk)}</td></tr><tr class="tot"><td>Kostprijs</td><td class="r">${eur(c.kost)}</td></tr></tbody></table>
    ${c.nac ? `<h2>Nacalculatie vorig jaar</h2><table><tbody><tr><td>Werkelijke uren</td><td class="r">${hr(c.nac.uren)}</td></tr><tr><td>Afwijking t.o.v. begroting</td><td class="r">${pct(c.nac.afw)}</td></tr><tr><td>Werkelijke kosten</td><td class="r">${eur(c.nac.kost)}</td></tr><tr><td>Gerealiseerde marge</td><td class="r">${pct(c.nac.marge)}</td></tr></tbody></table>` : ""}
    <p class="foot">${esc(prijsbeleid)}. Minimumprijs bij een minimale marge op omzet van ${pct(p.minMarge)}. Normtijden en tarieven zijn voorbeeldwaarden.</p>
  </div>`;
}
function exportPdf() { buildReport(); setTimeout(() => window.print(), 50); }
window.addEventListener("beforeprint", buildReport);

function exportKiss() {
  const o = S.opd[cur], c = calc(o);
  const data = { kiss: 1, type: "opdracht", geexporteerd: new Date().toISOString(), datum: today(),
    opdracht: o, uitkomst: { kost: c.kost, min: c.min, adv: c.adv, uren: c.uren }, instellingen: S.params, bibliotheek: S.lib };
  download(`KISS-${safeName(o.code)}-${fileStamp()}.kiss.json`, new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  toast("KISS-bestand opgeslagen");
}

$("openFile").addEventListener("change", e => {
  const f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const d = JSON.parse(rd.result);
      if (!d || d.kiss !== 1 || !d.opdracht) throw new Error("geen KISS-bestand");
      const o = { ...d.opdracht };
      let code = o.code || "Geïmporteerd", n = 2;
      while (S.opd.some(x => x.code === code)) code = `${o.code} (${n++})`;
      o.code = code;
      o.bron = { datum: d.datum || "onbekende datum", kost: d.uitkomst?.kost, min: d.uitkomst?.min, adv: d.uitkomst?.adv, prijs: o.prijs };
      S.opd.push(o); cur = S.opd.length - 1; save();
      if (location.hash !== "#opdracht" && location.hash !== "") location.hash = "opdracht"; else renderOpd();
      toast(`${code} geopend`);
    } catch (err) { toast("Dit bestand kan KISS niet openen. Kies een .kiss.json-bestand dat met KISS is opgeslagen."); }
  };
  rd.readAsText(f);
});

/* ---------- portefeuille ---------- */
function portRows() { return S.opd.map((o, i) => ({ o, i, c: calc(o) })).sort((a, b) => (isFinite(a.c.margeHon) ? a.c.margeHon : 9) - (isFinite(b.c.margeHon) ? b.c.margeHon : 9)); }
function renderPort() {
  const rows = portRows(), n = s => rows.filter(r => r.c.sig === s).length;
  const tekMin = rows.reduce((s, r) => s + (r.c.hon ? Math.max(0, r.c.min - r.c.hon) : 0), 0);
  const hon = rows.reduce((s, r) => s + r.c.hon, 0), adv = rows.reduce((s, r) => s + (r.c.hon ? r.c.adv : 0), 0);
  $("tiles").innerHTML = `<div class="tile"><span>Onder minimumprijs</span><b>${n("ROOD")} van ${rows.length}</b></div>
    <div class="tile"><span>Tekort t.o.v. minimumprijs</span><b>${eur(tekMin)}</b></div>
    <div class="tile"><span>Huidig honorarium totaal</span><b>${eur(hon)}</b></div>
    <div class="tile"><span>Bij adviesprijs</span><b>${eur(adv)}</b></div>`;
  $("port").innerHTML = `<thead><tr><th>Opdracht</th><th>Signaal</th><th class="r">Huidig</th><th class="r">Kostprijs</th><th class="r">Minimum</th><th class="r">Advies</th><th class="r">Begrote marge</th><th class="r">Gerealiseerd</th><th>Status</th></tr></thead><tbody>` +
    rows.map(({ o, i, c }) => `<tr data-i="${i}" tabindex="0"><td><b>${esc(o.code)}</b></td><td data-l="Signaal">${c.sig ? `<span class="pill ${c.sig}">${SIGTXT[c.sig]}</span>` : "–"}</td>
      <td class="r num" data-l="Huidig">${c.hon ? eur(c.hon) : "–"}</td><td class="r num" data-l="Kostprijs">${eur(c.kost)}</td><td class="r num" data-l="Minimum">${eur(c.min)}</td><td class="r num" data-l="Advies">${eur(c.adv)}</td>
      <td class="r num" data-l="Begrote marge">${pct(c.margeHon)}</td><td class="r num" data-l="Gerealiseerd">${c.nac ? pct(c.nac.marge) : "–"}</td>
      <td data-l="Status">${o.status === "goedgekeurd" ? `<span class="pill goed">Afgerond ${eur(o.prijs)}</span>` : `<span class="pill concept">Concept</span>`}</td></tr>`).join("") + `</tbody>`;
}
$("port").addEventListener("click", e => { const tr = e.target.closest("tr[data-i]"); if (!tr) return; cur = +tr.dataset.i; location.hash = "opdracht"; });
$("port").addEventListener("keydown", e => { if (e.key !== "Enter") return; const tr = e.target.closest("tr[data-i]"); if (!tr) return; cur = +tr.dataset.i; location.hash = "opdracht"; });
$("exportPort").addEventListener("click", () => {
  if (typeof XLSX === "undefined") { toast("Excel-export is niet geladen. Controleer de internetverbinding."); return; }
  const EUR = "€ #,##0", PCT = "0.0%";
  const m = v => ({ t: "n", v: Math.round(v), z: EUR }), q = v => isFinite(v) ? { t: "n", v, z: PCT } : "";
  const aoa = [["Opdracht", "Signaal", "Huidig honorarium", "Kostprijs", "Minimumprijs", "Adviesprijs", "Begrote marge", "Gerealiseerde marge", "Status", "Offerteprijs", "Reden"]]
    .concat(portRows().map(({ o, c }) => [o.code, c.sig ? SIGTXT[c.sig] : "", c.hon ? m(c.hon) : "", m(c.kost), m(c.min), m(c.adv), q(c.margeHon), c.nac ? q(c.nac.marge) : "",
      o.status === "goedgekeurd" ? "Afgerond" : "Concept", o.prijs ? m(o.prijs) : "", o.reden || ""]));
  const wb = XLSX.utils.book_new(), ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 14 }, { wch: 16 }, ...Array(6).fill({ wch: 16 }), { wch: 12 }, { wch: 14 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, ws, "Portefeuille");
  download(`KISS-portefeuille-${fileStamp()}.xlsx`, new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  toast("Portefeuille gedownload");
});

/* ---------- instellingen ---------- */
function renderSet() {
  const p = S.params;
  $("s-tar").innerHTML = LV.map((l, i) => `<label>${l} (€ per uur)<input id="s-t${i}" type="number" min="0" step="1" value="${p.tarief[i]}"></label>`).join("");
  $("s-toe").value = Math.round(p.toeslag * 100); $("s-eerste").value = Math.round((p.eersteToeslag || 0) * 100);
  $("s-mar").value = Math.round(p.marge * 100); $("s-ops").value = Math.round(p.opslag * 100); $("s-min").value = Math.round(p.minMarge * 100);
  document.querySelectorAll("#s-meth button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === p.methode)));
  $("s-fac").innerHTML = `<div class="facs">
    <table><thead><tr><th>Omzet vanaf (€)</th><th>Omvangfactor</th></tr></thead><tbody>${p.omvang.map(([g, f], i) => `<tr><td><input id="s-og${i}" type="number" step="500000" value="${g}" aria-label="Omzet vanaf"></td><td><input id="s-of${i}" type="number" step="0.05" value="${f}" aria-label="Omvangfactor"></td></tr>`).join("")}</tbody></table>
    <table><thead><tr><th></th><th>Risico</th><th>Complexiteit</th></tr></thead><tbody>${[1, 2, 3].map(k => `<tr><td>${LEVEL3[k]}</td><td><input id="s-r${k}" type="number" step="0.05" value="${p.risico[k]}" aria-label="Risicofactor ${LEVEL3[k]}"></td><td><input id="s-c${k}" type="number" step="0.05" value="${p.complex[k]}" aria-label="Complexiteitsfactor ${LEVEL3[k]}"></td></tr>`).join("")}</tbody></table></div>`;
  setWarn();
}
function setWarn() {
  const p = S.params, advF = p.methode === "Marge" ? 1 / (1 - p.marge) : 1 + p.opslag, minF = 1 / (1 - p.minMarge);
  $("s-warn").innerHTML = advF < minF ? `<div class="warn">Met dit beleid ligt de adviesprijs onder de minimumprijs. Verhoog de marge of opslag, of verlaag de minimale marge.</div>` : "";
}
$("v-instellingen").addEventListener("input", e => {
  const p = S.params, id = e.target.id, v = +e.target.value;
  if (!id) return;
  if (/^s-t\d$/.test(id)) p.tarief[+id.slice(3)] = v;
  else if (id === "s-toe") p.toeslag = v / 100; else if (id === "s-eerste") p.eersteToeslag = v / 100;
  else if (id === "s-mar") p.marge = Math.min(0.95, v / 100); else if (id === "s-ops") p.opslag = v / 100; else if (id === "s-min") p.minMarge = Math.min(0.95, v / 100);
  else if (id.startsWith("s-og")) p.omvang[+id.slice(4)][0] = v; else if (id.startsWith("s-of")) p.omvang[+id.slice(4)][1] = v;
  else if (id.startsWith("s-c")) p.complex[id.slice(3)] = v; else if (id.startsWith("s-r")) p.risico[id.slice(3)] = v;
  save(); setWarn();
});
$("s-meth").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; S.params.methode = b.dataset.v; save(); renderSet(); });
let armed = false;
$("reset").addEventListener("click", () => {
  if (!armed) { armed = true; $("reset").textContent = "Klik nogmaals om te bevestigen"; $("resetMsg").textContent = "Alle eigen opdrachten en instellingen gaan verloren.";
    setTimeout(() => { armed = false; $("reset").textContent = "Demo terugzetten naar voorbeelddata"; $("resetMsg").textContent = ""; }, 4000); return; }
  S = DEFAULTS(); cur = 0; save(); armed = false; $("reset").textContent = "Demo terugzetten naar voorbeelddata"; $("resetMsg").textContent = ""; renderSet(); toast("Voorbeelddata teruggezet");
});

/* ---------- bibliotheek ---------- */
function renderLib() {
  $("lib").innerHTML = `<thead><tr><th>Post</th><th>Werkzaamheid</th><th>Driver</th><th class="r">Normuren</th>${LV.map(l => `<th class="r">% ${l}</th>`).join("")}<th>Check</th><th></th></tr></thead><tbody>` +
    S.lib.map((w, i) => {
      const sum = w.pct.reduce((a, b) => a + (+b || 0), 0), ok = Math.abs(sum - 1) < 0.001;
      return `<tr><td class="post" data-l="Post"><textarea rows="1" data-i="${i}" data-k="post" aria-label="Post">${esc(w.post)}</textarea></td>
        <td class="wz" data-l="Werkzaamheid"><textarea rows="1" data-i="${i}" data-k="wz" aria-label="Werkzaamheid">${esc(w.wz)}</textarea></td>
        <td class="drv" data-l="Driver"><select data-i="${i}" data-k="driver" aria-label="Driver">${DRIVERS.map(d => `<option ${d === w.driver ? "selected" : ""}>${d}</option>`).join("")}</select></td>
        <td class="r" data-l="Normuren"><input class="n" type="number" min="0" step="1" data-i="${i}" data-k="uren" value="${w.uren}" aria-label="Normuren"></td>
        ${w.pct.map((x, j) => `<td class="r" data-l="% ${LV[j]}"><input class="n" type="number" min="0" max="100" step="5" data-i="${i}" data-k="p${j}" value="${Math.round(x * 100)}" aria-label="Percentage ${LV[j]}"></td>`).join("")}
        <td class="chk" data-l="Check"><span class="pill ${ok ? "GROEN" : "ROOD"}" id="chk${i}">${ok ? "100%" : Math.round(sum * 100) + "%"}</span></td>
        <td class="dl"><button class="del" type="button" data-del="${i}" aria-label="Verwijder ${esc(w.wz)}">×</button></td></tr>`;
    }).join("") + `</tbody>`;
  fitAreas();
}
function fitAreas() { document.querySelectorAll("#lib textarea").forEach(t => { t.style.height = "auto"; t.style.height = t.scrollHeight + 2 + "px"; }); }
window.addEventListener("resize", () => { if (!$("v-bibliotheek").hidden) fitAreas(); });
$("lib").addEventListener("input", e => {
  const t = e.target, i = +t.dataset.i, k = t.dataset.k; if (isNaN(i) || !k) return;
  const w = S.lib[i];
  if (/^p\d$/.test(k)) {
    w.pct[+k[1]] = (+t.value || 0) / 100;
    const sum = w.pct.reduce((a, b) => a + b, 0), ok = Math.abs(sum - 1) < 0.001, el = $("chk" + i);
    el.className = "pill " + (ok ? "GROEN" : "ROOD"); el.textContent = ok ? "100%" : Math.round(sum * 100) + "%";
  } else if (k === "uren") w.uren = +t.value || 0;
  else if (k !== "driver") { w[k] = t.value; if (t.tagName === "TEXTAREA") { t.style.height = "auto"; t.style.height = t.scrollHeight + 2 + "px"; } }
  save();
});
$("lib").addEventListener("change", e => { if (e.target.dataset.k === "driver") { S.lib[+e.target.dataset.i].driver = e.target.value; save(); } });
$("lib").addEventListener("click", e => { const b = e.target.closest("[data-del]"); if (!b) return; S.lib.splice(+b.dataset.del, 1); save(); renderLib(); toast("Werkzaamheid verwijderd"); });
$("addRow").addEventListener("click", () => { S.lib.push({ post: "Nieuwe post", wz: "Nieuwe werkzaamheid", driver: "Omvang", uren: 4, pct: [0.4, 0.3, 0.2, 0.1, 0] }); save(); renderLib(); const ins = $("lib").querySelectorAll("tbody tr:last-child input"); if (ins[1]) ins[1].focus(); });

route();
