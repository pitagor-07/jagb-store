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
            image: req.file ? /uploads/${req.file.filename} : '/uploads/default.jpg'
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
            updateData.image = /uploads/${req.file.filename};
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
app.listen(PORT, () => { console.log('Serveur sur port ' + PORT); });