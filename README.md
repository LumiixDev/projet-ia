# Assistant Pédagogique — déploiement sur Vercel

Application React (Vite) + une fonction serveur qui parle à l'IA **Groq** (gratuit).
La clé API reste **cachée côté serveur** : elle n'apparaît jamais dans le navigateur.

---

## ⚠️ À faire en tout premier : régénérer ta clé Groq

L'ancienne clé a été écrite en clair dans le code, elle est donc **compromise**.

1. Va sur https://console.groq.com/keys
2. Supprime l'ancienne clé.
3. Crée une nouvelle clé (bouton « Create API Key »).
4. Copie-la et garde-la de côté (elle commence par `gsk_...`). Ne la mets **jamais** dans le code.

---

## Ce que contient le projet

```
assistant-pedagogique/
├── api/
│   └── chat.js          ← fonction serveur : ajoute la clé et interroge Groq
├── src/
│   ├── App.jsx          ← toute l'application
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── .env.example         ← modèle pour la clé (test local uniquement)
└── .gitignore
```

---

## Déploiement sur Vercel (la voie simple, sans installer d'outils)

### 1. Mettre le code sur GitHub
- Crée un compte sur https://github.com si besoin.
- Crée un nouveau dépôt (« New repository »), par ex. `assistant-pedagogique`.
- Envoie-y le contenu de ce dossier (glisser-déposer les fichiers dans « uploading an existing file », ou avec Git).

> Le dossier `node_modules` n'a pas à être envoyé : il est ignoré par `.gitignore`.

### 2. Connecter Vercel
- Crée un compte sur https://vercel.com avec ton compte GitHub.
- Clique **Add New… → Project**, choisis ton dépôt `assistant-pedagogique`, puis **Import**.
- Vercel détecte tout seul « Vite ». Ne change rien.

### 3. Ajouter la clé (l'étape à ne pas oublier)
Avant de cliquer « Deploy », ouvre **Environment Variables** et ajoute :

| Name (nom)     | Value (valeur)              |
|----------------|-----------------------------|
| `GROQ_API_KEY` | ta nouvelle clé `gsk_...`    |

Puis clique **Deploy**.

### 4. C'est en ligne
Au bout d'une minute, Vercel te donne une adresse du type
`https://assistant-pedagogique-xxxx.vercel.app`. Ouvre-la : l'application marche.

> Si tu modifies la clé plus tard : onglet **Settings → Environment Variables**,
> puis redéploie (onglet **Deployments → Redeploy**).

---

## Tester en local avant de déployer (facultatif)

Le `npm run dev` classique de Vite **ne lance pas** la fonction `/api/chat`.
Pour tester l'app complète en local, utilise l'outil de Vercel :

```bash
npm install
npm i -g vercel          # une seule fois
# crée un fichier .env à la racine avec :  GROQ_API_KEY=gsk_ta_cle
vercel dev
```

Ça ouvre l'app sur http://localhost:3000 avec l'IA fonctionnelle.

---

## Notes

- **Modèle IA** : `llama-3.3-70b-versatile` (Groq, gratuit). Pour en changer,
  modifie la ligne `model:` dans `api/chat.js`.
- **Bibliothèque de projets** : enregistrée dans le navigateur (`localStorage`).
  Elle est donc propre à chaque navigateur/appareil. Pour la partager entre
  plusieurs utilisateurs, il faudra plus tard une vraie base de données.
- **Quota gratuit Groq** : ~30 requêtes/minute. Largement suffisant pour un
  usage individuel ou une petite équipe.
