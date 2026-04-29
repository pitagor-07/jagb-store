═══════════════════════════════════════════════
   JAGB STORE - GUIDE D'INSTALLATION COMPLET
═══════════════════════════════════════════════

📁 FICHIERS DU PROJET :
   server.js      → Serveur principal (REMPLACE l'ancien)
   login.html     → Page de connexion admin (NOUVEAU)
   admin.html     → Page d'administration
   jagb.html      → Page principale boutique
   style.css      → Styles du site
   package.json   → Dépendances Node.js
   logo.jpeg      → Votre logo (ne pas toucher)

─────────────────────────────────────────────
🔐 MOT DE PASSE ADMIN : KEHhoE1ZPF5cVH88
   (Gardez-le secret !)
─────────────────────────────────────────────

📦 ÉTAPE 1 - INSTALLER LES DÉPENDANCES :
   npm install

🍃 ÉTAPE 2 - INSTALLER MONGODB :
   → Windows : https://www.mongodb.com/try/download/community
   → Mac     : brew install mongodb-community
   → Linux   : sudo apt install mongodb

▶️  ÉTAPE 3 - DÉMARRER LE SERVEUR :
   node server.js

🌐 ÉTAPE 4 - ACCÉDER AU SITE :
   Boutique : http://localhost:3000
   Admin    : http://localhost:3000/admin
   Login    : http://localhost:3000/login

─────────────────────────────────────────────
☁️  MISE EN LIGNE (Render.com - GRATUIT) :
─────────────────────────────────────────────
1. Créer un compte sur https://render.com
2. Créer un compte sur https://www.mongodb.com/atlas (gratuit)
3. Dans MongoDB Atlas : créer un cluster gratuit
4. Copier votre URL MongoDB Atlas (ex: mongodb+srv://...)
5. Sur Render : New → Web Service → connecter votre code
6. Ajouter la variable d'environnement :
   MONGO_URL = votre_url_mongodb_atlas
7. Votre site sera en ligne avec HTTPS automatique ! ✅

═══════════════════════════════════════════════
