const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CHIAVE ADMIN: Impostala nelle variabili d'ambiente di Render o usa questa per test locale
const ADMIN_KEY = process.env.ADMIN_KEY || "ChiaveSegretaDiTest123";

const DATABASE_PATH = path.join(__dirname, 'database.json');
let isWriting = false;

// Punteggi per il calcolo automatico
const RANK_POINTS = {
    "S": 100, "A+": 90, "A-": 80, "B+": 70, "B-": 60,
    "C+": 50, "C-": 40, "D+": 30, "D-": 20, "F": 10
};

app.use(cors()); // Abilita CORS per tutte le origini
app.use(express.json()); // Gestisce i JSON senza body-parser
app.use(express.static(__dirname));

// Utility: Leggi Database
const readDatabase = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(DATABASE_PATH, 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    // Crea struttura base se il file non esiste
                    const initialData = { 
                        players: [], 
                        modes: [
                            { name: "Overall", id: "overall" },
                            { name: "Bedwars", id: "bedwars" },
                            { name: "Boxing", id: "boxing" },
                            { name: "Nodebuff", id: "nodebuff" },
                            { name: "Classic", id: "classic" }
                        ] 
                    };
                    return resolve(initialData);
                }
                return reject(err);
            }
            try {
                resolve(JSON.parse(data));
            } catch (e) {
                reject(e);
            }
        });
    });
};

// Utility: Scrivi Database
const writeDatabase = (data) => {
    return new Promise((resolve, reject) => {
        if (isWriting) return reject(new Error('Server occupato, riprova tra un attimo.'));
        isWriting = true;
        fs.writeFile(DATABASE_PATH, JSON.stringify(data, null, 2), err => {
            isWriting = false;
            if (err) return reject(err);
            resolve();
        });
    });
};

// Calcolo Overall Rank
function calculateOverall(ranks) {
    const validRanks = Object.values(ranks).filter(r => RANK_POINTS[r]);
    if (validRanks.length === 0) return 'N/A';
    
    const total = validRanks.reduce((sum, r) => sum + RANK_POINTS[r], 0);
    const avg = total / validRanks.length;

    if (avg >= 95) return 'S';
    if (avg >= 85) return 'A+';
    if (avg >= 75) return 'A-';
    if (avg >= 65) return 'B+';
    if (avg >= 55) return 'B-';
    if (avg >= 45) return 'C+';
    if (avg >= 35) return 'C-';
    if (avg >= 25) return 'D+';
    if (avg >= 15) return 'D-';
    return 'F';
}

// === ROTTE ===

app.get('/api/database', async (req, res) => {
    try {
        const db = await readDatabase();
        // Calcola overall al volo
        db.players.forEach(p => {
            p.overallRank = calculateOverall(p.ranks);
            p.ranks['Overall'] = p.overallRank;
        });
        res.json(db);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore server lettura DB' });
    }
});

// Middleware auth semplice
const requireAuth = (req, res, next) => {
    if (req.headers['x-api-key'] !== ADMIN_KEY) {
        return res.status(403).json({ error: 'Chiave non valida' });
    }
    next();
};

app.post('/api/add-player', requireAuth, async (req, res) => {
    const { name, mode, tier, region } = req.body;
    if (!name || !mode || !tier || !region) return res.status(400).json({ error: 'Dati mancanti' });

    try {
        const db = await readDatabase();
        let player = db.players.find(p => p.name.toLowerCase() === name.toLowerCase());

        if (!player) {
            player = { name, region, ranks: {} };
            db.players.push(player);
        } else {
            // Aggiorna regione se cambiata
            player.region = region;
        }

        player.ranks[mode] = tier;
        await writeDatabase(db);
        res.json({ success: true, message: 'Giocatore aggiornato' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/remove-player', requireAuth, async (req, res) => {
    const { name } = req.body;
    try {
        const db = await readDatabase();
        const initialLen = db.players.length;
        db.players = db.players.filter(p => p.name.toLowerCase() !== name.toLowerCase());
        
        if (db.players.length === initialLen) return res.status(404).json({ error: 'Giocatore non trovato' });
        
        await writeDatabase(db);
        res.json({ success: true, message: 'Giocatore rimosso' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => console.log(`Server attivo su porta ${PORT}`));
