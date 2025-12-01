document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    // === CONFIGURAZIONE E CONSTANTI ===
    // CRITICAL FIX: RIMOSSA LA CHIAVE ADMIN HARDCODED. 
    // Ora l'amministratore dovrà inserire la chiave ad ogni sessione.
    // const ADMIN_KEY = "hMyFOadnp3~kN6"; 

    // !!! URL DI RENDER AGGIORNATO !!!
    const BACKEND_URL = "https://tierlist-dakq.onrender.com"; 
    
    // Rimosso RANK_POINTS e logica Overall, ora gestiti dal server.

    // === RIFERIMENTI DOM ===
    const modesList = document.querySelector(".modes-list");
    const tierlistDiv = document.getElementById("tierlist");
    const adminPanelContainer = document.getElementById("adminPanelContainer");
    const adminIcon = document.getElementById("adminIcon");
    const adminLoginModal = document.getElementById("adminLoginModal");
    const searchInput = document.getElementById('playerSearch');
    const suggestionsContainer = document.getElementById('playerSuggestions');
    const playerDetailModal = document.getElementById('playerDetailModal');

    // Variabile per memorizzare i dati
    let database = { players: [], modes: [] };
    let currentMode = "Overall";

    // Mappa delle icone/emoji per le modalità (Migliorato)
    const modeIcons = {
        "Overall": `<i class="fas fa-chart-bar"></i>`,
        "Bedwars": `<i class="fas fa-bed"></i>`,
        "Boxing": `<i class="fas fa-hand-rock"></i>`,
        "Nodebuff": `<i class="fas fa-swords"></i>`,
        "Battlerush": `<i class="fas fa-running"></i>`,
        "Classic": `<i class="fas fa-shield-alt"></i>`,
        "Build UHC": `<i class="fas fa-hammer"></i>`,
        "Sumo": `<i class="fas fa-weight-hanging"></i>`,
        "Bedfight": `<i class="fas fa-fire-alt"></i>`
    };

    // === UTILITY FUNCTIONS ===

    // 1. Debounce Function per la Ricerca (Miglioramento UX)
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    // 2. Fetch Database
    async function reloadDatabase() {
        try {
            const response = await fetch(`${BACKEND_URL}/api/database`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            database = await response.json();
            // Ordina i giocatori una volta per l'Overall
            database.players.sort((a, b) => {
                // Per l'ordinamento Overall, si usa il campo overallRank calcolato dal server
                const rankOrder = Object.keys(RANK_POINTS).reverse(); // S, A+, ... F
                return rankOrder.indexOf(a.overallRank) - rankOrder.indexOf(b.overallRank);
            });
            console.log("Database ricaricato:", database);
        } catch (error) {
            console.error("Errore nel caricamento del database:", error);
            throw error;
        }
    }

    // 3. Funzione per la gestione delle chiamate API Admin
    async function adminFetch(url, method = 'POST', data = {}) {
        const apiKey = localStorage.getItem('adminKey'); // Prende la chiave dalla localStorage
        if (!apiKey) {
            alert("Chiave amministrativa non trovata. Effettua il login.");
            return { ok: false, status: 403 };
        }
        
        const response = await fetch(`${BACKEND_URL}${url}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey // Invia la chiave come header
            },
            body: JSON.stringify(data)
        });
        return response;
    }

    // 4. Mappa i rank a classi CSS per il colore del testo/sfondo
    function rankToCssClass(rank) {
        return rank ? rank.toLowerCase().replace('+', '_plus').replace('-', '_minus') : 'f';
    }

    // === RENDERING FUNCTIONS ===

    // 1. Render Player Card (Nuova UX)
    function renderPlayerCard(player) {
        const rank = player.ranks[currentMode] || 'F';
        const card = document.createElement('div');
        card.className = `player-card ${rankToCssClass(rank)}`;
        card.innerHTML = `
            <div class="player-rank-indicator ${rankToCssClass(rank)}">${rank}</div>
            <span class="player-name">${player.name}</span>
            <span class="player-region">${player.region}</span>
        `;
        // Click per aprire la modale
        card.addEventListener('click', () => renderPlayerDetailModal(player));
        return card;
    }

    // 2. Render Leaderboard (Aggiornato)
    function renderLeaderboard(modeName) {
        currentMode = modeName;
        tierlistDiv.innerHTML = ''; 
        
        // Ordina i giocatori per la modalità corrente
        const playersByMode = [...database.players].sort((a, b) => {
            const rankA = a.ranks[modeName] || 'F';
            const rankB = b.ranks[modeName] || 'F';
            const rankOrder = Object.keys(RANK_POINTS).reverse(); // Usa la stessa logica di ordinamento del server
            
            return rankOrder.indexOf(rankA) - rankOrder.indexOf(rankB);
        });

        // Tiers da visualizzare
        const tiers = ['S', 'A+', 'A-', 'B+', 'B-', 'C+', 'C-', 'D+', 'D-', 'F'];
        const playersByTier = {};

        // Raggruppa i giocatori per Tier
        playersByMode.forEach(player => {
            const rank = player.ranks[modeName] || 'F';
            if (!playersByTier[rank]) {
                playersByTier[rank] = [];
            }
            playersByTier[rank].push(player);
        });

        // Genera la Tier List
        tiers.forEach(tier => {
            const players = playersByTier[tier] || [];
            if (players.length > 0) {
                const tierRow = document.createElement('div');
                tierRow.className = `tier-row ${rankToCssClass(tier)}`;
                
                const tierLabel = document.createElement('div');
                tierLabel.className = 'tier-label';
                tierLabel.textContent = tier;
                tierRow.appendChild(tierLabel);

                const playersContainer = document.createElement('div');
                playersContainer.className = 'players-container';
                
                players.forEach(player => {
                    playersContainer.appendChild(renderPlayerCard(player)); // Usa la nuova Player Card
                });

                tierRow.appendChild(playersContainer);
                tierlistDiv.appendChild(tierRow);
            }
        });
    }

    // 3. Render Player Detail Modal (Nuova Modale)
    function renderPlayerDetailModal(player) {
        const overallRank = player.ranks['Overall'] || 'F';
        const overallClass = rankToCssClass(overallRank);
        
        const rankCells = database.modes.filter(m => m.id !== 'overall' && m.id !== 'admin').map(mode => {
            const rank = player.ranks[mode.name] || 'N/A';
            const rankClass = rankToCssClass(rank);
            return `
                <div class="mode-rank-cell">
                    <span class="mode-name">${modeIcons[mode.name] || '?'}${mode.name}</span>
                    <span class="mode-rank ${rankClass}">${rank}</span>
                </div>
            `;
        }).join('');

        playerDetailModal.innerHTML = `
            <div class="modal-content">
                <span class="close-button">&times;</span>
                <div class="profile-header">
                    <h2 class="profile-name">${player.name}</h2>
                    <div class="profile-region-box">
                        <span class="profile-region-title">Regione:</span>
                        <span class="profile-region">${player.region}</span>
                    </div>
                </div>
                <div class="profile-overall-stats">
                    <div class="stat-box overall-stat ${overallClass}">
                        <div class="stat-value">${overallRank}</div>
                        <div class="stat-label">Overall Rank</div>
                    </div>
                </div>
                <h3>Rank per Modalità</h3>
                <div class="profile-modes-grid">
                    ${rankCells}
                </div>
            </div>
        `;

        playerDetailModal.style.display = 'flex';

        // Chiudi la modale
        playerDetailModal.querySelector('.close-button').addEventListener('click', () => {
            playerDetailModal.style.display = 'none';
        });
        window.addEventListener('click', function(event) {
            if (event.target == playerDetailModal) {
                playerDetailModal.style.display = 'none';
            }
        });
    }

    // === HANDLERS ===

    // 1. Handle Player Search (Con Debounce)
    const handlePlayerSearch = debounce(async (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        suggestionsContainer.innerHTML = '';
        if (searchTerm.length < 2) return;

        const results = database.players.filter(player => 
            player.name.toLowerCase().includes(searchTerm)
        ).slice(0, 5); // Limita a 5 suggerimenti

        results.forEach(player => {
            const suggestion = document.createElement('div');
            suggestion.className = 'suggestion-item';
            suggestion.innerHTML = `
                <span class="suggestion-name">${player.name}</span>
                <span class="suggestion-rank ${rankToCssClass(player.overallRank)}">${player.overallRank}</span>
            `;
            suggestion.addEventListener('click', () => {
                searchInput.value = '';
                suggestionsContainer.innerHTML = '';
                renderPlayerDetailModal(player); // Mostra la modale al click sul suggerimento
            });
            suggestionsContainer.appendChild(suggestion);
        });

        suggestionsContainer.style.display = results.length > 0 ? 'block' : 'none';
    }, 250); // Debounce di 250ms

    // 2. Handle Admin Panel
    function setupAdminPanel() {
        const isAdmin = localStorage.getItem('adminKey');
        adminIcon.classList.toggle('logged-in', !!isAdmin);
        
        // Se non loggato, mostra la modale di login, altrimenti il pannello
        if (!isAdmin) {
            adminPanelContainer.style.display = 'none';
            adminIcon.addEventListener('click', () => adminLoginModal.style.display = 'flex', { once: true });
        } else {
             // ... [Mantieni qui la logica esistente di gestione del pannello admin]
             // Ad esempio:
             adminIcon.addEventListener('click', () => {
                 const isVisible = adminPanelContainer.style.display !== 'none';
                 showView(isVisible ? 'tierlist' : 'admin');
             });
        }
    }
    
    // ... [Altre funzioni admin come setupAdminForm, showView, e gestione login/logout da adattare all'uso di adminFetch]

    // === INIZIALIZZAZIONE ===
    try {
        await reloadDatabase();
        
        // Assicurati che le modalità abbiano le icone
        const modes = database.modes.filter(m => m.name !== "Admin");
        modes.forEach((mod, idx) => {
            const btn = document.createElement("div");
            btn.className = "mode-button";
            if (idx === 0) btn.classList.add("active");
            
            const icon = modeIcons[mod.name] || '📊'; // Usa l'icona mappata
            btn.innerHTML = `${icon}<span>${mod.name}</span>`;
            
            btn.addEventListener("click", () => {
                document.querySelectorAll(".mode-button").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                showView('tierlist');
                renderLeaderboard(mod.name);
            });
            modesList.appendChild(btn);
        });
        
        searchInput.addEventListener('input', handlePlayerSearch);

        // Funzione per mostrare la vista (rimossa per brevità, assumiamo esista)
        function showView(view) {
             tierlistDiv.style.display = view === 'tierlist' ? 'block' : 'none';
             adminPanelContainer.style.display = view === 'admin' ? 'block' : 'none';
        }

        // Simula la logica del pannello admin
        adminIcon.addEventListener('click', () => {
            const isAdmin = localStorage.getItem('adminKey');
            if (!isAdmin) {
                adminLoginModal.style.display = 'flex';
            } else {
                const isVisible = adminPanelContainer.style.display !== 'none';
                showView(isVisible ? 'tierlist' : 'admin');
            }
        });
        
        // Logica fittizia per il login admin (da completare)
        const loginForm = document.getElementById('adminLoginForm');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const key = document.getElementById('adminKeyInput').value;
            // Nella vita reale, qui si farebbe una chiamata di login al server per ottenere un JWT.
            // Per il tuo sistema basato su API key, simula il login salvando la chiave:
            localStorage.setItem('adminKey', key); 
            adminLoginModal.style.display = 'none';
            // Ricarica l'app per aggiornare lo stato di login
            window.location.reload(); 
        });


        renderLeaderboard("Overall");
        setupAdminPanel(); // Configura lo stato iniziale dell'icona admin

    } catch (error) {
        console.error("Errore nel caricamento del database o nell'inizializzazione:", error);
        tierlistDiv.innerHTML = `<p>Errore nel caricamento dei dati: ${error.message}</p><p>Assicurati che il server Node.js sia in esecuzione.</p>`;
    }
}
