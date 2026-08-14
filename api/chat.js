// Fonction serveur exécutée par Vercel (dossier /api).
// Elle reçoit la demande du navigateur, ajoute la clé Groq (secrète) et
// interroge l'IA. Le navigateur ne voit jamais la clé.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée." });
  }

  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return res.status(500).json({
      error: "Clé API non configurée. Ajoutez GROQ_API_KEY dans les variables d'environnement Vercel.",
    });
  }

  try {
    const { system, messages, expectJson } = req.body || {};

    const payload = {
      model: "llama-3.3-70b-versatile", // modèle gratuit Groq
      messages: [{ role: "system", content: system || "" }, ...(messages || [])],
      temperature: 0.5,
      ...(expectJson ? { response_format: { type: "json_object" } } : {}),
    };

    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const detail = await r.text();
      return res.status(r.status).json({ error: "Erreur du fournisseur IA.", detail: detail.slice(0, 400) });
    }

    const data = await r.json();
    const content = data.choices?.[0]?.message?.content || "";
    return res.status(200).json({ content });
  } catch (e) {
    return res.status(500).json({ error: "Erreur serveur.", detail: String(e).slice(0, 400) });
  }
}
