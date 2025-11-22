# 📋 Checklist Beta - BetIA

## ✅ Ce qui est DÉJÀ implémenté

### 🔐 Authentification
- ✅ Clerk intégré et fonctionnel
- ✅ Middleware de protection des routes
- ✅ Vérification d'authentification dans l'API
- ✅ Interface de connexion/déconnexion

### 💬 Chat Interface
- ✅ Interface ChatGPT-like complète
- ✅ Streaming des réponses en temps réel
- ✅ Gestion des messages (affichage, formatage Markdown)
- ✅ Indicateur de frappe
- ✅ Gestion des erreurs basique

### 🤖 Intelligence Artificielle
- ✅ Intégration OpenAI (GPT-4o-mini)
- ✅ Prompt système optimisé pour les paris sportifs
- ✅ Stratégie de recherche "Triangulation" (3 recherches parallèles)
- ✅ Stratégie de recherche "Radar" (recherche globale)
- ✅ Intégration Transfermarkt pour les effectifs
- ✅ Injection de la date actuelle pour éviter les hallucinations
- ✅ Gestion du contexte conversationnel

### 🔍 Recherche Web
- ✅ Intégration Serper API
- ✅ Recherches ciblées par équipe
- ✅ Recherches Transfermarkt pour joueurs/effectifs
- ✅ Formatage des résultats pour l'IA

### 🎨 Interface Utilisateur
- ✅ Design sombre moderne
- ✅ Animations Framer Motion
- ✅ Responsive design
- ✅ Sidebar (structure prête)
- ✅ Header et Footer

---

## ❌ Ce qui MANQUE pour une Beta

### 🔴 CRITIQUE (Bloquant pour Beta)

#### 1. **Gestion des Conversations** ⚠️ PRIORITÉ 1
**Problème actuel :**
- Les conversations ne sont pas sauvegardées
- Le Sidebar affiche "Aucune conversation" en permanence
- Les messages disparaissent au rechargement de la page
- Le bouton "Nouveau chat" ne fonctionne pas

**Ce qu'il faut :**
- [ ] Créer un modèle Prisma pour `Conversation` et `Message`
- [ ] API route pour créer/sauvegarder des conversations
- [ ] API route pour récupérer la liste des conversations d'un utilisateur
- [ ] API route pour charger une conversation spécifique
- [ ] API route pour supprimer une conversation
- [ ] Intégrer la sauvegarde dans `useChat` hook
- [ ] Implémenter le bouton "Nouveau chat"
- [ ] Afficher les conversations dans le Sidebar
- [ ] Permettre de cliquer sur une conversation pour la charger

**Estimation :** 4-6 heures

#### 2. **Base de Données pour Conversations** ⚠️ PRIORITÉ 1
**Problème actuel :**
- Le schéma Prisma existe mais est pour NextAuth (ancien système)
- Pas de modèle pour stocker les conversations/messages
- Pas de relation avec les utilisateurs Clerk

**Ce qu'il faut :**
- [ ] Créer/modifier le schéma Prisma :
  ```prisma
  model Conversation {
    id        String   @id @default(cuid())
    userId    String   // Clerk user ID
    title     String
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    messages  Message[]
  }

  model Message {
    id             String       @id @default(cuid())
    conversationId String
    conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
    role           String       // 'user' | 'assistant'
    content        String
    createdAt      DateTime     @default(now())
  }
  ```
- [ ] Exécuter `npx prisma migrate dev`
- [ ] Créer `lib/prisma.ts` pour l'instance Prisma

**Estimation :** 1-2 heures

#### 3. **Génération de Titre pour Conversations** ⚠️ PRIORITÉ 2
**Problème actuel :**
- Pas de titre automatique pour les conversations
- Le Sidebar ne peut pas afficher de titre

**Ce qu'il faut :**
- [ ] Générer un titre automatique basé sur le premier message
- [ ] Utiliser OpenAI pour créer un titre court (max 50 caractères)
- [ ] Sauvegarder le titre lors de la création de la conversation

**Estimation :** 1-2 heures

---

### 🟡 IMPORTANT (Recommandé pour Beta)

#### 4. **Rate Limiting** ⚠️ PRIORITÉ 2
**Problème actuel :**
- Pas de protection contre le spam
- Un utilisateur peut envoyer des milliers de requêtes
- Risque de coûts API élevés

**Ce qu'il faut :**
- [ ] Implémenter un rate limiter (ex: `@upstash/ratelimit`)
- [ ] Limiter à X requêtes par minute/heure par utilisateur
- [ ] Retourner une erreur 429 si limite dépassée
- [ ] Afficher un message clair à l'utilisateur

**Estimation :** 2-3 heures

#### 5. **Gestion des Erreurs Améliorée** ⚠️ PRIORITÉ 2
**Problème actuel :**
- Gestion d'erreur basique
- Pas de retry automatique
- Pas de logs d'erreur structurés

**Ce qu'il faut :**
- [ ] Retry automatique pour les erreurs réseau temporaires
- [ ] Logs d'erreur structurés (ex: avec Sentry ou console)
- [ ] Messages d'erreur plus clairs pour l'utilisateur
- [ ] Gestion des timeouts API

**Estimation :** 2-3 heures

#### 6. **Variables d'Environnement Manquantes** ⚠️ PRIORITÉ 2
**Problème actuel :**
- `SERPER_API_KEY` pourrait ne pas être configurée
- Pas de validation des variables au démarrage

**Ce qu'il faut :**
- [ ] Vérifier que `SERPER_API_KEY` est configurée
- [ ] Créer un script de validation des variables d'environnement
- [ ] Afficher des erreurs claires si variables manquantes

**Estimation :** 1 heure

#### 7. **Limites de Quotas API** ⚠️ PRIORITÉ 3
**Problème actuel :**
- Pas de gestion des quotas OpenAI/Serper
- Risque de dépassement de budget

**Ce qu'il faut :**
- [ ] Suivre l'utilisation des tokens OpenAI
- [ ] Suivre le nombre de requêtes Serper
- [ ] Afficher des avertissements si quotas proches
- [ ] Bloquer les requêtes si quota dépassé

**Estimation :** 3-4 heures

---

### 🟢 NICE TO HAVE (Optionnel pour Beta)

#### 8. **Recherche dans les Conversations** 
- [ ] Barre de recherche dans le Sidebar
- [ ] Filtrer les conversations par mot-clé

**Estimation :** 2 heures

#### 9. **Export de Conversations**
- [ ] Permettre d'exporter une conversation en PDF/Markdown
- [ ] Bouton "Exporter" dans chaque conversation

**Estimation :** 2-3 heures

#### 10. **Paramètres Utilisateur**
- [ ] Page de paramètres (actuellement juste un bouton)
- [ ] Préférences de langue
- [ ] Préférences de notifications

**Estimation :** 3-4 heures

#### 11. **Analytics Basiques**
- [ ] Suivre le nombre de messages envoyés
- [ ] Suivre le nombre de conversations créées
- [ ] Dashboard admin (optionnel)

**Estimation :** 4-5 heures

#### 12. **Tests**
- [ ] Tests unitaires pour les hooks
- [ ] Tests d'intégration pour les API routes
- [ ] Tests E2E basiques

**Estimation :** 6-8 heures

#### 13. **Documentation Utilisateur**
- [ ] Guide d'utilisation complet
- [ ] FAQ
- [ ] Exemples de questions

**Estimation :** 2-3 heures

#### 14. **Configuration Production**
- [ ] Variables d'environnement pour production
- [ ] Configuration Vercel/autre plateforme
- [ ] Optimisations de build

**Estimation :** 2-3 heures

---

## 📊 Résumé par Priorité

### 🔴 CRITIQUE (Doit être fait avant Beta)
1. ✅ Gestion des Conversations (4-6h)
2. ✅ Base de Données (1-2h)
3. ✅ Génération de Titre (1-2h)

**Total Critique :** 6-10 heures

### 🟡 IMPORTANT (Recommandé pour Beta)
4. Rate Limiting (2-3h)
5. Gestion des Erreurs (2-3h)
6. Variables d'Environnement (1h)
7. Limites de Quotas (3-4h)

**Total Important :** 8-11 heures

### 🟢 NICE TO HAVE (Optionnel)
8-14. Features optionnelles (20-30h)

---

## 🎯 Plan d'Action Recommandé pour Beta

### Phase 1 : Fonctionnalités Critiques (1-2 jours)
1. Créer le schéma Prisma pour conversations
2. Implémenter la sauvegarde des conversations
3. Implémenter le chargement des conversations
4. Implémenter le bouton "Nouveau chat"
5. Génération automatique de titres

### Phase 2 : Sécurité & Stabilité (1 jour)
6. Rate limiting
7. Gestion d'erreurs améliorée
8. Validation des variables d'environnement

### Phase 3 : Optimisations (Optionnel)
9. Limites de quotas
10. Tests basiques
11. Documentation

---

## ✅ Checklist Finale Beta

Avant de lancer la beta, vérifier :

- [ ] Les conversations sont sauvegardées et récupérables
- [ ] Le bouton "Nouveau chat" fonctionne
- [ ] Les conversations s'affichent dans le Sidebar
- [ ] Rate limiting est actif
- [ ] Gestion d'erreurs robuste
- [ ] Toutes les variables d'environnement sont configurées
- [ ] L'application fonctionne après un rechargement de page
- [ ] Les messages persistent entre les sessions
- [ ] Pas de bugs critiques connus

---

**Estimation totale pour Beta complète :** 14-21 heures de développement

**Estimation pour Beta minimale (Critique seulement) :** 6-10 heures de développement


