// Fonction serveur exécutée par Vercel (dossier /api).
// Elle reçoit la demande du navigateur, ajoute la clé NVIDIA (secrète) et
// interroge NVIDIA Build. La clé n'est JAMAIS exposée au navigateur.
//
// Deux usages :
//  - texte seul  -> modèle MODEL (GLM-5.2) : conseil, séquences, exercices...
//  - avec images -> modèle VISION_MODEL : lecture de photos de cours.

// ─────────────────────────────────────────────────────────────
//  POUR CHANGER DE MODÈLE : modifie UNIQUEMENT ces deux lignes.
//  Copie l'identifiant EXACT depuis la page du modèle sur build.nvidia.com
//  (bouton « View Code »). Les modèles sont parfois retirés (« end of life ») :
//  si tu vois une erreur 404/410, viens ici copier l'ID d'un modèle encore actif.
//
//  Mistral Large 3 : excellent en français, et c'est un modèle VISION → il gère
//  à la fois le texte ET la lecture des photos de cours.
//  Alternatives texte (à coller à la place) : "deepseek-ai/deepseek-v3.2",
//  "nvidia/nemotron-3-ultra-550b-a55b", "openai/gpt-oss-120b".
const MODEL = "mistralai/mistral-large-3-675b-instruct-2512";        // texte / raisonnement
const VISION_MODEL = "mistralai/mistral-large-3-675b-instruct-2512"; // lecture d'images
// ─────────────────────────────────────────────────────────────

const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée." });
  }

  const key = process.env.NVIDIA_API_KEY;
  if (!key) {
    return res.status(500).json({
      error: "Clé API non configurée. Ajoutez NVIDIA_API_KEY dans les variables d'environnement Vercel.",
    });
  }

  try {
    const { system, messages, images } = req.body || {};
    const useVision = Array.isArray(images) && images.length > 0;

    let msgs = Array.isArray(messages) ? messages.slice() : [];

    // En mode vision : on rattache les images (max 5) au dernier message utilisateur.
    if (useVision) {
      const imgs = images.slice(0, 5).map((url) => ({ type: "image_url", image_url: { url } }));
      let done = false;
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === "user") {
          msgs[i] = { role: "user", content: [{ type: "text", text: String(msgs[i].content || "") }, ...imgs] };
          done = true; break;
        }
      }
      if (!done) msgs.push({ role: "user", content: [{ type: "text", text: "Décris ces images." }, ...imgs] });
    }

    const payload = {
      model: useVision ? VISION_MODEL : MODEL,
      messages: [{ role: "system", content: system || "" }, ...msgs],
      temperature: useVision ? 0.2 : 0.5,
      max_tokens: 4096,
    };

    const r = await fetch(NVIDIA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const detail = await r.text();
      if (r.status === 429) {
        return res.status(429).json({ error: "Trop de requêtes d'un coup (limite du tier gratuit NVIDIA, ~40/min). Patientez quelques secondes puis réessayez." });
      }
      return res.status(r.status).json({ error: "Erreur du fournisseur IA.", detail: detail.slice(0, 400) });
    }

    const data = await r.json();
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    return res.status(200).json({ content });
  } catch (e) {
    return res.status(500).json({ error: "Erreur serveur.", detail: String(e).slice(0, 400) });
  }
}
