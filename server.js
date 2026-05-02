const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer'); // AJOUTÉ

const app = express();

// --- CONFIGURATION MULTER ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Les photos iront dans ton nouveau dossier
    },
    filename: (req, file, cb) => {
        // Donne un nom unique : date-nomdufichier.extension
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- CONFIGURATION ---
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;
const ADMIN_PASSWORD = 'KEHhoE1ZPF5cVH88';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); 
app.use('/uploads', express.static('uploads')); // AJOUTÉ : Pour voir les photos

app.use(session({
    secret: 'jagb_secret_key_88',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 }
}));

// --- CONNEXION MONGODB ---
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connecte !'))
    .catch(err => console.error('Erreur MongoDB :', err));

// --- MODELES ---
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

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// --- API PRODUITS ---
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// MODIFIÉ : Ajout de upload.single('imageFile') pour capter la photo du téléphone
app.post('/api/products', upload.single('imageFile'), async (req, res) => {
    try {
        const productData = {
            name: req.body.name,
            price: Number(req.body.price),
            stock: Number(req.body.stock) || 0,
            category: req.body.category,
            // Si une photo est uploadée, on prend son chemin, sinon on prend le lien texte
            image: req.file ? `/uploads/${req.file.filename}` : req.body.image
        };
        const newP = new Product(productData);
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

// --- API RAPPORT ADMIN ---
app.get("/api/admin/rapport", async (req, res) => {
    try {
        const commandes = await Commande.find().sort({ date: -1 });
        const produits = await Product.countDocuments();
        res.json({ commandes, stats: { produits } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- GESTION ERREUR 404 ---
app.use((req, res) => {
    res.status(404).send('<div style="text-align:center;padding:50px;font-family:Poppins,sans-serif;"><h1 style="font-size:100px;color:#ff8000;margin:0;">404</h1><h2>Ce ballon est hors-jeu.</h2><a href="/" style="display:inline-block;margin-top:20px;padding:10px 20px;background:#ff8000;color:white;text-decoration:none;border-radius:5px;font-weight:bold;">RETOURNER A LA BOUTIQUE</a></div>');
});

// --- LANCEMENT DU SERVEUR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Serveur JAGB sur le port ' + PORT);
});