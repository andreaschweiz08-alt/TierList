document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    // === CONFIGURAZIONE E CONSTANTI ===
    const RANK_POINTS = {
        "S": 100, "A+": 80, "A-": 70, "B+": 50, "B-": 40,
        "C+": 30, "C-": 20, "D+": 15, "D-": 10, "F": 5
    };
    const ADMIN_KEY = "hMyFOadnp3~kN6"; // La tua chiave Admin (usata dal frontend)
    
    // !!! URL DI RENDER AGGIORNATO !!!
    const BACKEND_URL = "https://tierlist-dakq.onrender.com"; 

    // === RIFERIMENTI DOM ===
    const modesList = document.querySelector(".modes-list");
    const tierlistDiv = document.getElementById("tierlist");
    const adminPanelContainer = document.getElementById("adminPanelContainer");
    const adminIcon = document.getElementById("adminIcon");
    const adminLoginModal = document.getElementById("adminLoginModal");
    const searchInput = document.getElementById('playerSearch');
    const suggestionsContainer = document.getElementById('playerSuggestions');

    // Mappa delle emoji per le modalità
    const modeEmojis = {
        "Overall": "📊",
        "Bedwars": "🛏️",
        "Boxing": "🥊",
        "Nodebuff": "⚔️",
        "Battlerush": "🏃",
        "Classic": "🗡️",
        "Build UHC": "⛏️",
        "Sumo": "🤼",
        "Bedfight": "🛏️",
    };

    let database;
    let isAdmin = false;
    let currentMode = "Overall"; 

    // === FUNZIONI DI UTILITÀ ===
    function getCombatTitle(points) {
        if (points >= 700) return "Combat Grandmaster";
        if (points >= 600) return "Combat Master";
        if (points >= 450) return "Combat Ace";
        if (points >= 350) return "Combat Specialist";
        if (points >= 250) return "Combat Cadet";
        if (points >= 150) return "Combat Novice";
        return "Rookie";
    }

    function showView(viewId) {
        document.getElementById('tierlist').style.display = 'none';
        document.getElementById('adminPanelContainer').style.display = 'none';
        
        document.getElementById(viewId).style.display = 'block';
    }

    // === FUNZIONI ADMIN (MODIFICATE PER USARE BACKEND_URL) ===
    function renderAdminView() {
        showView('adminPanelContainer');
        adminPanelContainer.innerHTML = '';
        renderAdminControls();
        renderAdminEditControls(); 
    }

    function renderAdminControls() {
        adminPanelContainer.innerHTML += `
            <div class="admin-add-section">
                <h3>Aggiungi Giocatore</h3>
                <input type="text" id="playerNameInput" placeholder="Nickname Giocatore" required>
                <select id="playerModeSelect"></select>
                <select id="playerTierSelect"></select>
                <input type="text" id="playerRegionInput" placeholder="Regione" required>
                <button id="addPlayerButton">Aggiungi Giocatore</button>
                <p class="admin-warning">Attualmente connesso al backend: <b>${BACKEND_URL}</b></p>
            </div>
        `;
        
        populateAddPlayerForm();
        document.getElementById('addPlayerButton').addEventListener('click', () => addPlayer());
    }

    function renderAdminEditControls() {
        const adminSection = document.createElement('div');
        adminSection.className = "admin-edit-section";
        adminSection.innerHTML = `
            <h3>Modifica o Rimuovi Giocatore</h3>
            <input type="text" id="editPlayerSearch" placeholder="Cerca Giocatore">
            <div id="editPlayerResults" class="edit-results"></div>
        `;
        adminPanelContainer.appendChild(adminSection);

        document.getElementById('editPlayerSearch').addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const resultsContainer = document.getElementById('editPlayerResults');
            resultsContainer.innerHTML = '';
            
            if (query.length > 0) {
                const matches = database.players.filter(p => p.name.toLowerCase().includes(query));
                if (matches.length > 0) {
                    matches.forEach(player => {
                        const resultItem = document.createElement('div');
                        resultItem.className = 'edit-result-item';
                        resultItem.innerHTML = `
                            <span>${player.name}</span>
                        `;
                        resultItem.addEventListener('click', () => displayPlayerTiers(player));
                        resultsContainer.appendChild(resultItem);
                    });
                } else {
                    resultsContainer.innerHTML = '<span>Nessun giocatore trovato.</span>';
                }
            }
        });
    }

    function displayPlayerTiers(player) {
        const resultsContainer = document.getElementById('editPlayerResults');
        resultsContainer.innerHTML = '';
        
        const playerInfoDiv = document.createElement('div');
        playerInfoDiv.className = 'player-edit-info';
        playerInfoDiv.innerHTML = `
            <h4>Modifica i tier di ${player.name}</h4>
        `;

        const modesToEdit = database.modes.filter(m => m.name !== "Overall" && m.name !== "Admin");
        
        modesToEdit.forEach(mode => {
            const currentTier = player.ranks[mode.name] || 'N/A';
            const modeEditDiv = document.createElement('div');
            modeEditDiv.className = 'mode-edit-item';
            
            const tierSelect = document.createElement('select');
            tierSelect.id = `edit-tier-${mode.name}`;
            tierSelect.innerHTML = `<option value="">-- Seleziona Tier --</option>`;
            const tiers = ["S", "A+", "A-", "B+", "B-", "C+", "C-", "D+", "D-", "F"];
            tiers.forEach(t => {
                const option = document.createElement('option');
                option.value = t;
                option.textContent = t;
                if (t === currentTier) {
                    option.selected = true;
                }
                tierSelect.appendChild(option);
            });
            
            const updateButton = document.createElement('button');
            updateButton.textContent = 'Aggiorna';
            updateButton.addEventListener('click', () => updatePlayerTier(player.name, mode.name, tierSelect.value));

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Rimuovi Tier';
            removeButton.className = 'remove-tier-button';
            removeButton.addEventListener('click', () => removePlayerTier(player.name, mode.name));

            modeEditDiv.innerHTML = `<label>${mode.name} (attuale: ${currentTier}): </label>`;
            modeEditDiv.appendChild(tierSelect);
            modeEditDiv.appendChild(updateButton);
            modeEditDiv.appendChild(removeButton);
            playerInfoDiv.appendChild(modeEditDiv);
        });

        resultsContainer.appendChild(playerInfoDiv);
    }
    
    async function updatePlayerTier(playerName, modeName, newTier) {
        if (!newTier) {
            alert("Seleziona un tier valido.");
            return;
        }
        const data = { name: playerName, mode: modeName, newTier: newTier };
        try {
            const response = await fetch(`${BACKEND_URL}/api/update-player-tier`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': ADMIN_KEY },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                alert(`Tier di ${playerName} in ${modeName} aggiornato con successo!`);
                await reloadDatabase();
                const player = database.players.find(p => p.name === playerName);
                if (player) {
                    displayPlayerTiers(player);
                }
                renderLeaderboard(currentMode); 
            } else {
                const errorText = await response.text();
                alert("Errore nell'aggiornamento del tier: " + errorText);
            }
        } catch (error) {
            console.error(error);
            alert("Errore di connessione al server.");
        }
    }

    async function removePlayerTier(playerName, modeName) {
        if (!confirm(`Sei sicuro di voler rimuovere il tier di ${playerName} in ${modeName}?`)) {
            return;
        }
        const data = { name: playerName, mode: modeName };
        try {
            const response = await fetch(`${BACKEND_URL}/api/remove-player-tier`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': ADMIN_KEY },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                alert(`Tier di ${playerName} in ${modeName} rimosso con successo!`);
                await reloadDatabase();
                const player = database.players.find(p => p.name === playerName);
                if (player) {
                    displayPlayerTiers(player);
                }
                renderLeaderboard(currentMode);
            } else {
                const errorText = await response.text();
                alert("Errore nella rimozione del tier: " + errorText);
            }
        } catch (error) {
            console.error(error);
            alert("Errore di connessione al server.");
        }
    }

    function populateAddPlayerForm() {
        const modeSelect = document.getElementById('playerModeSelect');
        const tierSelect = document.getElementById('playerTierSelect');
        
        const modes = database.modes.filter(m => m.name !== "Overall" && m.name !== "Admin");
        modeSelect.innerHTML = `<option value="">Seleziona Modalità</option>` + modes.map(m => `<option value="${m.name}">${m.name}</option>`).join('');

        const tiers = ["S", "A+", "A-", "B+", "B-", "C+", "C-", "D+", "D-", "F"];
        tierSelect.innerHTML = `<option value="">Seleziona Tier</option>` + tiers.map(t => `<option value="${t}">${t}</option>`).join('');
    }

    async function addPlayer() {
        const name = document.getElementById('playerNameInput').value.trim();
        const mode = document.getElementById('playerModeSelect').value;
        const tier = document.getElementById('playerTierSelect').value;
        const region = document.getElementById('playerRegionInput').value.trim();

        if (!name || !mode || !tier || !region) {
            alert("Completa tutti i campi per aggiungere un giocatore.");
            return;
        }

        const data = { name, mode, tier, region };
        
        try {
            const response = await fetch(`${BACKEND_URL}/api/add-player`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': ADMIN_KEY },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                alert("Giocatore aggiunto con successo!");
                await reloadDatabase();
                renderAdminView();
            } else {
                const errorText = await response.text();
                alert("Errore nell'aggiunta del giocatore: " + errorText);
            }
        } catch (error) {
            console.error(error);
            alert("Errore di connessione al server.");
        }
    }

    /**
     * FUNZIONE AGGIORNATA per caricare il database dal backend di Render
     */
    async function reloadDatabase() {
        try {
            const response = await fetch(`${BACKEND_URL}/api/database`);
            if (!response.ok) throw new Error('Network response was not ok');
            database = await response.json();
        } catch (error) {
            console.error("Errore nel caricamento del database:", error);
            throw new Error('Impossibile connettersi al backend API per i dati.');
        }
    }

    // === GESTIONE ADMIN ICONA/LOGIN ===
    function handleAdminLogin() {
        const key = document.getElementById('adminKeyInput').value;
        if (key === ADMIN_KEY) {
            isAdmin = true;
            adminLoginModal.style.display = 'none';
            renderAdminButton(); 
            alert("Accesso Admin riuscito!");
        } else {
            alert("Chiave errata!");
            document.getElementById('adminKeyInput').value = '';
        }
    }

    function renderAdminButton() {
        const existingAdminButton = document.getElementById('adminModeButton');
        if (existingAdminButton) {
            existingAdminButton.remove();
        }

        const adminBtn = document.createElement("div");
        adminBtn.id = "adminModeButton";
        adminBtn.className = "mode-button";
        adminBtn.innerHTML = `<span>Admin</span>`;
        modesList.appendChild(adminBtn);

        adminBtn.addEventListener("click", () => {
            document.querySelectorAll(".mode-button").forEach(b => b.classList.remove("active"));
            adminBtn.classList.add("active");
            renderAdminView();
        });
    }

    adminIcon.addEventListener("click", () => {
        if (isAdmin) {
            isAdmin = false;
            const adminBtn = document.getElementById("adminModeButton");
            if (adminBtn) adminBtn.remove();
            
            showView('tierlist');
            const overallButton = document.querySelector('.mode-button');
            if(overallButton) overallButton.classList.add('active');
            renderLeaderboard(currentMode);
            alert("Sei stato disconnesso dal pannello Admin.");
        } else {
            adminLoginModal.innerHTML = `
                <div class="modal-content">
                    <span class="modal-close-button" id="closeModal">&times;</span>
                    <h3>Accesso Admin</h3>
                    <input type="password" id="adminKeyInput" placeholder="Inserisci la chiave admin" required>
                    <button id="adminLoginButton">Accedi</button>
                </div>
            `;
            adminLoginModal.style.display = 'flex';
            document.getElementById('closeModal').addEventListener('click', () => {
                adminLoginModal.style.display = 'none';
            });
            document.getElementById('adminLoginButton').addEventListener('click', () => handleAdminLogin());
        }
    });

    // === FUNZIONE DI RICERCA ===
    function handlePlayerSearch() {
        const query = searchInput.value.toLowerCase();
        suggestionsContainer.innerHTML = '';

        if (query.length > 0) {
            const matches = database.players.filter(p => p.name.toLowerCase().includes(query));
            if (matches.length > 0) {
                suggestionsContainer.style.display = 'block';
                matches.slice(0, 5).forEach(player => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.className = 'suggestion-item';
                    suggestionItem.textContent = player.name;
                    suggestionItem.addEventListener('click', () => {
                        searchInput.value = player.name;
                        suggestionsContainer.style.display = 'none';
                        filterLeaderboardByName(player.name);
                    });
                    suggestionsContainer.appendChild(suggestionItem);
                });
            } else {
                suggestionsContainer.style.display = 'none';
            }
        } else {
            suggestionsContainer.style.display = 'none';
            filterLeaderboardByName(''); 
        }
    }
    
    function filterLeaderboardByName(nameQuery) {
        const rows = document.querySelectorAll('.leaderboard-row, .player-item');
        rows.forEach(row => {
            const playerName = row.getAttribute('data-player-name').toLowerCase();
            const shouldShow = playerName.includes(nameQuery.toLowerCase()) || nameQuery === '';
            
            if (shouldShow) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
        
        if (nameQuery === '') {
            renderLeaderboard(currentMode); 
        }
    }

    // === FUNZIONE DI RENDERING LEADERBOARD (NON MODIFICATA) ===
    function renderLeaderboard(modeName) {
        currentMode = modeName;
        tierlistDiv.innerHTML = "";
        const players = database.players;
        const modesData = database.modes.reduce((acc, mode) => {
            acc[mode.name] = mode;
            return acc;
        }, {});

        if (modeName === "Overall") {
            const sortedPlayers = players
                .map(player => ({
                    ...player,
                    totalPoints: Object.values(player.ranks).reduce((sum, currentRank) => sum + (RANK_POINTS[currentRank] || 0), 0)
                }))
                .sort((a, b) => b.totalPoints - a.totalPoints);

            const table = document.createElement("div");
            table.className = "leaderboard-table";
            table.innerHTML = sortedPlayers.map((player, index) => {
                const rankBadgeClass = index < 3 ? `top-${index + 1}` : '';
                const combatTitle = getCombatTitle(player.totalPoints);
                
                const allModesBadges = database.modes.filter(m => m.name !== "Overall" && m.name !== "Admin").map(mode => {
                    const rank = player.ranks[mode.name] || '0';
                    const emoji = modeEmojis[mode.name] || '';
                    return `
                        <div class="mode-badge">
                            <span class="emoji">${emoji}</span>
                            <span>${rank}</span>
                        </div>
                    `;
                }).join('');

                return `
                    <div class="leaderboard-row" data-player-name="${player.name}">
                        <div class="rank-and-player">
                            <div class="rank-badge ${rankBadgeClass}">${index + 1}.</div>
                            <div class="player-info-overall">
                                <img src="https://minotar.net/avatar/${player.name}/64" alt="${player.name}" class="player-avatar-small">
                                <div class="player-info-details">
                                    <span class="player-name">${player.name}</span>
                                    <div class="overall-rank-badge">
                                        <span>${combatTitle} (${player.totalPoints} punti)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="player-modes-and-region">
                            <span class="region-overall region-${player.region.toLowerCase()}">${player.region}</span>
                            <div class="player-modes-badges">
                                ${allModesBadges}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            tierlistDiv.appendChild(table);

        } else {
            const tiersByRank = ["S", "A", "B", "C", "D", "F"];
            const tiersContainer = document.createElement("div");
            tiersContainer.className = "tiers-container";
            
            const modeKey = Object.keys(players[0].ranks).find(key => key.toLowerCase() === modeName.toLowerCase());
            const filteredPlayers = players.filter(p => p.ranks[modeKey]);
            const sortedPlayersByTier = filteredPlayers.sort((a, b) => RANK_POINTS[b.ranks[modeKey]] - RANK_POINTS[a.ranks[modeKey]]);

            tiersByRank.forEach(tier => {
                const tierPlayers = sortedPlayersByTier.filter(p => p.ranks[modeKey].startsWith(tier));
                const tierColumn = document.createElement("div");
                tierColumn.className = `tier-column tier-column-${tier.toLowerCase()}`;
                tierColumn.innerHTML = `
                    <div class="tier-title tier-${tier}"><span>Tier ${tier}</span></div>
                    <div class="tier-players">
                        ${tierPlayers.map(player => {
                            const rankValue = player.ranks[modeKey];
                            const arrowClass = rankValue.includes('+') ? 'arrow-plus' : rankValue.includes('-') ? 'arrow-minus' : 'arrow-normal';
                            return `
                                <div class="player-item region-${player.region.toLowerCase()}" data-player-name="${player.name}">
                                    <div class="player-info">
                                        <img src="https://minotar.net/avatar/${player.name}/32" alt="${player.name}" class="player-avatar-small">
                                        <span class="player-name">${player.name}</span>
                                    </div>
                                    <div class="rank-modifier-arrow ${arrowClass}"></div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
                tiersContainer.appendChild(tierColumn);
            });
            tierlistDiv.appendChild(tiersContainer);
        }
    }

    // === INIZIALIZZAZIONE ===
    try {
        await reloadDatabase();
        
        // Aggiungi Bedfight alla lista delle modalità se non è presente
        if (!database.modes.find(m => m.name === "Bedfight")) {
            database.modes.push({ name: "Bedfight", players: [] });
        }

        const modes = database.modes.filter(m => m.name !== "Admin");
        modes.forEach((mod, idx) => {
            const btn = document.createElement("div");
            btn.className = "mode-button";
            if (idx === 0) btn.classList.add("active");
            btn.innerHTML = `<span>${mod.name}</span>`;
            btn.addEventListener("click", () => {
                document.querySelectorAll(".mode-button").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                showView('tierlist');
                renderLeaderboard(mod.name);
            });
            modesList.appendChild(btn);
        });
        
        searchInput.addEventListener('input', handlePlayerSearch);

        showView('tierlist');
        renderLeaderboard("Overall");

    } catch (error) {
        console.error("Errore nel caricamento del database o nell'inizializzazione:", error);
        tierlistDiv.innerHTML = `<p>Errore nel caricamento dei dati: ${error.message}</p><p>Assicurati che il tuo backend Render sia attivo e che l'URL nel file script.js sia corretto.</p>`;
    }
}