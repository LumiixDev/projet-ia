// Fonction serveur exécutée par Vercel (dossier /api).
// Elle reçoit la demande du navigateur, ajoute la clé NVIDIA (secrète) et
// interroge le modèle GLM-5.2 hébergé sur NVIDIA Build. La clé n'est JAMAIS
// exposée au navigateur.

// ─────────────────────────────────────────────────────────────
//  POUR CHANGER DE MODÈLE : modifie UNIQUEMENT cette ligne.
//  Copie l'identifiant exact depuis la page du modèle sur
//  build.nvidia.com (bouton « Get API Key » / « View Code »).
//  Ex. "deepseek-ai/deepseek-v4-pro", "nvidia/nemotron-3-ultra"...
const MODEL = "z-ai/glm-5.2";
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
    const { system, messages } = req.body || {};

    const payload = {
      model: MODEL,
      messages: [{ role: "system", content: system || "" }, ...(messages || [])],
      temperature: 0.5,
      max_tokens: 4096,
    };

    const r = await fetch(NVIDIA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const detail = await r.text();
      // 429 = trop de requêtes (limite ~40/min sur le tier gratuit NVIDIA)
      if (r.status === 429) {
        return res.status(429).json({
          error: "Trop de requêtes d'un coup (limite du tier gratuit NVIDIA, ~40/min). Patientez quelques secondes puis réessayez.",
        });
      }
      return res.status(r.status).json({ error: "Erreur du fournisseur IA.", detail: detail.slice(0, 400) });
    }

    const data = await r.json();
    let content = data.choices?.[0]?.message?.content || "";
    // Certains modèles de raisonnement ajoutent un bloc <think>…</think> : on le retire.
    content = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    return res.status(200).json({ content });
  } catch (e) {
    return res.status(500).json({ error: "Erreur serveur.", detail: String(e).slice(0, 400) });
  }
}
