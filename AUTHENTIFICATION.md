# 🔐 Système d'Authentification - BetIA

## ✅ Système d'Authentification Implémenté !

Un système d'authentification complet a été ajouté avec NextAuth.js.

## 🎯 Fonctionnalités

### Méthodes de connexion

1. **Connexion Google (OAuth)**
   - Connexion rapide avec un compte Google
   - Pas besoin de mot de passe

2. **Connexion Email (Magic Link)**
   - Connexion sans mot de passe
   - Lien de connexion envoyé par email
   - Sécurisé et pratique

### Pages créées

- `/auth/signin` - Page de connexion
- `/auth/verify-request` - Page de vérification email
- `/auth/error` - Page d'erreur

### Protection des routes

- La page principale (`/`) est protégée
- Redirection automatique vers `/auth/signin` si non authentifié
- L'API `/api/chat` est protégée (nécessite une session)

## 📝 Configuration Requise

### 1. Variables d'environnement

Ajoutez ces variables dans votre fichier `.env.local` :

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-secret-aleatoire-ici

# Google OAuth (optionnel mais recommandé)
GOOGLE_CLIENT_ID=votre-google-client-id
GOOGLE_CLIENT_SECRET=votre-google-client-secret

# Email Provider (optionnel - pour magic link)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=votre-email@gmail.com
EMAIL_SERVER_PASSWORD=votre-mot-de-passe-app
EMAIL_FROM=noreply@betia.com
```

### 2. Générer NEXTAUTH_SECRET

Générez un secret aléatoire :

```bash
openssl rand -base64 32
```

Ou utilisez un générateur en ligne : https://generate-secret.vercel.app/32

### 3. Configurer Google OAuth (Optionnel)

1. Allez sur https://console.cloud.google.com/
2. Créez un nouveau projet
3. Activez l'API Google+
4. Créez des identifiants OAuth 2.0
5. Ajoutez l'URI de redirection : `http://localhost:3000/api/auth/callback/google`
6. Copiez le Client ID et Client Secret dans `.env.local`

### 4. Configurer Email (Optionnel)

Pour la connexion par email (magic link), configurez un serveur SMTP :

**Option 1 : Gmail**
- Utilisez un "Mot de passe d'application" Gmail
- https://myaccount.google.com/apppasswords

**Option 2 : Service tiers**
- SendGrid, Mailgun, etc.

## 🚀 Installation

1. **Installer les dépendances** :
```bash
npm install
```

2. **Ajouter les variables d'environnement** dans `.env.local`

3. **Redémarrer le serveur** :
```bash
npm run dev
```

## 📱 Utilisation

### Connexion

1. Ouvrez http://localhost:3000
2. Vous serez redirigé vers `/auth/signin`
3. Choisissez :
   - **Google** : Cliquez sur "Continuer avec Google"
   - **Email** : Entrez votre email et recevez un magic link

### Déconnexion

- Cliquez sur "Déconnexion" dans la sidebar

## 🔒 Sécurité

- Sessions JWT sécurisées
- Protection des routes API
- Redirection automatique si non authentifié
- HTTPS recommandé en production

## 📊 Base de données (Optionnel)

Pour le MVP, on utilise JWT sans base de données (plus simple).

Si vous voulez une base de données plus tard :
1. Installez Prisma : `npm install prisma @prisma/client @next-auth/prisma-adapter`
2. Configurez votre base de données
3. Décommentez les lignes Prisma dans `app/api/auth/[...nextauth]/route.ts`
4. Exécutez : `npx prisma migrate dev`

## ⚠️ Notes

- Pour le développement local, `NEXTAUTH_URL` doit être `http://localhost:3000`
- En production, changez `NEXTAUTH_URL` pour votre domaine
- Le secret `NEXTAUTH_SECRET` doit être unique et sécurisé

---

**L'authentification est prête ! Configurez vos variables d'environnement et testez !** 🔐


