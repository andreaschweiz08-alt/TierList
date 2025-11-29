const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser'); // Aggiunto

const app = express();
const PORT = process.env.PORT || 3000;

// CRITICAL: La chiave deve essere passata solo dal server tramite variabile d'ambiente.
const ADMIN_KEY = process.env.ADMIN_KEY; 

// Variabile di controllo per prevenire scritture concorrenti sul file
let isWriting = false;

// Percorso unificato per il database.
const DATABASE_PATH = path.join(__dirname, 'database.json');

// Mappa dei punti per il calcolo Overall (Spostata dal frontend al backend)
const RANK_POINTS = {
    "S": 100, "A+": 80, "A-": 70, "B+": 50, "B-": 40,
    "C+": 30, "C-": 20, "D+": 15, "D-": 10, "F": 5
};

// Funzione di utilità per calcolare il rank Overall
function calculateOverallRank(playerRanks) {
    const ranks = Object.values(playerRanks).filter(r => RANK_POINTS.hasOwnProperty(r));
    if (ranks.length === 0) return 'N/A';

    const totalPoints = ranks.reduce((sum, rank) => sum + RANK_POINTS[rank], 0);
    const averagePoints = totalPoints / ranks.length;

    // Logica per assegnare la tier in base alla media
    if (averagePoints >= 90) return 'S';
    if (averagePoints >= 75) return 'A+';
    if (averagePoints >= 65) return 'A-';
    if (averagePoints >= 45) return 'B+';
    if (averagePoints >= 35) return 'B-';
    if (averagePoints >= 25) return 'C+';
    if (averagePoints >= 12.5) return 'C-';
    if (averagePoints >= 7.5) return 'D+';
    if (averagePoints >= 6) return 'D-';
    return 'F';
}

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Usa body-parser per gestire i body delle richieste
app.use(express.static(__dirname));

// Funzione di utilità per leggere il database
const readDatabase = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(DATABASE_PATH, 'utf8', (err, data) => {
            if (err) {
                // Se il file non esiste, ritorna una struttura base
                if (err.code === 'ENOENT') {
                    return resolve({ players: [], modes: [{ name: "Overall", id: "overall" }] });
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

// Funzione di utilità per scrivere il database con lock
const writeDatabase = (data) => {
    return new Promise((resolve, reject) => {
        if (isWriting) {
            return reject(new Error('Database is currently being written to. Try again shortly.'));
        }
        isWriting = true;
        
        fs.writeFile(DATABASE_PATH, JSON.stringify(data, null, 2), err => {
            isWriting = false;
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
};


// Endpoint per ottenere i dati del database con il calcolo Overall
app.get('/api/database', async (req, res) => {
    try {
        const db = await readDatabase();
        
        // Calcola il rank Overall per ogni giocatore e aggiungilo ai ranks
        db.players.forEach(player => {
            const overallRank = calculateOverallRank(player.ranks);
            // Non modifica il file database, lo aggiunge solo all'oggetto da inviare
            player.ranks['Overall'] = overallRank; 
            player.overallRank = overallRank; // campo aggiuntivo per facilitare il frontend
        });

        res.json(db);
    } catch (error) {
        console.error("Errore nel recupero del database:", error);
        res.status(500).send('Error retrieving or parsing database.');
    }
});

// Middleware di autenticazione per le rotte amministrative
const authenticateAdmin = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!ADMIN_KEY) {
        console.error("ADMIN_KEY non impostata. Controlla le variabili d'ambiente.");
        return res.status(500).send('Server configuration error.');
    }
    if (apiKey !== ADMIN_KEY) {
        return res.status(403).send('Unauthorized');
    }
    next();
};

// Endpoint per aggiungere un nuovo giocatore o aggiornare il rank di uno esistente
app.post('/api/add-player', authenticateAdmin, async (req, res) => {
    const { name, mode, tier, region } = req.body;

    if (!name || !mode || !tier || !region) {
        return res.status(400).send('Missing player details (name, mode, tier, region).');
    }

    try {
        const db = await readDatabase();
        const playerToUpdate = db.players.find(p => p.name.toLowerCase() === name.toLowerCase());

        if (playerToUpdate) {
            if (!playerToUpdate.ranks) {
                playerToUpdate.ranks = {};
            }
            // Aggiorna il rank specifico per la modalità
            playerToUpdate.ranks[mode] = tier;
        } else {
            // Nuovo giocatore
            const newPlayer = {
                name,
                region,
                ranks: { [mode]: tier }
            };
            db.players.push(newPlayer);
        }

        await writeDatabase(db);
        res.status(200).send('Player data updated successfully.');

    } catch (error) {
        console.error("Error during player update:", error);
        res.status(500).send(error.message || 'Error processing request.');
    }
});

// Endpoint per rimuovere un giocatore
app.post('/api/remove-player', authenticateAdmin, async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).send('Missing player name.');
    }

    try {
        const db = await readDatabase();
        const initialLength = db.players.length;
        
        db.players = db.players.filter(p => p.name.toLowerCase() !== name.toLowerCase());

        if (db.players.length === initialLength) {
            return res.status(404).send('Player not found.');
        }

        await writeDatabase(db);
        res.status(200).send('Player removed successfully.');

    } catch (error) {
        console.error("Error during player removal:", error);
        res.status(500).send(error.message || 'Error processing request.');
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
