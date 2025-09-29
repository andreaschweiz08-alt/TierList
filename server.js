const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = "hMyFOadnp3~kN6";

app.use(express.json());

// Serve i file statici dalla stessa directory in cui si trova server.js
app.use(express.static(__dirname));

// Endpoint per ottenere i dati del database
app.get('/api/database', (req, res) => {
    const databasePath = path.join(__dirname, 'database.json');
    fs.readFile(databasePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
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

    const databasePath = path.join(__dirname, 'database.json');
    fs.readFile(databasePath, 'utf8', (err, data) => {
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

            db.players[playerIndex].ranks[mode] = newTier;

            fs.writeFile(databasePath, JSON.stringify(db, null, 2), 'utf8', (err) => {
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

// Endpoint per rimuovere il tier di un giocatore
app.post('/api/remove-player-tier', (req, res) => {
    const { name, mode } = req.body;
    const apiKey = req.headers['x-api-key'];

    if (apiKey !== ADMIN_KEY) {
        return res.status(403).send('Unauthorized');
    }

    if (!name || !mode) {
        return res.status(400).send('Missing player name or mode.');
    }

    const databasePath = path.join(__dirname, 'database.json');
    fs.readFile(databasePath, 'utf8', (err, data) => {
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

            if (db.players[playerIndex].ranks[mode]) {
                delete db.players[playerIndex].ranks[mode];
            } else {
                return res.status(404).send('Tier for this mode not found.');
            }

            fs.writeFile(databasePath, JSON.stringify(db, null, 2), 'utf8', (err) => {
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

// Endpoint per aggiungere un nuovo giocatore
app.post('/api/add-player', (req, res) => {
    const { name, mode, tier, region } = req.body;
    const apiKey = req.headers['x-api-key'];

    if (apiKey !== ADMIN_KEY) {
        return res.status(403).send('Unauthorized');
    }

    const databasePath = path.join(__dirname, 'database.json');
    fs.readFile(databasePath, 'utf8', (err, data) => {
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

        fs.writeFile(databasePath, JSON.stringify(db, null, 2), err => {
            if (err) return res.status(500).send('Error writing to database.');
            res.status(200).send('Giocatore aggiunto o aggiornato con successo!');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});