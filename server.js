const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/lostfounddb', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const lostFoundSchema = new mongoose.Schema({
    type: String,
    item: String,
    description: String,
});

const LostFoundItem = mongoose.model('LostFoundItem', lostFoundSchema);

app.use(express.static('public'));

// Multer setup for file uploads (not used in this example)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// Endpoint to save lost or found item
app.post('/saveitem', (req, res) => {
    const { type, item, description } = req.body;

    const newItem = new LostFoundItem({
        type: type,
        item: item,
        description: description,
    });

    newItem.save((err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error saving item');
        } else {
            res.status(200).send('Item saved successfully');
        }
    });
});

// Endpoint to get all items
app.get('/getitems', (req, res) => {
    LostFoundItem.find({}, (err, items) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error fetching items');
        } else {
            res.json(items);
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
