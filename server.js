const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Correzione critica per Render

const app = express();
const PORT = process.env.PORT || 3000;

// Legge la chiave Admin dalla variabile d'ambiente di Render (metodo raccomandato)
// Se non usi Render, la chiave di fallback è quella che avevi usato
const ADMIN_KEY = process.env.ADMIN_KEY || "hMyFOadnp3~kN6"; 

const DATABASE_PATH = path.join(__dirname, 'database.json');

// Middleware
app.use(cors()); // Abilita CORS
app.use(express.json());
app.use(express.static(__dirname));

// Endpoint per ottenere i dati del database
app.get('/api/database', (req, res) => {
    fs.readFile(DATABASE_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error("Errore lettura database:", err);
            // Inizializza con un database vuoto se il file non esiste
            if (err.code === 'ENOENT') {
                 return res.json({ players: [], modes: [{ name: "Overall", id: "overall" }] });
            }
            return res.status(500).send('Error reading database file.');
        }
        res.json(JSON.parse(data));
    });
});

// Endpoint per aggiornare il tier di un giocatore
app.post('/api/update-player-tier', (req, res) => {
    const { name, mode, newTier } = req.body;
    const apiKey = req.headers['x-api-key'];

    if (apiKey !== ADMIN_KEY) {
        return res.status(403).send('Unauthorized');
    }

    if (!name || !mode || !newTier) {
        return res.status(400).send('Missing player name, mode, or new tier.');
    }

    fs.readFile(DATABASE_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading database file.');
        }

        try {
            const db = JSON.parse(data);
            const playerIndex = db.players.findIndex(p => p.name === name);

            if (playerIndex === -1) {
                return res.status(404).send('Player not found.');
            }

            // Aggiunge la gestione se 'ranks' non esiste (previene l'errore)
            if (!db.players[playerIndex].ranks) {
                db.players[playerIndex].ranks = {};
            }
            
            db.players[playerIndex].ranks[mode] = newTier;

            fs.writeFile(DATABASE_PATH, JSON.stringify(db, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error writing to database file.');
                }
                res.status(200).send('Player tier updated successfully!');
            });
        } catch (parseErr) {
            console.error(parseErr);
            res.status(500).send('Error parsing database file.');
        }
    });
});

// Endpoint per rimuovere SOLO il tier di un giocatore
app.post('/api/remove-player-tier', (req, res) => {
    const { name, mode } = req.body;
    const apiKey = req.headers['x-api-key'];

    if (apiKey !== ADMIN_KEY) {
        return res.status(403).send('Unauthorized');
    }

    if (!name || !mode) {
        return res.status(400).send('Missing player name or mode.');
    }

    fs.readFile(DATABASE_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading database file.');
        }

        try {
            const db = JSON.parse(data);
            const playerIndex = db.players.findIndex(p => p.name === name);

            if (playerIndex === -1) {
                return res.status(404).send('Player not found.');
            }
            
            // Verifica che l'oggetto ranks e la proprietà mode esistano prima di eliminare
            if (db.players[playerIndex].ranks && db.players[playerIndex].ranks[mode]) {
                delete db.players[playerIndex].ranks[mode];
            } else {
                return res.status(404).send('Tier for this mode not found.');
            }

            fs.writeFile(DATABASE_PATH, JSON.stringify(db, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error writing to database file.');
                }
                res.status(200).send('Player tier removed successfully!');
            });
        } catch (parseErr) {
            console.error(parseErr);
            res.status(500).send('Error parsing database file.');
        }
    });
});

// NUOVO ENDPOINT: Rimuove l'intero giocatore dal database
app.post('/api/remove-player', (req, res) => {
    const { name } = req.body;
    const apiKey = req.headers['x-api-key'];

    if (apiKey !== ADMIN_KEY) {
        return res.status(403).send('Unauthorized');
    }

    if (!name) {
        return res.status(400).send('Missing player name.');
    }

    fs.readFile(DATABASE_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error reading database.');

        try {
            let db = JSON.parse(data);
            const initialLength = db.players.length;
            
            // Filtra per creare un nuovo array ESCLUDENDO il giocatore con quel nome
            db.players = db.players.filter(p => p.name !== name);

            if (db.players.length === initialLength) {
                return res.status(404).send('Player not found.');
            }

            fs.writeFile(DATABASE_PATH, JSON.stringify(db, null, 2), err => {
                if (err) return res.status(500).send('Error writing to database.');
                res.status(200).send(`Giocatore ${name} rimosso con successo!`);
            });
        } catch (parseErr) {
            console.error(parseErr);
            res.status(500).send('Error parsing database file.');
        }
    });
});


// Endpoint per aggiungere un nuovo giocatore (o aggiornarlo se esiste)
app.post('/api/add-player', (req, res) => {
    const { name, mode, tier, region } = req.body;
    const apiKey = req.headers['x-api-key'];

    if (apiKey !== ADMIN_KEY) {
        return res.status(403).send('Unauthorized');
    }

    fs.readFile(DATABASE_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error reading database.');

        const db = JSON.parse(data);
        const playerExists = db.players.some(p => p.name === name);

        if (playerExists) {
            const playerToUpdate = db.players.find(p => p.name === name);
             if (!playerToUpdate.ranks) {
                playerToUpdate.ranks = {};
            }
            playerToUpdate.ranks[mode] = tier;
        } else {
            const newPlayer = {
                name,
                region,
                ranks: { [mode]: tier }
            };
            db.players.push(newPlayer);
        }

        fs.writeFile(DATABASE_PATH, JSON.stringify(db, null, 2), err => {
            if (err) return res.status(500).send('Error writing to database.');
            res.status(200).send('Giocatore aggiunto o aggiornato con successo!');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
