# 🔍 Intégration de la Recherche Web - BetIA

## Situation Actuelle

**GPT-4o-mini standard** n'a **PAS** accès à la recherche web en temps réel par défaut. Il utilise uniquement ses connaissances internes (jusqu'à sa date de cutoff).

## Solutions Possibles

### Option 1 : Utiliser les Outils OpenAI (Recommandé si disponible)

OpenAI a introduit des fonctionnalités de recherche web récemment. Pour les activer :

1. Vérifier si votre compte OpenAI a accès aux "Tools" (fonctions)
2. Utiliser l'API avec `tools` parameter pour la recherche web

**Avantages :**
- Intégration native OpenAI
- Pas besoin d'API externe

**Inconvénients :**
- Peut ne pas être disponible pour tous les comptes
- Peut être plus cher

### Option 2 : API de Recherche Web Externe (Recommandé)

Intégrer une API de recherche web externe pour obtenir des données en temps réel.

#### Options Gratuites :

1. **Tavily API** (Recommandé)
   - Gratuit : 1000 requêtes/mois
   - Payant : $20/mois pour 10,000 requêtes
   - Spécialisé pour l'IA
   - URL : https://tavily.com

2. **Serper API**
   - Gratuit : 2500 requêtes/mois
   - Payant : $50/mois pour 10,000 requêtes
   - URL : https://serper.dev

3. **DuckDuckGo** (via bibliothèque)
   - Gratuit et illimité
   - Moins structuré mais fonctionne

#### Options Payantes :

- **Google Custom Search API** : $5 pour 1000 requêtes
- **Bing Search API** : Payant

## 🚀 Implémentation Recommandée : Tavily

Tavily est spécialement conçu pour les applications IA et offre un excellent rapport qualité/prix.

### Étapes d'Intégration :

1. **Créer un compte Tavily** : https://tavily.com
2. **Obtenir une clé API** (gratuite)
3. **Ajouter la clé dans `.env.local`** :
   ```
   TAVILY_API_KEY=votre-cle-tavily
   ```

4. **Installer le package** :
   ```bash
   npm install tavily
   ```

5. **Intégrer dans l'API route** :
   - Rechercher avant d'appeler OpenAI
   - Passer les résultats à GPT-4o-mini comme contexte

## 📝 Code d'Exemple avec Tavily

```typescript
import { Tavily } from 'tavily'

const tavily = new Tavily({ apiKey: process.env.TAVILY_API_KEY })

// Dans l'API route, avant d'appeler OpenAI :
const searchResults = await tavily.search(query, {
  searchDepth: "basic",
  maxResults: 5
})

// Passer les résultats à GPT comme contexte
const context = searchResults.results
  .map(r => `${r.title}: ${r.content}`)
  .join('\n\n')

// Ajouter au prompt système ou aux messages
```

## ⚡ Alternative Rapide : Utiliser les Connaissances Internes

**Solution actuelle** : L'IA utilise ses connaissances internes (jusqu'à avril 2024 pour GPT-4o-mini).

**Avantages :**
- ✅ Gratuit
- ✅ Rapide
- ✅ Fonctionne immédiatement
- ✅ Bon pour les statistiques historiques

**Inconvénients :**
- ❌ Pas de données ultra-récentes (matchs d'aujourd'hui)
- ❌ Pas de cotes en temps réel
- ❌ Pas d'actualités récentes

## 🎯 Recommandation

Pour un **MVP** : Utiliser les connaissances internes (solution actuelle) est suffisant.

Pour la **production** : Intégrer Tavily API pour des données en temps réel.

## 📞 Prochaines Étapes

Si vous voulez que j'intègre Tavily ou une autre API de recherche web, dites-moi et je l'implémenterai !


