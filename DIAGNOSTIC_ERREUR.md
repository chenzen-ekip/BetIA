# 🔍 Diagnostic des Erreurs - BetIA

## Erreurs Possibles et Solutions

### 1. ⚠️ Clé API OpenAI manquante ou invalide

**Symptôme :** Message d'erreur générique "Une erreur est survenue"

**Vérification :**
- Vérifiez que le fichier `.env.local` existe à la racine du projet
- Vérifiez que la clé commence par `sk-`
- Vérifiez que la clé n'a pas d'espaces avant/après

**Solution :**
```env
OPENAI_API_KEY=sk-votre-cle-api-ici
```

### 2. ⚠️ Erreur HTTP 401 (Unauthorized)

**Symptôme :** Erreur "Erreur HTTP 401"

**Causes possibles :**
- Clé API invalide ou expirée
- Clé API mal formatée

**Solution :**
- Générez une nouvelle clé sur https://platform.openai.com/api-keys
- Vérifiez que vous avez des crédits sur votre compte OpenAI

### 3. ⚠️ Erreur HTTP 429 (Rate Limit)

**Symptôme :** Erreur "Erreur HTTP 429"

**Causes possibles :**
- Trop de requêtes en peu de temps
- Limite de l'API atteinte

**Solution :**
- Attendez quelques minutes
- Vérifiez votre plan OpenAI

### 4. ⚠️ Erreur de parsing du stream

**Symptôme :** Message partiel ou erreur lors de l'affichage

**Causes possibles :**
- Problème de réseau
- Timeout de la requête

**Solution :**
- Vérifiez votre connexion internet
- Réessayez la requête

### 5. ⚠️ Erreur CORS ou réseau

**Symptôme :** Erreur de réseau dans la console

**Causes possibles :**
- Problème de configuration Next.js
- Problème de proxy/firewall

**Solution :**
- Vérifiez que le serveur Next.js tourne sur le port 3000
- Vérifiez la console du navigateur (F12) pour plus de détails

## 🔧 Comment Voir l'Erreur Exacte

1. **Ouvrez la console du navigateur** (F12)
2. **Onglet Console** : Regardez les erreurs en rouge
3. **Onglet Network** : Vérifiez les requêtes vers `/api/chat`
4. **Regardez les logs du serveur** dans le terminal où vous avez lancé `npm run dev`

## 📝 Logs à Vérifier

### Console Navigateur (F12)
```javascript
// Erreurs possibles :
- "Failed to fetch"
- "NetworkError"
- "401 Unauthorized"
- "500 Internal Server Error"
```

### Terminal Serveur
```bash
# Erreurs possibles :
- "OPENAI_API_KEY is not defined"
- "API Error: ..."
- "Streaming error: ..."
```

## ✅ Checklist de Vérification

- [ ] Fichier `.env.local` existe
- [ ] Clé API commence par `sk-`
- [ ] Pas d'espaces dans la clé API
- [ ] Serveur Next.js tourne (`npm run dev`)
- [ ] Port 3000 accessible
- [ ] Connexion internet active
- [ ] Compte OpenAI a des crédits
- [ ] Console navigateur vérifiée (F12)

## 🚀 Test Rapide

Pour tester si l'API fonctionne, ouvrez la console du navigateur (F12) et exécutez :

```javascript
fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'test' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

Cela vous donnera l'erreur exacte retournée par l'API.


