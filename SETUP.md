# Guide de Configuration - BetIA

## 🚀 Installation rapide

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration de l'environnement

Créez un fichier `.env.local` à la racine du projet avec votre clé API OpenAI :

```env
OPENAI_API_KEY=sk-votre-cle-api-ici
```

**Comment obtenir une clé API OpenAI :**
1. Allez sur [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Connectez-vous ou créez un compte
3. Cliquez sur "Create new secret key"
4. Copiez la clé et collez-la dans `.env.local`

### 3. Lancement de l'application

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📋 Vérification

Une fois l'application lancée :

1. ✅ Vérifiez que l'interface se charge correctement
2. ✅ Testez avec une question simple : "Analyse PSG vs Lyon samedi"
3. ✅ Vérifiez que la réponse s'affiche en streaming
4. ✅ Vérifiez que les disclaimers légaux sont visibles en bas

## ⚠️ Problèmes courants

### Erreur "OPENAI_API_KEY is not defined"

**Solution :** Vérifiez que le fichier `.env.local` existe et contient bien votre clé API. Redémarrez le serveur de développement après avoir créé/modifié le fichier.

### Erreur 401 (Unauthorized)

**Solution :** Votre clé API OpenAI est invalide ou expirée. Générez une nouvelle clé sur le site OpenAI.

### Erreur de timeout

**Solution :** L'API OpenAI peut être lente. Augmentez le timeout dans `next.config.js` si nécessaire.

### L'interface ne se charge pas

**Solution :** 
- Vérifiez que tous les packages sont installés : `npm install`
- Vérifiez les erreurs dans la console du navigateur
- Vérifiez les logs du serveur Next.js

## 🔧 Configuration avancée

### Modifier le modèle OpenAI

Dans `app/api/chat/route.ts`, modifiez la ligne :
```typescript
model: 'gpt-4o-mini',
```

Options disponibles :
- `gpt-4o-mini` (recommandé pour MVP - économique)
- `gpt-4o` (plus performant mais plus cher)
- `gpt-4-turbo` (alternative)

### Modifier les paramètres de génération

Dans `app/api/chat/route.ts`, ajustez :
```typescript
temperature: 0.7,  // Créativité (0-1)
max_tokens: 2000,  // Longueur maximale de la réponse
top_p: 0.9,        // Diversité des réponses
```

### Personnaliser le prompt système

Modifiez le fichier `lib/openai.ts` pour ajuster le comportement de l'assistant.

## 📦 Déploiement

### Vercel (recommandé)

1. Connectez votre repository GitHub à Vercel
2. Dans les paramètres du projet, ajoutez la variable d'environnement :
   - Nom : `OPENAI_API_KEY`
   - Valeur : Votre clé API OpenAI
3. Déployez !

### Autres plateformes

Assurez-vous d'ajouter la variable d'environnement `OPENAI_API_KEY` dans les paramètres de votre plateforme de déploiement.

## 🧪 Tests

Pour tester l'application avec des matchs réels :

1. Demandez une analyse : "Analyse PSG vs Lyon samedi"
2. Vérifiez que l'assistant fournit :
   - Contexte du match
   - Statistiques
   - Recommandations de paris
   - Disclaimers légaux
3. Testez plusieurs types de questions pour vérifier la robustesse

## 📞 Support

En cas de problème :
1. Vérifiez les logs du serveur (`npm run dev`)
2. Vérifiez la console du navigateur (F12)
3. Vérifiez que votre clé API OpenAI est valide
4. Consultez la documentation OpenAI : [https://platform.openai.com/docs](https://platform.openai.com/docs)

---

Bon développement ! 🚀


