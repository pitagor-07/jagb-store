const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');

const app = express();

// --- CONFIGURATION MULTER POUR LES PHOTOS ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;
const ADMIN_PASSWORD = 'KEHhoE1ZPF5cVH88';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); 
app.use('/uploads', express.static('uploads')); 

app.use(session({
    secret: 'jagb_secret_key_88',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 }
}));

mongoose.connect(MONGO_URI).then(() => console.log('MongoDB connecté !'));

const Product = mongoose.model('Product', new mongoose.Schema({
    name: String, price: Number, category: String, image: String
}));

const Commande = mongoose.model('Commande', new mongoose.Schema({
    clientNom: String, produitNom: String, total: Number, date: { type: Date, default: Date.now }
}));

// --- ROUTES ---
app.get('/admin', (req, res) => {
    if (req.session.loggedIn) res.sendFile(path.join(__dirname, 'admin.html'));
    else res.redirect('/login');
});

app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// AJOUT PRODUIT
app.post('/api/products', upload.single('imageFile'), async (req, res) => {
    try {
        const productData = {
            name: req.body.name,
            price: Number(req.body.price),
            category: req.body.category,
            image: req.file ? `/uploads/${req.file.filename}` : '/uploads/default.jpg'
        };
        const newP = new Product(productData);
        await newP.save();
        res.status(201).json(newP);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// MODIFICATION PRODUIT (C'est ici qu'était le bug)
app.put('/api/products/:id', upload.single('imageFile'), async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            price: Number(req.body.price),
            category: req.body.category
        };
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }
        await Product.findByIdAndUpdate(req.params.id, updateData);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

app.get("/api/admin/rapport", async (req, res) => {
    const commandes = await Commande.find().sort({ date: -1 });
    res.json({ commandes });
});

const PORT = process.env.PORT || 3000;

// Route pour afficher la page de login
app.get('/login', (req, res) => {
    res.send(`
        <div style="text-align:center; margin-top:100px; font-family:Arial;">
            <h2>Connexion Admin JAGB</h2>
            <form action="/login" method="POST" style="display:inline-block; border:1px solid #ccc; padding:20px; border-radius:10px;">
                <input type="password" name="password" placeholder="Mot de passe" required style="padding:10px;"><br><br>
                <button type="submit" style="background:#ff8000; color:white; border:none; padding:10px 20px; cursor:pointer; font-weight:bold;">ENTRER</button>
            </form>
        </div>
    `);
});

// Route pour traiter le mot de passe
app.post('/login', (req, res) => {
    if (req.body.password === ADMIN_PASSWORD) {
        req.session.loggedIn = true;
        res.redirect('/admin');
    } else {
        res.send('Mot de passe incorrect. <a href="/login">Réessayer</a>');
    }
});
app.listen(PORT, () => { console.log('Serveur sur port ' + PORT); });