import React, { useState, useEffect, useRef } from "react";

/* ============================================================
   ASSISTANT PÉDAGOGIQUE — application monofichier organisée en couches :
   1. Design tokens (CSS)        4. Moteur IA (appel API + rôles)
   2. Utilitaires (md, export)   5. Modules fonctionnels
   3. Stockage persistant        6. Coquille applicative (App)
   ============================================================ */

/* ------------------------ 1. STYLES ------------------------ */
const CSS = `
:root{
  --paper:#F7F7F4; --ink:#20241F; --muted:#6B7069; --pine:#2E5E4E;
  --pine-dark:#234A3E; --sage:#EDF2EF; --border:#DFE2DC; --amber:#8A5A1B;
  --amber-bg:#F6EFE2; --white:#FFFFFF; --danger:#8C3A2E;
  --serif: Georgia,'Iowan Old Style','Times New Roman',serif;
  --sans: system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  --mono: ui-monospace,'SF Mono',Menlo,monospace;
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--paper);color:var(--ink);font-family:var(--sans);font-size:15px;line-height:1.55}
.app{display:flex;min-height:100vh}
.rail{width:232px;flex-shrink:0;border-right:1px solid var(--border);background:var(--white);
  display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto}
.rail-brand{padding:20px 18px 14px;border-bottom:1px solid var(--border)}
.rail-brand h1{font-family:var(--serif);font-size:17px;font-weight:600;letter-spacing:-.01em}
.rail-brand p{font-size:11.5px;color:var(--muted);margin-top:2px}
.rail-group{padding:12px 10px 4px}
.rail-group>span{display:block;font-family:var(--mono);font-size:10px;text-transform:uppercase;
  letter-spacing:.09em;color:var(--muted);padding:0 8px 5px}
.rail button{display:flex;align-items:center;gap:8px;width:100%;text-align:left;border:0;background:none;
  padding:7px 8px;border-radius:6px;font-size:13.5px;color:var(--ink);cursor:pointer;font-family:var(--sans)}
.rail button:hover{background:var(--sage)}
.rail button.on{background:var(--pine);color:#fff}
.rail button:focus-visible{outline:2px solid var(--pine);outline-offset:1px}
.ctx-chip{margin:auto 10px 14px;padding:10px 12px;background:var(--sage);border:1px solid var(--border);
  border-radius:8px;font-size:12px}
.ctx-chip b{display:block;font-family:var(--mono);font-size:10px;text-transform:uppercase;
  letter-spacing:.08em;color:var(--pine);margin-bottom:4px}
.ctx-chip .t{font-weight:600;font-size:12.5px}
.ctx-chip .m{color:var(--muted);margin-top:2px}
.ctx-chip button{margin-top:6px;padding:3px 0;font-size:11.5px;color:var(--danger);background:none;border:0;cursor:pointer;text-decoration:underline}
.main{flex:1;min-width:0;padding:34px 40px 80px;display:flex;justify-content:center}
.col{width:100%;max-width:880px}
.eyebrow{font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--pine);margin-bottom:6px}
h2.page{font-family:var(--serif);font-size:27px;font-weight:600;letter-spacing:-.015em;margin-bottom:6px}
p.lede{color:var(--muted);margin-bottom:26px;max-width:620px}
.panel{background:var(--white);border:1px solid var(--border);border-radius:10px;padding:20px 22px;margin-bottom:18px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px 16px}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px 16px}
.field label{display:block;font-size:12.5px;font-weight:600;margin-bottom:4px}
.field input,.field select,.field textarea{width:100%;padding:8px 10px;border:1px solid var(--border);
  border-radius:7px;font-size:14px;font-family:var(--sans);background:var(--white);color:var(--ink)}
.field textarea{resize:vertical;min-height:70px}
.field input:focus,.field select:focus,.field textarea:focus{outline:2px solid var(--pine);outline-offset:-1px;border-color:var(--pine)}
.btn{display:inline-flex;align-items:center;gap:7px;padding:9px 16px;border-radius:7px;border:1px solid var(--pine);
  background:var(--pine);color:#fff;font-size:13.5px;font-weight:600;cursor:pointer;font-family:var(--sans)}
.btn:hover{background:var(--pine-dark)}
.btn:disabled{opacity:.5;cursor:default}
.btn.ghost{background:var(--white);color:var(--pine)}
.btn.ghost:hover{background:var(--sage)}
.btn.sm{padding:5px 10px;font-size:12.5px}
.btn.danger{border-color:var(--danger);background:var(--white);color:var(--danger)}
.btn:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:14px 0}
.note{background:var(--amber-bg);border:1px solid #E5D6BC;color:var(--amber);border-radius:8px;
  padding:10px 14px;font-size:13px;margin:10px 0}
.err{background:#F7E8E5;border:1px solid #E3C4BD;color:var(--danger);border-radius:8px;padding:10px 14px;font-size:13px;margin:10px 0}
.spin{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;
  border-radius:50%;animation:sp .7s linear infinite}
.spin.dark{border-color:#cfd8d2;border-top-color:var(--pine)}
@keyframes sp{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.spin{animation-duration:1.6s}}
/* rendu markdown */
.md h3{font-family:var(--serif);font-size:18px;margin:16px 0 6px}
.md h4{font-size:14.5px;margin:13px 0 4px}
.md p{margin:7px 0}
.md ul,.md ol{margin:7px 0 7px 22px}
.md li{margin:3px 0}
.md strong{font-weight:650}
.md table{border-collapse:collapse;width:100%;margin:10px 0;font-size:13.5px}
.md th,.md td{border:1px solid var(--border);padding:6px 9px;text-align:left;vertical-align:top}
.md th{background:var(--sage);font-weight:600}
/* tableaux structurés */
table.data{border-collapse:collapse;width:100%;font-size:13.5px}
table.data th,table.data td{border:1px solid var(--border);padding:7px 10px;text-align:left;vertical-align:top}
table.data th{background:var(--sage);font-weight:600;font-size:12.5px}
table.data td input,table.data td textarea{width:100%;border:1px solid transparent;background:transparent;
  font-family:var(--sans);font-size:13px;padding:2px;border-radius:4px;resize:vertical}
table.data td input:focus,table.data td textarea:focus{outline:none;border-color:var(--pine);background:var(--white)}
.rowops{display:flex;gap:4px}
.rowops button{border:1px solid var(--border);background:var(--white);border-radius:5px;width:24px;height:24px;
  cursor:pointer;font-size:12px;line-height:1;color:var(--muted)}
.rowops button:hover{border-color:var(--pine);color:var(--pine)}
/* chat */
.chat-scroll{max-height:56vh;overflow-y:auto;padding:4px 2px;display:flex;flex-direction:column;gap:14px}
.msg{max-width:92%}
.msg.user{align-self:flex-end;background:var(--pine);color:#fff;border-radius:12px 12px 3px 12px;padding:10px 14px;font-size:14px}
.msg.ai{align-self:flex-start;background:var(--white);border:1px solid var(--border);border-radius:12px 12px 12px 3px;padding:12px 16px;font-size:14px}
.chat-input{display:flex;gap:8px;margin-top:14px}
.chat-input textarea{flex:1;padding:10px 12px;border:1px solid var(--border);border-radius:8px;font-size:14px;
  font-family:var(--sans);resize:none;min-height:46px;max-height:140px}
.chat-input textarea:focus{outline:2px solid var(--pine);outline-offset:-1px}
/* accueil */
.home-hero{padding:26px 0 10px}
.home-hero h2{font-family:var(--serif);font-size:36px;font-weight:600;letter-spacing:-.02em;line-height:1.15;max-width:560px}
.home-hero p{color:var(--muted);margin-top:10px;font-size:15.5px;max-width:520px}
.action-list{margin-top:28px;border-top:1px solid var(--border)}
.action-list button{display:flex;align-items:baseline;gap:14px;width:100%;text-align:left;border:0;background:none;
  border-bottom:1px solid var(--border);padding:15px 6px;cursor:pointer;font-family:var(--sans)}
.action-list button:hover{background:var(--sage)}
.action-list .ico{font-size:16px;width:24px;flex-shrink:0}
.action-list .lbl{font-size:15px;font-weight:600}
.action-list .dsc{font-size:13px;color:var(--muted);margin-left:auto;text-align:right;max-width:46%}
/* bibliothèque */
.lib-item{display:flex;align-items:center;gap:12px;padding:12px 6px;border-bottom:1px solid var(--border)}
.lib-item .k{font-family:var(--mono);font-size:10.5px;text-transform:uppercase;letter-spacing:.07em;
  background:var(--sage);color:var(--pine);border:1px solid var(--border);border-radius:5px;padding:3px 7px;flex-shrink:0}
.lib-item .t{font-weight:600;font-size:14px}
.lib-item .d{font-size:12px;color:var(--muted)}
.lib-item .ops{margin-left:auto;display:flex;gap:6px}
.next{margin-top:18px;padding:16px 18px;background:var(--sage);border:1px solid var(--border);border-radius:10px}
.next b{display:block;font-size:13px;margin-bottom:8px}
.tag-eval{display:inline-block;font-family:var(--mono);font-size:10.5px;background:var(--sage);
  border:1px solid var(--border);border-radius:4px;padding:2px 6px;margin-left:8px;color:var(--pine)}
@media(max-width:860px){
  .app{flex-direction:column}
  .rail{width:100%;height:auto;position:static;flex-direction:row;flex-wrap:wrap;align-items:center;gap:2px;padding:8px}
  .rail-brand{border:0;padding:8px 12px}
  .rail-group{display:flex;padding:4px;gap:2px}
  .rail-group>span{display:none}
  .rail button{width:auto}
  .ctx-chip{display:none}
  .main{padding:20px 16px 60px}
  .grid2,.grid3{grid-template-columns:1fr}
  .home-hero h2{font-size:28px}
}
`;

/* ------------------- 2. UTILITAIRES ------------------------ */
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Mini-rendu markdown (titres, gras, listes, tableaux) — suffisant pour les réponses de l'assistant.
function mdToHtml(md) {
  const lines = String(md || "").split("\n");
  let html = "", inUl = false, inOl = false, tableBuf = [];
  const closeLists = () => { if (inUl) { html += "</ul>"; inUl = false; } if (inOl) { html += "</ol>"; inOl = false; } };
  const inline = (t) => esc(t)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
  const flushTable = () => {
    if (!tableBuf.length) return;
    const rows = tableBuf.filter(r => !/^\s*\|?[\s:-]+\|/.test(r) || !/^[\s|:-]+$/.test(r));
    let t = "<table>";
    rows.forEach((r, i) => {
      const cells = r.replace(/^\||\|$/g, "").split("|").map(c => inline(c.trim()));
      t += "<tr>" + cells.map(c => (i === 0 ? `<th>${c}</th>` : `<td>${c}</td>`)).join("") + "</tr>";
    });
    html += t + "</table>"; tableBuf = [];
  };
  for (const raw of lines) {
    const l = raw.trimEnd();
    if (/^\s*\|.*\|\s*$/.test(l)) { closeLists(); tableBuf.push(l); continue; }
    flushTable();
    if (/^###\s/.test(l)) { closeLists(); html += `<h4>${inline(l.slice(4))}</h4>`; }
    else if (/^##\s/.test(l)) { closeLists(); html += `<h3>${inline(l.slice(3))}</h3>`; }
    else if (/^#\s/.test(l)) { closeLists(); html += `<h3>${inline(l.slice(2))}</h3>`; }
    else if (/^\s*[-*]\s/.test(l)) { if (!inUl) { closeLists(); html += "<ul>"; inUl = true; } html += `<li>${inline(l.replace(/^\s*[-*]\s/, ""))}</li>`; }
    else if (/^\s*\d+[.)]\s/.test(l)) { if (!inOl) { closeLists(); html += "<ol>"; inOl = true; } html += `<li>${inline(l.replace(/^\s*\d+[.)]\s/, ""))}</li>`; }
    else if (l.trim() === "") { closeLists(); }
    else { closeLists(); html += `<p>${inline(l)}</p>`; }
  }
  closeLists(); flushTable();
  return html;
}

// Export : presse-papier, impression (→ PDF), fichier Word (.doc HTML).
const PRINT_CSS = `body{font-family:Georgia,serif;color:#20241F;max-width:800px;margin:40px auto;line-height:1.5;font-size:13px}
h1{font-size:22px;border-bottom:2px solid #2E5E4E;padding-bottom:6px}h3{font-size:16px;color:#2E5E4E}h4{font-size:13.5px}
table{border-collapse:collapse;width:100%;margin:10px 0}th,td{border:1px solid #999;padding:6px 8px;text-align:left;font-size:12px}
th{background:#EDF2EF}`;

function exportHtmlDoc(title, bodyHtml) {
  return `<html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${PRINT_CSS}</style></head>
  <body><h1>${esc(title)}</h1>${bodyHtml}</body></html>`;
}
function doPrint(title, bodyHtml) {
  const w = window.open("", "_blank");
  if (!w) return alert("Autorisez les fenêtres pop-up pour imprimer / exporter en PDF.");
  w.document.write(exportHtmlDoc(title, bodyHtml));
  w.document.close(); w.focus();
  setTimeout(() => w.print(), 350);
}
function doWord(title, bodyHtml) {
  const blob = new Blob(["\ufeff", exportHtmlDoc(title, bodyHtml)], { type: "application/msword" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = title.replace(/[^\w\dàâéèêëîïôùûç -]/gi, "").slice(0, 60) + ".doc";
  a.click(); URL.revokeObjectURL(a.href);
}
async function doCopy(text, setOk) {
  try { await navigator.clipboard.writeText(text); setOk && setOk("Copié dans le presse-papier."); }
  catch { setOk && setOk("Impossible de copier automatiquement — sélectionnez le texte manuellement."); }
  setTimeout(() => setOk && setOk(""), 2500);
}

/* ---------------- 3. STOCKAGE PERSISTANT ------------------- */
// Stockage local du navigateur (localStorage). Les méthodes restent "async"
// pour ne rien changer au reste du code qui les attend avec await.
const store = {
  async list() {
    try {
      const out = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("projets:")) {
          try { out.push(JSON.parse(localStorage.getItem(k))); } catch {}
        }
      }
      return out.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    } catch { return []; }
  },
  async save(p) {
    const id = p.id || ("p" + Date.now());
    const proj = { ...p, id, date: new Date().toISOString() };
    try { localStorage.setItem("projets:" + id, JSON.stringify(proj)); return proj; }
    catch { return null; }
  },
  async remove(id) { try { localStorage.removeItem("projets:" + id); } catch {} },
};

/* -------------------- 4. MOTEUR IA ------------------------- */
// Socle commun : la spécialisation "conseiller pédagogique" de tous les rôles.
const SOCLE = `Tu es un expert français en ingénierie pédagogique et andragogie (taxonomie de Bloom révisée, alignement pédagogique, pédagogie active, apprentissage expérientiel, classe inversée, pédagogie différenciée, évaluation diagnostique/formative/sommative, charge cognitive).
Tu t'adresses à des formateurs et ingénieurs pédagogiques professionnels. Tu réponds toujours en français.
Ton rôle est celui d'un CONSEILLER, pas d'un simple générateur : tu challenges les choix discutables, tu signales les incohérences (verbe non observable, durée irréaliste, activité inadaptée au nombre de participants, absence d'évaluation...), tu expliques brièvement tes choix pédagogiques, et tu poses une question ciblée quand une information indispensable manque.
Tu tiens toujours compte : du public et de son niveau, de la durée disponible, du nombre de participants, de la modalité (présentiel / distanciel / hybride) et des contraintes matérielles.
Sois concret, structuré et directement exploitable. Pas de longs blocs de texte indigestes.`;

const ROLES = {
  assistant: SOCLE + `\nDans cette conversation, réponds de façon structurée (titres courts, listes) mais concise. Si l'utilisateur fait référence à un travail précédent de la session, poursuis-le au lieu de repartir de zéro.`,
  sequence: SOCLE + `\nTu es le concepteur de séquences. Tu produis des séquences pédagogiques complètes, réalistes et alignées (objectif ↔ activités ↔ évaluation).`,
  objectif: SOCLE + `\nTu es le spécialiste des objectifs pédagogiques : formulation SMART observable, verbes d'action de Bloom adaptés au niveau visé, ancrage dans le contexte professionnel.`,
  activite: SOCLE + `\nTu es l'expert en activités pédagogiques actives : mises en situation, études de cas, jeux de rôle, travaux de groupe, activités numériques. Tu proposes des activités réalistes et animables.`,
  evaluation: SOCLE + `\nTu es l'expert en évaluation : tu conçois des questions valides, sans ambiguïté, alignées sur les objectifs, avec distracteurs plausibles pour les QCM.`,
  analyste: SOCLE + `\nTu es l'analyste pédagogique : tu audites des déroulés, programmes et supports existants avec un regard critique, bienveillant et argumenté.`,
  adaptation: SOCLE + `\nTu es l'expert en adaptation : tu transposes une formation vers un autre public, une autre modalité ou un autre format en CONSERVANT l'objectif pédagogique, et tu expliques ce que tu as changé et pourquoi.`,
  deroule: SOCLE + `\nTu es le concepteur de déroulés pédagogiques : tu découpes une formation en temps réalistes (accueil, séquences, pauses, évaluations, clôture) avec horaires cohérents.`,
};

function ctxText(ctx) {
  if (!ctx) return "";
  const f = [];
  if (ctx.theme) f.push("Thème : " + ctx.theme);
  if (ctx.publicCible) f.push("Public : " + ctx.publicCible);
  if (ctx.niveau) f.push("Niveau : " + ctx.niveau);
  if (ctx.duree) f.push("Durée : " + ctx.duree);
  if (ctx.participants) f.push("Participants : " + ctx.participants);
  if (ctx.modalite) f.push("Modalité : " + ctx.modalite);
  if (ctx.objectif) f.push("Objectif : " + ctx.objectif);
  if (ctx.contraintes) f.push("Contraintes : " + ctx.contraintes);
  if (ctx.dernierTravail) f.push("Dernière production de la session (à réutiliser si l'utilisateur y fait référence) :\n" + ctx.dernierTravail.slice(0, 4000));
  return f.length ? "\n\nCONTEXTE DU PROJET EN COURS :\n" + f.join("\n") : "";
}

// L'appel à l'IA passe par notre propre fonction serveur (/api/chat).
// La clé Groq n'est JAMAIS dans le navigateur : elle reste côté serveur (voir api/chat.js).
async function askClaude({ role, messages, ctx, expectJson = false }) {
  let system = (ROLES[role] || ROLES.assistant) + ctxText(ctx);
  if (expectJson) system += `\nIMPORTANT : réponds UNIQUEMENT avec un objet JSON valide, sans texte avant/après, sans balises markdown.`;

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages, expectJson }),
  });

  if (!res.ok) throw new Error("Le moteur IA est momentanément indisponible (" + res.status + "). Réessayez.");
  const data = await res.json();
  const text = data.content || "";

  if (!expectJson) return text;
  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("{"), end = clean.lastIndexOf("}");
  return JSON.parse(clean.slice(start, end + 1));
}

/* ---------------- 5. COMPOSANTS PARTAGÉS ------------------- */
function Field({ label, children }) {
  return <div className="field"><label>{label}</label>{children}</div>;
}
function ExportBar({ title, getHtml, getText, onSave, saved }) {
  const [msg, setMsg] = useState("");
  return (
    <div className="bar" role="toolbar" aria-label="Exporter">
      <button className="btn sm ghost" onClick={() => doCopy(getText(), setMsg)}>Copier</button>
      <button className="btn sm ghost" onClick={() => doPrint(title, getHtml())}>PDF / Imprimer</button>
      <button className="btn sm ghost" onClick={() => doWord(title, getHtml())}>Word (.doc)</button>
      {onSave && <button className="btn sm" onClick={onSave}>{saved ? "✓ Enregistré" : "Enregistrer dans la bibliothèque"}</button>}
      {msg && <span style={{ fontSize: 12.5, color: "var(--pine)" }}>{msg}</span>}
    </div>
  );
}
function NextSteps({ go, hide = [] }) {
  const steps = [
    ["sequence", "Créer les séquences"], ["activites", "Générer des activités"],
    ["evaluations", "Créer l'évaluation"], ["deroule", "Construire le déroulé"],
    ["adaptation", "Adapter au public"],
  ].filter(([k]) => !hide.includes(k));
  return (
    <div className="next">
      <b>Que voulez-vous faire ensuite ? Les informations du projet seront réutilisées.</b>
      <div className="bar" style={{ margin: 0 }}>
        {steps.map(([k, l]) => <button key={k} className="btn sm ghost" onClick={() => go(k)}>{l} →</button>)}
      </div>
    </div>
  );
}
function CtxFields({ ctx, setCtx, withObjectif = true }) {
  const u = (k) => (e) => setCtx({ ...ctx, [k]: e.target.value });
  return (
    <>
      <div className="grid2">
        <Field label="Thème / sujet"><input value={ctx.theme || ""} onChange={u("theme")} placeholder="Ex. Excel, cybersécurité, communication…" /></Field>
        <Field label="Public"><input value={ctx.publicCible || ""} onChange={u("publicCible")} placeholder="Ex. agents administratifs, seniors, managers…" /></Field>
      </div>
      <div className="grid3" style={{ marginTop: 12 }}>
        <Field label="Niveau">
          <select value={ctx.niveau || ""} onChange={u("niveau")}>
            <option value="">—</option><option>Débutant</option><option>Intermédiaire</option><option>Avancé</option><option>Hétérogène</option>
          </select>
        </Field>
        <Field label="Durée"><input value={ctx.duree || ""} onChange={u("duree")} placeholder="Ex. 2 jours, 45 min…" /></Field>
        <Field label="Participants"><input value={ctx.participants || ""} onChange={u("participants")} placeholder="Ex. 12" /></Field>
      </div>
      <div className="grid2" style={{ marginTop: 12 }}>
        <Field label="Modalité">
          <select value={ctx.modalite || ""} onChange={u("modalite")}>
            <option value="">—</option><option>Présentiel</option><option>Distanciel</option><option>Hybride</option>
          </select>
        </Field>
        <Field label="Contraintes (matériel, salle, prérequis…)"><input value={ctx.contraintes || ""} onChange={u("contraintes")} placeholder="Ex. 6 PC seulement, pas de vidéoprojecteur…" /></Field>
      </div>
      {withObjectif && <div style={{ marginTop: 12 }}>
        <Field label="Objectif ou intention (même approximatif)"><textarea value={ctx.objectif || ""} onChange={u("objectif")} placeholder="Ex. Les participants doivent savoir se protéger des arnaques en ligne." /></Field>
      </div>}
    </>
  );
}

/* --------------------- 6. MODULES -------------------------- */

/* --- Accueil --- */
function Home({ go }) {
  const actions = [
    ["🧠", "Créer une formation", "Cadrez le projet et générez la première séquence", "sequence"],
    ["📚", "Créer une séquence", "Séquence complète : objectif, méthode, déroulement, évaluation", "sequence"],
    ["🎯", "Formuler un objectif", "Transformer une intention en objectif observable (Bloom)", "objectifs"],
    ["💡", "Trouver une activité", "Mises en situation, études de cas, jeux de rôle…", "activites"],
    ["📝", "Créer une évaluation", "QCM, quiz, questions ouvertes, cas pratiques", "evaluations"],
    ["🔍", "Analyser une formation", "Audit d'un déroulé ou programme existant", "analyse"],
    ["🔄", "Adapter une formation", "Autre public, autre modalité, autre format", "adaptation"],
    ["🗓", "Construire un déroulé", "Tableau horaire éditable et exportable", "deroule"],
    ["💬", "Discuter avec l'assistant", "Conseil pédagogique libre, avec suivi du contexte", "chat"],
  ];
  return (
    <div>
      <div className="home-hero">
        <div className="eyebrow">Assistant pédagogique</div>
        <h2>Concevez, structurez et améliorez vos formations plus rapidement.</h2>
        <p>Un conseiller en ingénierie pédagogique qui vous accompagne de l'idée à l'export : objectifs, séquences, activités, évaluations et déroulés.</p>
      </div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)", marginTop: 26 }}>Que souhaitez-vous faire ?</div>
      <div className="action-list">
        {actions.map(([ico, lbl, dsc, view], i) => (
          <button key={i} onClick={() => go(view)}>
            <span className="ico" aria-hidden>{ico}</span>
            <span className="lbl">{lbl}</span>
            <span className="dsc">{dsc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* --- Assistant conversationnel --- */
function Chat({ ctx, setCtx }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const scrollRef = useRef(null);
  useEffect(() => { scrollRef.current && (scrollRef.current.scrollTop = scrollRef.current.scrollHeight); }, [msgs, busy]);

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setErr(""); setInput("");
    const hist = [...msgs, { role: "user", content: q }];
    setMsgs(hist); setBusy(true);
    try {
      const answer = await askClaude({ role: "assistant", ctx, messages: hist.map(m => ({ role: m.role, content: m.content })) });
      setMsgs([...hist, { role: "assistant", content: answer }]);
      setCtx({ ...ctx, dernierTravail: answer });
    } catch (e) { setErr(e.message); setMsgs(hist); }
    setBusy(false);
  }
  const suggestions = [
    "Je dois créer une formation de 2 jours sur Excel pour des débutants.",
    "Donne-moi 3 méthodes pédagogiques pour un module de 45 min sur la cybersécurité.",
    "Est-ce que cet objectif est correctement formulé : « les participants doivent comprendre Excel » ?",
  ];
  return (
    <div>
      <div className="eyebrow">Conseiller</div>
      <h2 className="page">Assistant pédagogique</h2>
      <p className="lede">Expliquez votre besoin : l'assistant pose des questions si nécessaire, propose des solutions, et challenge vos choix quand c'est pertinent. Il conserve le fil de la session.</p>
      <div className="panel">
        <div className="chat-scroll" ref={scrollRef} aria-live="polite">
          {msgs.length === 0 && (
            <div style={{ color: "var(--muted)", fontSize: 13.5 }}>
              <p style={{ marginBottom: 8 }}>Exemples pour démarrer :</p>
              {suggestions.map((s, i) => (
                <button key={i} className="btn sm ghost" style={{ display: "block", margin: "6px 0", textAlign: "left" }} onClick={() => setInput(s)}>{s}</button>
              ))}
            </div>
          )}
          {msgs.map((m, i) => m.role === "user"
            ? <div key={i} className="msg user">{m.content}</div>
            : <div key={i} className="msg ai md" dangerouslySetInnerHTML={{ __html: mdToHtml(m.content) }} />
          )}
          {busy && <div className="msg ai"><span className="spin dark" aria-label="Réflexion en cours" /></div>}
        </div>
        {err && <div className="err">{err}</div>}
        <div className="chat-input">
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Décrivez votre besoin…"
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} aria-label="Votre message" />
          <button className="btn" onClick={send} disabled={busy || !input.trim()}>{busy ? <span className="spin" /> : "Envoyer"}</button>
        </div>
      </div>
    </div>
  );
}

/* --- Générateur de séquences --- */
const SEQ_KEYS = [["objectifPedagogique","Objectif pédagogique"],["competences","Compétences mobilisées"],["duree","Durée"],
  ["methode","Méthode pédagogique"],["deroulement","Déroulement"],["consignes","Consignes"],["activiteFormateur","Activité formateur"],
  ["activiteApprenant","Activité apprenant"],["materiel","Matériel nécessaire"],["evaluation","Modalités d'évaluation"],["criteres","Critères de réussite"]];

function SequenceGen({ ctx, setCtx, go, onSaveProject, initial }) {
  const [seq, setSeq] = useState(initial?.result || null);
  const [conseil, setConseil] = useState(initial?.conseil || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);

  async function generate() {
    setBusy(true); setErr(""); setSaved(false);
    try {
      const j = await askClaude({
        role: "sequence", ctx, expectJson: true,
        messages: [{ role: "user", content:
`Conçois une séquence pédagogique complète avec ces informations :
${ctxText(ctx) || "(aucune information : fais des hypothèses raisonnables et signale-les)"}
Réponds en JSON : {"titre": "...", "sequence": {"objectifPedagogique":"...","competences":"...","duree":"...","methode":"...","deroulement":"étapes numérotées avec durées","consignes":"...","activiteFormateur":"...","activiteApprenant":"...","materiel":"...","evaluation":"...","criteres":"..."}, "conseil": "1 à 3 phrases : point de vigilance ou amélioration que tu recommandes en tant que conseiller pédagogique"}` }],
      });
      setSeq(j); setConseil(j.conseil || "");
      setCtx({ ...ctx, objectif: j.sequence?.objectifPedagogique || ctx.objectif, dernierTravail: "Séquence « " + j.titre + " » :\n" + SEQ_KEYS.map(([k,l]) => l + " : " + (j.sequence?.[k] || "")).join("\n") });
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }
  const html = () => seq ? `<table><tbody>${SEQ_KEYS.map(([k,l]) => `<tr><th style="width:190px">${esc(l)}</th><td>${mdToHtml(seq.sequence?.[k] || "")}</td></tr>`).join("")}</tbody></table>${conseil ? `<h3>Conseil pédagogique</h3><p>${esc(conseil)}</p>` : ""}` : "";
  const txt = () => seq ? (seq.titre + "\n\n" + SEQ_KEYS.map(([k,l]) => l.toUpperCase() + "\n" + (seq.sequence?.[k] || "")).join("\n\n")) : "";

  return (
    <div>
      <div className="eyebrow">Concevoir</div>
      <h2 className="page">Générateur de séquences</h2>
      <p className="lede">Renseignez le cadre — l'assistant génère une séquence alignée (objectif ↔ activités ↔ évaluation) et vous signale les points de vigilance.</p>
      <div className="panel">
        <CtxFields ctx={ctx} setCtx={setCtx} />
        <div className="bar"><button className="btn" onClick={generate} disabled={busy}>{busy ? <><span className="spin" /> Conception en cours…</> : "Générer la séquence"}</button></div>
        {err && <div className="err">{err}</div>}
      </div>
      {seq && (
        <div className="panel">
          <h3 style={{ fontFamily: "var(--serif)", fontSize: 20, marginBottom: 12 }}>{seq.titre}</h3>
          <table className="data"><tbody>
            {SEQ_KEYS.map(([k, l]) => <tr key={k}><th style={{ width: 185 }}>{l}</th><td className="md" dangerouslySetInnerHTML={{ __html: mdToHtml(seq.sequence?.[k] || "") }} /></tr>)}
          </tbody></table>
          {conseil && <div className="note"><b>Conseil pédagogique :</b> {conseil}</div>}
          <ExportBar title={seq.titre || "Séquence pédagogique"} getHtml={html} getText={txt} saved={saved}
            onSave={async () => { await onSaveProject({ module: "sequence", type: "Séquence", titre: seq.titre, form: ctx, result: seq, conseil }); setSaved(true); }} />
          <NextSteps go={go} hide={["sequence"]} />
        </div>
      )}
    </div>
  );
}

/* --- Objectifs pédagogiques --- */
function Objectifs({ ctx, setCtx, go, onSaveProject }) {
  const [mode, setMode] = useState("formuler");
  const [intent, setIntent] = useState(ctx.objectif || "");
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);

  async function run() {
    if (!intent.trim()) return;
    setBusy(true); setErr(""); setRes(null); setSaved(false);
    try {
      const prompt = mode === "formuler"
        ? `Transforme cette intention en objectifs pédagogiques mesurables : « ${intent} »
Réponds en JSON : {"analyse":"2 phrases max sur l'intention de départ","objectifs":[{"formulation":"À l'issue de..., les participants seront capables de...","niveauBloom":"...","verbes":"verbes d'action utilisés","evaluation":"comment l'évaluer concrètement"}] (2 à 3 propositions de niveaux différents), "conseil":"recommandation du conseiller pédagogique"}`
        : `Analyse cette formulation d'objectif pédagogique : « ${intent} »
Réponds en JSON : {"verdict":"correct | à améliorer | à reformuler","analyse":"points forts et faiblesses (verbe observable ? mesurable ? contextualisé ?)","objectifs":[{"formulation":"version améliorée","niveauBloom":"...","verbes":"...","evaluation":"..."}],"conseil":"recommandation"}`;
      const j = await askClaude({ role: "objectif", ctx, expectJson: true, messages: [{ role: "user", content: prompt }] });
      setRes(j);
      const first = j.objectifs?.[0]?.formulation;
      if (first) setCtx({ ...ctx, objectif: first, dernierTravail: "Objectifs proposés :\n" + j.objectifs.map(o => "- " + o.formulation).join("\n") });
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }
  const html = () => res ? `${res.verdict ? `<p><strong>Verdict :</strong> ${esc(res.verdict)}</p>` : ""}<p>${esc(res.analyse || "")}</p><table><tr><th>Formulation</th><th>Niveau (Bloom)</th><th>Évaluation possible</th></tr>${(res.objectifs || []).map(o => `<tr><td>${esc(o.formulation)}</td><td>${esc(o.niveauBloom)}</td><td>${esc(o.evaluation)}</td></tr>`).join("")}</table><p><em>${esc(res.conseil || "")}</em></p>` : "";
  const txt = () => res ? [(res.verdict ? "Verdict : " + res.verdict : ""), res.analyse, ...(res.objectifs || []).map((o, i) => `${i + 1}. ${o.formulation} (${o.niveauBloom})`), "Conseil : " + (res.conseil || "")].filter(Boolean).join("\n\n") : "";

  return (
    <div>
      <div className="eyebrow">Concevoir</div>
      <h2 className="page">Objectifs pédagogiques</h2>
      <p className="lede">Transformez une intention générale en objectif observable et mesurable, ou faites analyser une formulation existante.</p>
      <div className="panel">
        <div className="bar" role="tablist" style={{ marginTop: 0 }}>
          <button className={"btn sm " + (mode === "formuler" ? "" : "ghost")} onClick={() => setMode("formuler")}>Formuler un objectif</button>
          <button className={"btn sm " + (mode === "analyser" ? "" : "ghost")} onClick={() => setMode("analyser")}>Analyser une formulation</button>
        </div>
        <Field label={mode === "formuler" ? "Intention de départ" : "Objectif à analyser"}>
          <textarea value={intent} onChange={e => setIntent(e.target.value)}
            placeholder={mode === "formuler" ? "Ex. Les participants doivent connaître Excel" : "Ex. À l'issue de la séance, les participants comprendront les bases d'Excel."} />
        </Field>
        <div className="bar"><button className="btn" onClick={run} disabled={busy || !intent.trim()}>{busy ? <><span className="spin" /> Analyse…</> : (mode === "formuler" ? "Proposer des objectifs" : "Analyser")}</button></div>
        {err && <div className="err">{err}</div>}
      </div>
      {res && (
        <div className="panel">
          {res.verdict && <p style={{ marginBottom: 8 }}><strong>Verdict :</strong> {res.verdict}</p>}
          {res.analyse && <p style={{ marginBottom: 12, color: "var(--muted)" }}>{res.analyse}</p>}
          <table className="data"><thead><tr><th>Formulation proposée</th><th style={{ width: 130 }}>Niveau (Bloom)</th><th style={{ width: 220 }}>Évaluation possible</th></tr></thead><tbody>
            {(res.objectifs || []).map((o, i) => <tr key={i}><td>{o.formulation}</td><td>{o.niveauBloom}</td><td>{o.evaluation}</td></tr>)}
          </tbody></table>
          {res.conseil && <div className="note"><b>Conseil :</b> {res.conseil}</div>}
          <ExportBar title="Objectifs pédagogiques" getHtml={html} getText={txt} saved={saved}
            onSave={async () => { await onSaveProject({ module: "objectifs", type: "Objectifs", titre: "Objectifs — " + (ctx.theme || intent.slice(0, 40)), form: { intent, mode }, result: res }); setSaved(true); }} />
          <NextSteps go={go} />
        </div>
      )}
    </div>
  );
}

/* --- Générateur d'activités --- */
const ACT_TYPES = ["Au choix de l'assistant","Mise en situation","Étude de cas","Jeu de rôle","Travail de groupe","Brainstorming","Simulation","Jeu pédagogique","Activité individuelle","Activité collaborative","Activité numérique"];
function Activites({ ctx, setCtx, go, onSaveProject }) {
  const [type, setType] = useState(ACT_TYPES[0]);
  const [nb, setNb] = useState(2);
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);

  async function run() {
    setBusy(true); setErr(""); setRes(null); setSaved(false);
    try {
      const j = await askClaude({
        role: "activite", ctx, expectJson: true,
        messages: [{ role: "user", content:
`Propose ${nb} activité(s) pédagogique(s)${type !== ACT_TYPES[0] ? " de type « " + type + " »" : " de types variés"} pour ce projet.
Réponds en JSON : {"activites":[{"titre":"...","typeActivite":"...","objectif":"...","duree":"...","participants":"organisation du groupe","materiel":"...","consignes":"consignes données aux apprenants","roleFormateur":"...","deroulement":"étapes","debrief":"correction ou débrief","criteres":"critères de réussite"}],"conseil":"point de vigilance d'animation"}` }],
      });
      setRes(j);
      setCtx({ ...ctx, dernierTravail: "Activités proposées :\n" + (j.activites || []).map(a => "- " + a.titre + " (" + a.duree + ")").join("\n") });
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }
  const ROWS = [["objectif","Objectif"],["duree","Durée"],["participants","Participants"],["materiel","Matériel"],["consignes","Consignes apprenant"],["roleFormateur","Rôle du formateur"],["deroulement","Déroulement"],["debrief","Correction / débrief"],["criteres","Critères de réussite"]];
  const html = () => res ? (res.activites || []).map(a => `<h3>${esc(a.titre)} — ${esc(a.typeActivite)}</h3><table><tbody>${ROWS.map(([k,l]) => `<tr><th style="width:170px">${esc(l)}</th><td>${mdToHtml(a[k] || "")}</td></tr>`).join("")}</tbody></table>`).join("") : "";
  const txt = () => res ? (res.activites || []).map(a => a.titre + " (" + a.typeActivite + ")\n" + ROWS.map(([k,l]) => l + " : " + (a[k] || "")).join("\n")).join("\n\n---\n\n") : "";

  return (
    <div>
      <div className="eyebrow">Concevoir</div>
      <h2 className="page">Générateur d'activités</h2>
      <p className="lede">Des activités animables, dimensionnées pour votre groupe, votre durée et votre matériel.</p>
      <div className="panel">
        <CtxFields ctx={ctx} setCtx={setCtx} />
        <div className="grid2" style={{ marginTop: 12 }}>
          <Field label="Type d'activité"><select value={type} onChange={e => setType(e.target.value)}>{ACT_TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Nombre de propositions"><select value={nb} onChange={e => setNb(+e.target.value)}>{[1,2,3].map(n => <option key={n} value={n}>{n}</option>)}</select></Field>
        </div>
        <div className="bar"><button className="btn" onClick={run} disabled={busy}>{busy ? <><span className="spin" /> Conception…</> : "Proposer des activités"}</button></div>
        {err && <div className="err">{err}</div>}
      </div>
      {res && (
        <div className="panel">
          {(res.activites || []).map((a, i) => (
            <div key={i} style={{ marginBottom: 22 }}>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 18, marginBottom: 8 }}>{a.titre} <span className="tag-eval">{a.typeActivite}</span></h3>
              <table className="data"><tbody>{ROWS.map(([k, l]) => <tr key={k}><th style={{ width: 165 }}>{l}</th><td className="md" dangerouslySetInnerHTML={{ __html: mdToHtml(a[k] || "") }} /></tr>)}</tbody></table>
            </div>
          ))}
          {res.conseil && <div className="note"><b>Conseil d'animation :</b> {res.conseil}</div>}
          <ExportBar title={"Activités — " + (ctx.theme || "formation")} getHtml={html} getText={txt} saved={saved}
            onSave={async () => { await onSaveProject({ module: "activites", type: "Activités", titre: "Activités — " + (ctx.theme || "sans thème"), form: ctx, result: res }); setSaved(true); }} />
          <NextSteps go={go} hide={["activites"]} />
        </div>
      )}
    </div>
  );
}

/* --- Générateur d'évaluations --- */
function Evaluations({ ctx, setCtx, go, onSaveProject }) {
  const [form, setForm] = useState({ nb: 10, type: "QCM", difficulte: "Mixte", moment: "Formative" });
  const [res, setRes] = useState(null);
  const [showAns, setShowAns] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);
  const u = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function run() {
    setBusy(true); setErr(""); setRes(null); setSaved(false);
    try {
      const j = await askClaude({
        role: "evaluation", ctx, expectJson: true,
        messages: [{ role: "user", content:
`Crée une évaluation ${form.moment.toLowerCase()} de type « ${form.type} », ${form.nb} questions, difficulté ${form.difficulte.toLowerCase()}, alignée sur le projet en contexte.
Réponds en JSON : {"titre":"...","questions":[{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."] (uniquement si QCM/quiz, sinon []),"reponse":"réponse correcte ou éléments de réponse attendus","explication":"...","difficulte":"facile|moyen|difficile","competence":"compétence évaluée"}],"conseil":"conseil de passation ou de correction"}
Si ${form.nb} questions est trop long pour une réponse, produis-en autant que possible de qualité (minimum ${Math.min(form.nb, 8)}).` }],
      });
      setRes(j);
      setCtx({ ...ctx, dernierTravail: "Évaluation « " + j.titre + " » (" + (j.questions || []).length + " questions)" });
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }
  const html = () => res ? (res.questions || []).map((q, i) => `<h4>Q${i + 1}. ${esc(q.question)} <em>(${esc(q.difficulte)} — ${esc(q.competence)})</em></h4>${(q.options || []).length ? "<ul>" + q.options.map(o => `<li>${esc(o)}</li>`).join("") + "</ul>" : ""}<p><strong>Réponse :</strong> ${esc(q.reponse)}<br><strong>Explication :</strong> ${esc(q.explication)}</p>`).join("") : "";
  const txt = () => res ? (res.questions || []).map((q, i) => `Q${i + 1}. ${q.question}\n${(q.options || []).join("\n")}\nRéponse : ${q.reponse}\nExplication : ${q.explication}\n(${q.difficulte} — ${q.competence})`).join("\n\n") : "";

  return (
    <div>
      <div className="eyebrow">Évaluer</div>
      <h2 className="page">Générateur d'évaluations</h2>
      <p className="lede">QCM, quiz, questions ouvertes ou cas pratiques — avec corrigé, explication, difficulté et compétence évaluée pour chaque question.</p>
      <div className="panel">
        <CtxFields ctx={ctx} setCtx={setCtx} />
        <div className="grid2" style={{ marginTop: 12 }}>
          <Field label="Type"><select value={form.type} onChange={u("type")}>{["QCM","Quiz vrai/faux","Questions ouvertes","Étude de cas","Évaluation pratique"].map(t => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Moment"><select value={form.moment} onChange={u("moment")}>{["Diagnostique","Formative","Sommative"].map(t => <option key={t}>{t}</option>)}</select></Field>
        </div>
        <div className="grid2" style={{ marginTop: 12 }}>
          <Field label="Nombre de questions"><input type="number" min="1" max="20" value={form.nb} onChange={u("nb")} /></Field>
          <Field label="Difficulté"><select value={form.difficulte} onChange={u("difficulte")}>{["Facile","Moyenne","Difficile","Mixte"].map(t => <option key={t}>{t}</option>)}</select></Field>
        </div>
        <div className="bar"><button className="btn" onClick={run} disabled={busy}>{busy ? <><span className="spin" /> Rédaction…</> : "Générer l'évaluation"}</button></div>
        {err && <div className="err">{err}</div>}
      </div>
      {res && (
        <div className="panel">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: 19 }}>{res.titre}</h3>
            <button className="btn sm ghost" onClick={() => setShowAns(!showAns)}>{showAns ? "Masquer le corrigé" : "Afficher le corrigé"}</button>
          </div>
          {(res.questions || []).map((q, i) => (
            <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <p style={{ fontWeight: 600 }}>Q{i + 1}. {q.question}
                <span className="tag-eval">{q.difficulte}</span><span className="tag-eval">{q.competence}</span></p>
              {(q.options || []).length > 0 && <ul style={{ margin: "6px 0 0 22px" }}>{q.options.map((o, k) => <li key={k}>{o}</li>)}</ul>}
              {showAns && <p style={{ marginTop: 6, fontSize: 13.5, background: "var(--sage)", padding: "8px 10px", borderRadius: 6 }}>
                <strong>Réponse :</strong> {q.reponse}<br /><strong>Explication :</strong> {q.explication}</p>}
            </div>
          ))}
          {res.conseil && <div className="note"><b>Conseil :</b> {res.conseil}</div>}
          <ExportBar title={res.titre || "Évaluation"} getHtml={html} getText={txt} saved={saved}
            onSave={async () => { await onSaveProject({ module: "evaluations", type: "Évaluation", titre: res.titre, form: { ...ctx, ...form }, result: res }); setSaved(true); }} />
          <NextSteps go={go} hide={["evaluations"]} />
        </div>
      )}
    </div>
  );
}

/* --- Analyse d'une formation existante --- */
function Analyse({ ctx, setCtx, go, onSaveProject }) {
  const [content, setContent] = useState("");
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef(null);

  async function loadFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (/\.(txt|md|csv|html?)$/i.test(f.name)) setContent(await f.text());
    else setErr("Dans cette version, importez un fichier texte (.txt, .md) ou collez directement le contenu. L'import PDF/PowerPoint n'est pas encore disponible ici.");
  }
  async function run() {
    if (!content.trim()) return;
    setBusy(true); setErr(""); setRes(null); setSaved(false);
    try {
      const j = await askClaude({
        role: "analyste", ctx, expectJson: true,
        messages: [{ role: "user", content:
`Audite ce contenu de formation (déroulé, programme ou support) :
"""${content.slice(0, 9000)}"""
Vérifie notamment : formulation des objectifs, cohérence objectifs↔activités, répartition des durées, présence d'évaluations, progression pédagogique, interactivité, charge cognitive.
Réponds en JSON : {"syntheseGlobale":"3-4 phrases","pointsForts":["..."],"problemes":[{"probleme":"...","gravite":"mineur|important|critique","explication":"...","amelioration":"proposition concrète"}],"prioriteN1":"la première chose à corriger"}` }],
      });
      setRes(j);
      setCtx({ ...ctx, dernierTravail: "Analyse d'une formation existante — priorité n°1 : " + (j.prioriteN1 || "") });
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }
  const html = () => res ? `<p>${esc(res.syntheseGlobale)}</p><h3>Points forts</h3><ul>${(res.pointsForts||[]).map(p=>`<li>${esc(p)}</li>`).join("")}</ul><h3>Problèmes identifiés</h3><table><tr><th>Problème</th><th>Gravité</th><th>Explication</th><th>Amélioration proposée</th></tr>${(res.problemes||[]).map(p=>`<tr><td>${esc(p.probleme)}</td><td>${esc(p.gravite)}</td><td>${esc(p.explication)}</td><td>${esc(p.amelioration)}</td></tr>`).join("")}</table><p><strong>Priorité n°1 :</strong> ${esc(res.prioriteN1)}</p>` : "";
  const txt = () => res ? [res.syntheseGlobale, "POINTS FORTS :\n" + (res.pointsForts||[]).map(p=>"- "+p).join("\n"), "PROBLÈMES :\n" + (res.problemes||[]).map(p=>`- [${p.gravite}] ${p.probleme} → ${p.amelioration}`).join("\n"), "Priorité n°1 : " + res.prioriteN1].join("\n\n") : "";
  const gravColor = { critique: "var(--danger)", important: "var(--amber)", mineur: "var(--muted)" };

  return (
    <div>
      <div className="eyebrow">Améliorer</div>
      <h2 className="page">Analyser une formation existante</h2>
      <p className="lede">Collez un déroulé, un programme ou un support : l'analyste identifie les faiblesses (objectifs flous, incohérences, durées, évaluation manquante…) et propose des corrections concrètes.</p>
      <div className="panel">
        <Field label="Contenu à analyser">
          <textarea style={{ minHeight: 180 }} value={content} onChange={e => setContent(e.target.value)}
            placeholder="Collez ici votre déroulé pédagogique, programme ou plan de formation…" />
        </Field>
        <div className="bar">
          <button className="btn" onClick={run} disabled={busy || !content.trim()}>{busy ? <><span className="spin" /> Audit en cours…</> : "Analyser"}</button>
          <button className="btn sm ghost" onClick={() => fileRef.current?.click()}>Importer un fichier texte</button>
          <input ref={fileRef} type="file" accept=".txt,.md,.csv,.html" style={{ display: "none" }} onChange={loadFile} />
        </div>
        {err && <div className="err">{err}</div>}
      </div>
      {res && (
        <div className="panel">
          <p style={{ marginBottom: 14 }}>{res.syntheseGlobale}</p>
          <h4 style={{ marginBottom: 6 }}>Points forts</h4>
          <ul style={{ margin: "0 0 16px 22px" }}>{(res.pointsForts || []).map((p, i) => <li key={i}>{p}</li>)}</ul>
          <h4 style={{ marginBottom: 6 }}>Problèmes identifiés</h4>
          {(res.problemes || []).map((p, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <p><strong>{p.probleme}</strong> <span className="tag-eval" style={{ color: gravColor[p.gravite] || "var(--pine)" }}>{p.gravite}</span></p>
              <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "3px 0" }}>{p.explication}</p>
              <p style={{ fontSize: 13.5 }}>→ {p.amelioration}</p>
            </div>
          ))}
          <div className="note"><b>Priorité n°1 :</b> {res.prioriteN1}</div>
          <ExportBar title="Analyse pédagogique" getHtml={html} getText={txt} saved={saved}
            onSave={async () => { await onSaveProject({ module: "analyse", type: "Analyse", titre: "Analyse — " + new Date().toLocaleDateString("fr-FR"), form: { content: content.slice(0, 2000) }, result: res }); setSaved(true); }} />
          <NextSteps go={go} />
        </div>
      )}
    </div>
  );
}

/* --- Adaptation --- */
function Adaptation({ ctx, setCtx, go, onSaveProject }) {
  const [content, setContent] = useState(ctx.dernierTravail || "");
  const [cible, setCible] = useState("");
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);
  const presets = ["Adapter pour des débutants", "Adapter pour des professionnels expérimentés", "Transformer en formation distancielle", "Adapter pour un groupe de 30 personnes", "Réduire à une demi-journée"];

  async function run() {
    if (!content.trim() || !cible.trim()) return;
    setBusy(true); setErr(""); setRes(null); setSaved(false);
    try {
      const answer = await askClaude({
        role: "adaptation", ctx,
        messages: [{ role: "user", content:
`Voici une formation / séquence / activité existante :
"""${content.slice(0, 8000)}"""
Demande d'adaptation : ${cible}
Conserve l'objectif pédagogique. Adapte vocabulaire, rythme, activités, difficulté, durée, supports et évaluation selon le besoin.
Structure ta réponse en deux parties avec titres : "## Version adaptée" (directement exploitable) puis "## Ce qui a changé et pourquoi" (liste courte).` }],
      });
      setRes(answer);
      setCtx({ ...ctx, dernierTravail: answer });
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }
  return (
    <div>
      <div className="eyebrow">Améliorer</div>
      <h2 className="page">Adapter une formation</h2>
      <p className="lede">Autre public, autre modalité, autre durée : l'objectif pédagogique est conservé, tout le reste est ajusté — et chaque changement est justifié.</p>
      <div className="panel">
        <Field label="Formation, séquence ou activité à adapter">
          <textarea style={{ minHeight: 150 }} value={content} onChange={e => setContent(e.target.value)}
            placeholder="Collez le contenu à adapter (la dernière production de la session est pré-remplie si disponible)…" />
        </Field>
        <div style={{ marginTop: 12 }}>
          <Field label="Adaptation souhaitée">
            <input value={cible} onChange={e => setCible(e.target.value)} placeholder="Ex. adapter pour des seniors grands débutants en numérique" />
          </Field>
          <div className="bar" style={{ marginTop: 8 }}>
            {presets.map(p => <button key={p} className="btn sm ghost" onClick={() => setCible(p)}>{p}</button>)}
          </div>
        </div>
        <div className="bar"><button className="btn" onClick={run} disabled={busy || !content.trim() || !cible.trim()}>{busy ? <><span className="spin" /> Adaptation…</> : "Adapter"}</button></div>
        {err && <div className="err">{err}</div>}
      </div>
      {res && (
        <div className="panel">
          <div className="md" dangerouslySetInnerHTML={{ __html: mdToHtml(res) }} />
          <ExportBar title={"Adaptation — " + cible.slice(0, 50)} getHtml={() => mdToHtml(res)} getText={() => res} saved={saved}
            onSave={async () => { await onSaveProject({ module: "adaptation", type: "Adaptation", titre: "Adaptation — " + cible.slice(0, 50), form: { cible }, result: res }); setSaved(true); }} />
          <NextSteps go={go} hide={["adaptation"]} />
        </div>
      )}
    </div>
  );
}

/* --- Déroulé pédagogique (tableau éditable) --- */
const DER_COLS = [["horaires","Horaires",70],["duree","Durée",55],["objectif","Objectif",150],["activite","Activité",150],["methode","Méthode",100],["formateur","Activité formateur",140],["apprenant","Activité apprenant",140],["ressources","Ressources",110],["evaluation","Évaluation",110]];
const emptyRow = () => Object.fromEntries(DER_COLS.map(([k]) => [k, ""]));

function Deroule({ ctx, setCtx, go, onSaveProject, initial }) {
  const [rows, setRows] = useState(initial?.result?.rows || []);
  const [titre, setTitre] = useState(initial?.titre || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);

  async function generate() {
    setBusy(true); setErr(""); setSaved(false);
    try {
      const j = await askClaude({
        role: "deroule", ctx, expectJson: true,
        messages: [{ role: "user", content:
`Construis un déroulé pédagogique réaliste (accueil, pauses, évaluations, clôture inclus) pour le projet en contexte${ctx.dernierTravail ? ", en t'appuyant sur la dernière production de la session" : ""}.
Réponds en JSON : {"titre":"...","rows":[{"horaires":"9h00-9h15","duree":"15 min","objectif":"...","activite":"...","methode":"...","formateur":"...","apprenant":"...","ressources":"...","evaluation":"..."}]} — 8 à 14 lignes maximum, cellules courtes.` }],
      });
      setRows(j.rows || []); setTitre(j.titre || "Déroulé pédagogique");
      setCtx({ ...ctx, dernierTravail: "Déroulé « " + j.titre + " » (" + (j.rows || []).length + " lignes)" });
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }
  const upd = (i, k, v) => { const r = [...rows]; r[i] = { ...r[i], [k]: v }; setRows(r); setSaved(false); };
  const rowOp = (i, op) => {
    const r = [...rows];
    if (op === "del") r.splice(i, 1);
    if (op === "dup") r.splice(i + 1, 0, { ...r[i] });
    if (op === "up" && i > 0) [r[i - 1], r[i]] = [r[i], r[i - 1]];
    if (op === "down" && i < r.length - 1) [r[i + 1], r[i]] = [r[i], r[i + 1]];
    setRows(r); setSaved(false);
  };
  const html = () => `<table><tr>${DER_COLS.map(([, l]) => `<th>${esc(l)}</th>`).join("")}</tr>${rows.map(r => `<tr>${DER_COLS.map(([k]) => `<td>${esc(r[k])}</td>`).join("")}</tr>`).join("")}</table>`;
  const txt = () => rows.map(r => DER_COLS.map(([k, l]) => l + " : " + (r[k] || "—")).join(" | ")).join("\n");

  return (
    <div>
      <div className="eyebrow">Organiser</div>
      <h2 className="page">Déroulé pédagogique</h2>
      <p className="lede">Générez un déroulé horaire complet, puis modifiez chaque cellule directement dans le tableau : ajout, suppression, duplication et réorganisation des lignes.</p>
      <div className="panel">
        <CtxFields ctx={ctx} setCtx={setCtx} withObjectif={false} />
        <div className="bar">
          <button className="btn" onClick={generate} disabled={busy}>{busy ? <><span className="spin" /> Construction…</> : (rows.length ? "Régénérer avec l'IA" : "Générer le déroulé")}</button>
          <button className="btn sm ghost" onClick={() => { setRows([...rows, emptyRow()]); }}>+ Ligne vide</button>
        </div>
        {err && <div className="err">{err}</div>}
      </div>
      {rows.length > 0 && (
        <div className="panel" style={{ overflowX: "auto" }}>
          <Field label="Titre du déroulé"><input value={titre} onChange={e => { setTitre(e.target.value); setSaved(false); }} /></Field>
          <div style={{ marginTop: 12, overflowX: "auto" }}>
            <table className="data" style={{ minWidth: 1000 }}>
              <thead><tr>{DER_COLS.map(([k, l, w]) => <th key={k} style={{ minWidth: w }}>{l}</th>)}<th style={{ width: 90 }}></th></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    {DER_COLS.map(([k]) => <td key={k}><textarea rows={2} value={r[k] || ""} onChange={e => upd(i, k, e.target.value)} aria-label={k} /></td>)}
                    <td><div className="rowops">
                      <button title="Monter" onClick={() => rowOp(i, "up")}>↑</button>
                      <button title="Descendre" onClick={() => rowOp(i, "down")}>↓</button>
                      <button title="Dupliquer" onClick={() => rowOp(i, "dup")}>⧉</button>
                      <button title="Supprimer" onClick={() => rowOp(i, "del")}>✕</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ExportBar title={titre || "Déroulé pédagogique"} getHtml={html} getText={txt} saved={saved}
            onSave={async () => { await onSaveProject({ id: initial?.id, module: "deroule", type: "Déroulé", titre: titre || "Déroulé", form: ctx, result: { rows } }); setSaved(true); }} />
          <NextSteps go={go} hide={["deroule"]} />
        </div>
      )}
    </div>
  );
}

/* --- Bibliothèque --- */
function Bibliotheque({ openProject }) {
  const [items, setItems] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [name, setName] = useState("");
  const refresh = async () => setItems(await store.list());
  useEffect(() => { refresh(); }, []);

  async function op(item, action) {
    if (action === "del") { if (confirm("Supprimer « " + item.titre + " » ?")) { await store.remove(item.id); refresh(); } }
    if (action === "dup") { await store.save({ ...item, id: null, titre: item.titre + " (copie)" }); refresh(); }
    if (action === "renameOk") { await store.save({ ...item, titre: name || item.titre }); setRenaming(null); refresh(); }
  }
  return (
    <div>
      <div className="eyebrow">Bibliothèque</div>
      <h2 className="page">Mes projets</h2>
      <p className="lede">Toutes vos productions enregistrées : formations, séquences, activités, évaluations, analyses et déroulés. Les projets sont conservés d'une session à l'autre sur ce compte.</p>
      <div className="panel">
        {items === null && <p style={{ color: "var(--muted)" }}><span className="spin dark" /> Chargement…</p>}
        {items && items.length === 0 && <p style={{ color: "var(--muted)" }}>Aucun projet pour l'instant. Générez une séquence, une activité ou une évaluation, puis « Enregistrer dans la bibliothèque ».</p>}
        {items && items.map(it => (
          <div className="lib-item" key={it.id}>
            <span className="k">{it.type}</span>
            <div style={{ minWidth: 0 }}>
              {renaming === it.id
                ? <span style={{ display: "flex", gap: 6 }}>
                    <input autoFocus value={name} onChange={e => setName(e.target.value)} style={{ padding: "4px 8px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 13 }} />
                    <button className="btn sm" onClick={() => op(it, "renameOk")}>OK</button>
                  </span>
                : <div className="t">{it.titre}</div>}
              <div className="d">{new Date(it.date).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</div>
            </div>
            <div className="ops">
              <button className="btn sm ghost" onClick={() => openProject(it)}>Ouvrir</button>
              <button className="btn sm ghost" onClick={() => { setRenaming(it.id); setName(it.titre); }}>Renommer</button>
              <button className="btn sm ghost" onClick={() => op(it, "dup")}>Dupliquer</button>
              <button className="btn sm danger" onClick={() => op(it, "del")}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- Visionneuse de projet enregistré (lecture + export) --- */
function ProjectViewer({ project, go }) {
  // Le déroulé rouvre son éditeur ; les autres types s'affichent en lecture avec export.
  const p = project;
  const render = () => {
    if (p.module === "sequence" && p.result?.sequence)
      return `<table>${SEQ_KEYS.map(([k, l]) => `<tr><th style="width:190px">${esc(l)}</th><td>${mdToHtml(p.result.sequence[k] || "")}</td></tr>`).join("")}</table>`;
    if (p.module === "objectifs" && p.result?.objectifs)
      return `<p>${esc(p.result.analyse || "")}</p><ul>${p.result.objectifs.map(o => `<li><strong>${esc(o.formulation)}</strong> (${esc(o.niveauBloom)})</li>`).join("")}</ul>`;
    if (p.module === "activites" && p.result?.activites)
      return p.result.activites.map(a => `<h3>${esc(a.titre)}</h3><p>${esc(a.objectif || "")}</p><p><strong>Durée :</strong> ${esc(a.duree)} — <strong>Déroulement :</strong> ${esc(a.deroulement)}</p>`).join("");
    if (p.module === "evaluations" && p.result?.questions)
      return p.result.questions.map((q, i) => `<h4>Q${i + 1}. ${esc(q.question)}</h4>${(q.options || []).length ? "<ul>" + q.options.map(o => `<li>${esc(o)}</li>`).join("") + "</ul>" : ""}<p><strong>Réponse :</strong> ${esc(q.reponse)}</p>`).join("");
    if (p.module === "analyse" && p.result)
      return `<p>${esc(p.result.syntheseGlobale || "")}</p><ul>${(p.result.problemes || []).map(x => `<li>[${esc(x.gravite)}] ${esc(x.probleme)} → ${esc(x.amelioration)}</li>`).join("")}</ul>`;
    if (typeof p.result === "string") return mdToHtml(p.result);
    return "<p>Contenu enregistré.</p>";
  };
  const bodyHtml = render();
  const text = bodyHtml.replace(/<[^>]+>/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return (
    <div>
      <div className="eyebrow">Bibliothèque · {p.type}</div>
      <h2 className="page">{p.titre}</h2>
      <p className="lede">Enregistré le {new Date(p.date).toLocaleDateString("fr-FR")}. Utilisez la barre d'export ci-dessous, ou repartez de ce projet via les modules.</p>
      <div className="panel">
        <div className="md" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        <ExportBar title={p.titre} getHtml={() => bodyHtml} getText={() => text} />
        <div className="bar"><button className="btn sm ghost" onClick={() => go("bibliotheque")}>← Retour à la bibliothèque</button></div>
      </div>
    </div>
  );
}

/* ------------------ 7. COQUILLE APPLICATIVE ---------------- */
export default function App() {
  const [view, setView] = useState("home");
  const [ctx, setCtx] = useState({});
  const [opened, setOpened] = useState(null); // projet ouvert depuis la bibliothèque

  const go = (v) => { setOpened(null); setView(v); window.scrollTo(0, 0); };
  async function onSaveProject(p) { return store.save(p); }
  function openProject(p) {
    if (p.form && typeof p.form === "object" && p.form.theme !== undefined) setCtx({ ...ctx, ...p.form });
    if (p.module === "deroule") { setOpened(p); setView("deroule"); }
    else { setOpened(p); setView("viewer"); }
    window.scrollTo(0, 0);
  }
  const NAV = [
    ["Démarrer", [["home", "Accueil"], ["chat", "Assistant"]]],
    ["Concevoir", [["sequence", "Séquences"], ["objectifs", "Objectifs"], ["activites", "Activités"]]],
    ["Évaluer", [["evaluations", "Évaluations"], ["analyse", "Analyse"], ["adaptation", "Adaptation"]]],
    ["Organiser", [["deroule", "Déroulé"], ["bibliotheque", "Bibliothèque"]]],
  ];
  const ctxSummary = [ctx.publicCible, ctx.duree, ctx.modalite].filter(Boolean).join(" · ");

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <nav className="rail" aria-label="Navigation principale">
          <div className="rail-brand"><h1>Assistant Pédagogique</h1><p>Ingénierie de formation</p></div>
          {NAV.map(([g, items]) => (
            <div className="rail-group" key={g}>
              <span>{g}</span>
              {items.map(([k, l]) => <button key={k} className={view === k ? "on" : ""} onClick={() => go(k)} aria-current={view === k ? "page" : undefined}>{l}</button>)}
            </div>
          ))}
          {(ctx.theme || ctx.objectif) && (
            <div className="ctx-chip">
              <b>Projet en cours</b>
              <div className="t">{ctx.theme || "Sans titre"}</div>
              {ctxSummary && <div className="m">{ctxSummary}</div>}
              <button onClick={() => setCtx({})}>Réinitialiser le contexte</button>
            </div>
          )}
        </nav>
        <main className="main">
          <div className="col">
            {view === "home" && <Home go={go} />}
            {view === "chat" && <Chat ctx={ctx} setCtx={setCtx} />}
            {view === "sequence" && <SequenceGen ctx={ctx} setCtx={setCtx} go={go} onSaveProject={onSaveProject} initial={opened?.module === "sequence" ? opened : null} />}
            {view === "objectifs" && <Objectifs ctx={ctx} setCtx={setCtx} go={go} onSaveProject={onSaveProject} />}
            {view === "activites" && <Activites ctx={ctx} setCtx={setCtx} go={go} onSaveProject={onSaveProject} />}
            {view === "evaluations" && <Evaluations ctx={ctx} setCtx={setCtx} go={go} onSaveProject={onSaveProject} />}
            {view === "analyse" && <Analyse ctx={ctx} setCtx={setCtx} go={go} onSaveProject={onSaveProject} />}
            {view === "adaptation" && <Adaptation ctx={ctx} setCtx={setCtx} go={go} onSaveProject={onSaveProject} />}
            {view === "deroule" && <Deroule ctx={ctx} setCtx={setCtx} go={go} onSaveProject={onSaveProject} initial={opened?.module === "deroule" ? opened : null} />}
            {view === "bibliotheque" && <Bibliotheque openProject={openProject} />}
            {view === "viewer" && opened && <ProjectViewer project={opened} go={go} />}
          </div>
        </main>
      </div>
    </>
  );
}