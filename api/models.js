// Diagnostic : liste les modèles RÉELLEMENT disponibles sur ton compte NVIDIA.
// Ouvre https://<ton-app>.vercel.app/api/models pour voir la liste à jour,
// puis copie un identifiant dans MODEL / VISION_MODEL de api/chat.js.

export default async function handler(req, res) {
  const key = process.env.NVIDIA_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "Clé API non configurée (NVIDIA_API_KEY)." });
  }
  try {
    const r = await fetch("https://integrate.api.nvidia.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!r.ok) {
      const detail = await r.text();
      return res.status(r.status).json({ error: "NVIDIA a refusé la requête.", detail: detail.slice(0, 400) });
    }
    const data = await r.json();
    const models = (data.data || []).map((m) => m.id).sort();
    // Repère les modèles qui savent lire des images (vision).
    const vision = models.filter((id) => /vision|-vl|multimodal|omni|mistral-large|kimi|minimax|nemotron-3/i.test(id));
    return res.status(200).json({
      total: models.length,
      conseil: "Copie un de ces identifiants dans MODEL (api/chat.js). Pour lire des photos, choisis-en un dans 'vision_possibles' pour VISION_MODEL.",
      vision_possibles: vision,
      tous_les_modeles: models,
    });
  } catch (e) {
    return res.status(500).json({ error: "Erreur serveur.", detail: String(e).slice(0, 400) });
  }
}
