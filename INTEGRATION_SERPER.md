# 🔍 Intégration Serper API - BetIA

## ✅ Intégration Complétée !

Serper API a été intégré dans votre application. Voici comment ça fonctionne :

## 🎯 Fonctionnement

1. **Détection automatique** : L'API détecte si une recherche web est nécessaire basée sur les mots-clés dans le message
2. **Recherche web** : Si nécessaire, une recherche est effectuée avec Serper API
3. **Contexte enrichi** : Les résultats de recherche sont ajoutés au contexte envoyé à GPT-4o-mini
4. **Réponse enrichie** : L'IA combine les résultats de recherche (données actuelles) avec ses connaissances (analyse)

## 📝 Configuration Requise

### 1. Créer un compte Serper

1. Allez sur https://serper.dev
2. Créez un compte gratuit
3. Obtenez votre clé API (gratuite jusqu'à 2500 requêtes/mois)

### 2. Ajouter la clé API

Ajoutez votre clé Serper dans le fichier `.env.local` :

```env
OPENAI_API_KEY=sk-votre-cle-openai
SERPER_API_KEY=votre-cle-serper
```

### 3. Redémarrer le serveur

```bash
# Arrêter le serveur (Ctrl+C)
npm run dev
```

## 🔍 Mots-clés qui déclenchent la recherche

La recherche web est automatiquement déclenchée si le message contient :
- "aujourd'hui", "demain", "ce weekend", "cette semaine"
- "prochain match", "match du jour"
- "résultats", "cotes", "actualités"
- "récent", "dernier"
- "vs", "contre"

## 💡 Exemples

### Avec recherche web (données actuelles)
**Message :** "Analyse PSG vs Lyon aujourd'hui"
- ✅ Recherche web déclenchée
- ✅ Données actuelles récupérées
- ✅ Analyse complète avec informations récentes

### Sans recherche web (connaissances internes)
**Message :** "Quelles sont les statistiques du PSG cette saison ?"
- ✅ Pas de recherche (données historiques)
- ✅ Utilise les connaissances internes
- ✅ Réponse rapide et économique

## 💰 Coûts

- **Serper API** : Gratuit jusqu'à 2500 requêtes/mois
- **GPT-4o-mini** : ~$0.15/1M tokens (inchangé)
- **Total** : Très économique !

## 🚀 Avantages

✅ **Données en temps réel** : Matchs du jour, cotes actuelles, actualités
✅ **Économique** : Gratuit jusqu'à 2500 recherches/mois
✅ **Automatique** : Détection intelligente des besoins
✅ **Combiné** : Recherche web + connaissances IA = meilleure analyse

## 📊 Statistiques

Après intégration, vous pouvez :
- Voir les statistiques d'utilisation sur https://serper.dev
- Suivre le nombre de requêtes restantes
- Passer au plan payant si nécessaire ($50/mois pour 10,000 requêtes)

## 🔧 Personnalisation

Si vous voulez modifier les mots-clés qui déclenchent la recherche, éditez la fonction `shouldPerformWebSearch()` dans `app/api/chat/route.ts`.

## ⚠️ Note

Si `SERPER_API_KEY` n'est pas configurée, l'application fonctionnera normalement mais sans recherche web (utilisera uniquement les connaissances internes).

---

**L'intégration est prête ! Il ne reste plus qu'à ajouter votre clé Serper dans `.env.local` !** 🎉


