const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// --- CONFIGURATION ---
const MONGO_URI = process.env.MONGO_URL;
const ADMIN_PASSWORD = 'KEHhoE1ZPF5cVH88'; 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.use(session({
    secret: 'jagb_secret_key_88',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 } // 1 heure de session
}));

// --- CONNEXION MONGODB ---
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connecté avec succès !'))
    .catch(err => console.error('❌ Erreur de connexion MongoDB :', err));

// --- MODÈLES (Produits et Commandes) ---
const Product = mongoose.model('Product', new mongoose.Schema({
    name: String,
    price: Number,
    stock: { type: Number, default: 0 },
    category: String,
    image: String
}));

const Commande = mongoose.model('Commande', new mongoose.Schema({
    clientNom: String,
    clientTel: String,
    produitNom: String,
    prix: Number,
    quantite: Number,
    total: Number,
    methodePaiement: String,
    date: { type: Date, default: Date.now }
}));

// --- ROUTES HTML ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'jagb.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'about.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));

app.get('/admin', (req, res) => {
    if (req.session.loggedIn) res.sendFile(path.join(__dirname, 'admin.html'));
    else res.redirect('/login');
});

// --- LOGIQUE LOGIN ---
app.post('/login', (req, res) => {
    if (req.body.password === ADMIN_PASSWORD) {
        req.session.loggedIn = true;
        res.redirect('/admin');
    } else {
        res.redirect('/login?error=1');
    }
});

// --- API PRODUITS ---
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/products', async (req, res) => {
    try {
        const newP = new Product(req.body);
        await newP.save();
        res.status(201).json(newP);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndUpdate(req.params.id, req.body);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- API COMMANDES ---
app.post('/api/commandes', async (req, res) => {
    try {
        const nouvelleCommande = new Commande(req.body);
        await nouvelleCommande.save();
        res.status(201).json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- API RAPPORT ADMIN (Pour afficher les commandes sur la page admin) ---
app.get('/api/admin/rapport', async (req, res) => {
    if (!req.session.loggedIn) return res.status(401).send("Non autorisé");
    try {
        const commandes = await Commande.find().sort({ date: -1 });
        const produits = await Product.countDocuments();
        res.json({ commandes, stats: { produits } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- GESTION ERREUR 404 (Dernière route) ---
app.use((req, res) => {
    res.status(404).send(`
        <div style="text-align:center; padding:50px; font-family:'Poppins', sans-serif;">
            <h1 style="font-size:100px; color:#ff8000; margin:0;">404</h1>
            <h2>Oups ! Ce ballon est hors-jeu.</h2>
            <p>La page que vous cherchez n'existe pas sur JAGB Store.</p>
            <a href="/" style="display:inline-block; margin-top:20px; padding:10px 20px; background:#ff8000; color:white; text-decoration:none; border-radius:5px; font-weight:bold;">RETOURNER À LA BOUTIQUE</a>
        </div>
    `);
});

// --- LANCEMENT DU SERVEUR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur JAGB opérationnel sur le port ${PORT}`);
});