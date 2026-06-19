# Application Web de Gestion des Factures

Application de facturation à deux rôles (**Agent/Comptable** et **Administrateur**) :
saisie des clients, création de factures avec calcul automatique, génération de PDF,
suivi des encaissements, validation et tableaux de bord.

**Stack :** React (Vite) · Material UI · Firebase (Auth + Realtime Database) · JSON Server · jsPDF · Recharts

---

## 1. Prérequis

- Node.js ≥ 18
- Un compte [Firebase](https://console.firebase.google.com) (gratuit)

## 2. Installation

```bash
npm install
```

## 3. Configuration Firebase

1. Créez un projet sur la **console Firebase**.
2. **Authentication → Sign-in method →** activez **E-mail/Mot de passe**.
3. **Realtime Database →** créez une base (mode test pour démarrer).
4. **Paramètres du projet → Vos applications → Web (</>)** : copiez les clés de config.
5. Dupliquez `.env.example` en `.env` et renseignez vos valeurs :

```bash
cp .env.example .env
```

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_JSON_SERVER_URL=http://localhost:4000
```

6. (Recommandé) Dans **Realtime Database → Règles**, collez le contenu de
   `firebase-rules.json` pour sécuriser l'accès par utilisateur authentifié.

## 4. Lancement

Deux serveurs tournent en parallèle — ouvrez **deux terminaux** :

```bash
# Terminal 1 — API des articles / catégories / paramètres société
npm run server      # JSON Server sur http://localhost:4000

# Terminal 2 — application
npm run dev         # Vite sur http://localhost:3000
```

## 5. Premiers pas

1. Ouvrez `http://localhost:3000` → page de connexion.
2. Cliquez **Créer un compte**. Choisissez le profil :
   - **Agent / Comptable** → espace de saisie (`/app`).
   - **Administrateur** → espace de gestion (`/admin`).
3. Le rôle est stocké dans la Realtime Database sous `users/{uid}/role`.

> **Promouvoir un compte existant en admin :** dans la console Firebase →
> Realtime Database → `users/{uid}/role`, mettez la valeur à `admin`.

---

## Fonctionnalités

### Espace Agent (`/app`)
- Tableau de bord personnel (KPIs + CA mensuel).
- Gestion des clients (CRUD).
- Création de facture : sélection client, ajout d'articles, **calcul automatique**.
- Génération **PDF** (logo, coordonnées, tableau, totaux, signature).
- Suivi : date de dépôt, date d'encaissement, type de virement, statut.

### Espace Administrateur (`/admin`)
- Tableau de bord global (KPIs + 3 graphiques).
- Validation / rejet des factures.
- Gestion du catalogue : **articles** et **catégories** (via JSON Server).

### Les 4 méthodes de facturation (sélectionnables dans le formulaire)
1. **Simple** — HT + TVA 20 %.
2. **Remise par ligne** — un pourcentage de remise par article.
3. **Remise globale** — une remise unique sur le total HT.
4. **TVA par catégorie** — taux différencié selon la catégorie de l'article
   (Informatique 20 %, Services 10 %, Formation 0 % par défaut).

---

## Répartition des données

| Donnée | Stockage |
|---|---|
| Utilisateurs, rôles | Firebase Realtime Database (`users`) |
| Clients | Firebase Realtime Database (`clients`) |
| Factures | Firebase Realtime Database (`factures`) |
| Articles, catégories, paramètres société | JSON Server (`db.json`) |

## Structure du projet

```
src/
├── components/      Layout, formulaires, dialogues, UI partagée
├── contexts/        AuthContext (session + rôle)
├── pages/
│   ├── user/        Dashboard, Clients, Factures (création, historique, détail)
│   └── admin/       Dashboard, Articles, Catégories, Validation
├── services/        firebaseService, jsonService, authService, pdfService
├── utils/           billing (4 méthodes), stats, format, constants
├── routes/          AppRoutes (routage protégé par rôle)
├── theme.js         Thème Material UI
└── firebase.js      Initialisation Firebase
```

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Lance l'application (Vite) |
| `npm run server` | Lance JSON Server (port 4000) |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualise le build |

---

## Dépannage

- **« JSON Server est-il démarré ? »** → lancez `npm run server` dans un terminal séparé.
- **Erreur de connexion / page blanche** → vérifiez que `.env` est rempli et que
  l'authentification E-mail/Mot de passe est activée dans Firebase.
- **`auth/configuration-not-found`** → l'authentification par e-mail n'est pas activée
  dans la console Firebase.
