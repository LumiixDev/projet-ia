# Assistant Pédagogique — déploiement sur Vercel

Application React (Vite) + une fonction serveur qui parle au modèle **GLM-5.2**
hébergé gratuitement sur **NVIDIA Build**.
La clé API reste **cachée côté serveur** : elle n'apparaît jamais dans le navigateur.

---

## ⚠️ À faire en tout premier : créer ta clé NVIDIA

1. Va sur https://build.nvidia.com et crée un compte (NVIDIA Developer Program, gratuit, sans carte bancaire).
2. Ouvre la page du modèle : https://build.nvidia.com/z-ai/glm-5.2
3. Clique **Get API Key** (ou va sur https://build.nvidia.com/settings/api-keys) et copie la clé.
4. Garde-la de côté. Ne la mets **jamais** dans le code — elle ira dans les variables d'environnement Vercel.

> Note importante : le tier gratuit NVIDIA est prévu pour le **développement, les tests et l'usage interne** — pas pour servir un grand nombre d'utilisateurs finaux en production. Pour un vrai déploiement public à grande échelle, NVIDIA demande une licence Enterprise. Pour ton usage (toi + petite équipe), c'est parfait.

## Ce que contient le projet

```
assistant-pedagogique/
├── api/
│   └── chat.js          ← fonction serveur : ajoute la clé et interroge NVIDIA (GLM-5.2)
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
| `NVIDIA_API_KEY` | ta clé NVIDIA `nvapi-...`  |

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
# crée un fichier .env à la racine avec :  NVIDIA_API_KEY=nvapi-ta_cle
vercel dev
```

Ça ouvre l'app sur http://localhost:3000 avec l'IA fonctionnelle.

---

## 🧩 Module « Créer un exercice »

Nouvelle fonctionnalité centrale : génération d'exercices **réellement interactifs**.

- L'IA choisit le format le plus pertinent (ou vous l'imposez en texte libre — elle
  peut inventer un format non prévu, ex. « repérer les erreurs dans une lettre »).
- Formats interactifs gérés : texte à trous, CV à trous / formulaire, QCM, choix
  multiples, vrai/faux, associer, remettre dans l'ordre, classement, scénario à
  choix, question ouverte. L'architecture est extensible : chaque format est un
  « bloc » typé que l'interface sait afficher — en ajouter un nouveau ne casse rien.
- **Vue apprenant** (il réalise l'exercice) / **Vue formateur** (correction, attendus,
  compétences, explication « Pourquoi cet exercice ? »).
- **Correction** : automatique pour les formats fermés ; pour les questions ouvertes,
  bouton « Corriger avec l'IA » qui évalue le **sens** de la réponse
  (Correct / Partiellement correct / À revoir).
- **✏️ Éditer** (titre, consigne, difficulté, durée, déplacer/supprimer des blocs) et
  **✨ Améliorer avec l'IA** (« rends plus difficile », « ajoute 5 questions »,
  « transforme en jeu »…).
- Enregistrement dans la **banque d'exercices** (bibliothèque), réutilisable.

> L'exercice peut être généré à partir d'un support de cours collé (ou fichier .txt/.md).
> L'import direct PDF / PowerPoint / Word n'est pas encore branché — colle le texte pour l'instant.

## Notes

- **Modèle IA** : `z-ai/glm-5.2` (GLM-5.2 sur NVIDIA Build, gratuit) — un des
  modèles ouverts les plus performants en 2026. Pour en changer (ex.
  `deepseek-ai/deepseek-v4-pro`), modifie **uniquement** la constante `MODEL`
  en haut de `api/chat.js`. Copie l'identifiant exact depuis la page du modèle
  sur build.nvidia.com si tu as une erreur « model not found ».
- **Bibliothèque de projets** : enregistrée dans le navigateur (`localStorage`).
  Elle est donc propre à chaque navigateur/appareil. Pour la partager entre
  plusieurs utilisateurs, il faudra plus tard une vraie base de données.
- **Limite gratuite NVIDIA** : ~40 requêtes/minute (pas de plafond strict de
  tokens/jour). Si tu la dépasses, l'appli affiche un message « patientez
  quelques secondes » au lieu d'une erreur. Largement suffisant pour un usage
  individuel ou une petite équipe ; on peut demander 200 req/min à NVIDIA si besoin.
- **Confidentialité** : NVIDIA indique ne pas utiliser tes prompts/réponses pour
  entraîner ses modèles — mieux que le tier gratuit de certains concurrents.
