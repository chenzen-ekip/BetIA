# BetIA - Assistant Conversationnel des Paris Sportifs

Assistant conversationnel expert en paris sportifs et analyse de football, construit avec Next.js, React et OpenAI GPT-4o Mini.

## 🚀 Fonctionnalités

- **Interface ChatGPT-like** : Design minimaliste et épuré en mode sombre
- **Analyse de matchs** : Analyses détaillées avec statistiques, historique et prédictions
- **Recommandations de paris** : Suggestions basées sur des données avec niveau de confiance
- **Streaming des réponses** : Réponses en temps réel pour une expérience fluide
- **Expertise IA** : Utilise GPT-4o Mini avec connaissances internes (recherche web optionnelle via API externe)

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Clé API OpenAI

## 🛠️ Installation

1. Clonez le repository :
```bash
git clone <repository-url>
cd BetIA
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement :
Créez un fichier `.env.local` à la racine du projet :
```
OPENAI_API_KEY=sk-your-api-key-here
```

4. Lancez le serveur de développement :
```bash
npm run dev
```

5. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du projet

```
BetIA/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts         # Endpoint API de chat
│   ├── components/
│   │   ├── ChatInterface.tsx    # Interface principale
│   │   ├── MessageList.tsx      # Liste des messages
│   │   └── InputBox.tsx         # Barre de saisie
│   ├── globals.css              # Styles globaux
│   ├── layout.tsx               # Layout global
│   └── page.tsx                 # Page principale
├── lib/
│   ├── openai.ts                # Configuration OpenAI
│   └── types.ts                 # Types TypeScript
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## 🎯 Utilisation

### Exemples de questions

- "Analyse PSG vs Lyon samedi"
- "Quel est le meilleur pari pour Manchester United vs Liverpool ?"
- "Quels sont les meilleurs matchs de ce weekend ?"
- "Analyse détaillée du match Real Madrid vs Barcelona"

### Fonctionnalités de l'assistant

L'assistant fournit :
- **Contexte du match** : Équipes, compétition, enjeu
- **Analyse statistique** : Forme, possession, buts, xG, confrontations
- **Facteurs contextuels** : Fatigue, motivation, absences
- **Prédictions** : Consensus des experts et tendances du marché
- **Recommandations** : Meilleur pari avec cotes, justification et niveau de confiance

## ⚙️ Configuration

### Paramètres OpenAI

Les paramètres de l'API sont configurés dans `app/api/chat/route.ts` :
- **Model** : `gpt-4o-mini`
- **Temperature** : `0.7`
- **Max tokens** : `2000`
- **Top-p** : `0.9`

### Personnalisation du prompt

Le prompt système est défini dans `lib/openai.ts`. Vous pouvez le modifier pour ajuster le comportement de l'assistant.

## 🚨 Disclaimers légaux

⚠️ **Important** : Cet assistant fournit des analyses à titre informatif uniquement et ne constitue pas un conseil financier.

Les paris comportent des risques. Jouez de manière responsable et ne misez que ce que vous pouvez vous permettre de perdre.

Les résultats passés ne garantissent pas les résultats futurs.

## 🧪 Tests

Pour tester l'application :

1. Lancez le serveur de développement
2. Testez avec des matchs réels
3. Vérifiez la qualité des analyses
4. Vérifiez le temps de réponse (< 15 secondes)

## 📦 Déploiement

### Vercel (recommandé)

1. Connectez votre repository à Vercel
2. Ajoutez la variable d'environnement `OPENAI_API_KEY`
3. Déployez

### Autres plateformes

L'application peut être déployée sur toute plateforme supportant Next.js (Netlify, Railway, etc.).

## 🔮 Roadmap

- [ ] Historique des conversations persistant
- [ ] Système de notation des prédictions
- [ ] Support d'autres sports (Tennis, Basketball, etc.)
- [ ] Système de gestion du bankroll
- [ ] Application mobile
- [ ] Intégration avec les notifications

## 📝 Licence

Ce projet est en développement beta.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

---

Développé avec ❤️ pour les passionnés de paris sportifs

