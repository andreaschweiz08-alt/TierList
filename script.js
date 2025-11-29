document.addEventListener('DOMContentLoaded', init);

// CONFIGURAZIONE
const BACKEND_URL = "https://tierlist-dakq.onrender.com"; // Assicurati che questo URL sia corretto!
let database = { players: [], modes: [] };
let currentMode = "Overall";

// MAPPINGS
const rankOrder = ["S", "A+", "A-", "B+", "B-", "C+", "C-", "D+", "D-", "F"];
const modeIcons = {
    "Overall": "📊", "Bedwars": "🛏️", "Boxing": "🥊", "Nodebuff": "⚔️", 
    "Battlerush": "🏃", "Classic": "🏹", "Build UHC": "🍎", "Sumo": "🤼", "Bedfight": "🛏️"
};

// UTILS
const rankToClass = (r) => r ? r.toLowerCase().replace('+', '-plus').replace('-', '-minus') : 'f';
const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
};

async function init() {
    await loadData();
    setupUI();
    setupAdmin();
    setupSearch();
}

async function loadData() {
    try {
        const res = await fetch(`${BACKEND_URL}/api/database`);
        if (!res.ok) throw new Error("Errore backend");
        database = await res.json();
        renderTierList("Overall");
        renderModeButtons();
    } catch (e) {
        console.error(e);
        document.getElementById('tierlist').innerHTML = `<p style="text-align:center; padding:20px;">Impossibile caricare i dati. Il server potrebbe essere spento.</p>`;
    }
}

function renderModeButtons() {
    const list = document.querySelector('.modes-list');
    list.innerHTML = '';
    
    // Aggiungi Overall manualmente se non c'è, poi le altre
    const modes = database.modes || [];
    
    modes.forEach(m => {
        if (m.name === "Admin") return;
        const btn = document.createElement('div');
        btn.className = `mode-button ${m.name === currentMode ? 'active' : ''}`;
        btn.innerHTML = `${modeIcons[m.name] || '🎮'} ${m.name}`;
        btn.onclick = () => {
            document.querySelectorAll('.mode-button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTierList(m.name);
        };
        list.appendChild(btn);
    });
}

function renderTierList(mode) {
    currentMode = mode;
    const container = document.getElementById('tierlist');
    container.innerHTML = '';

    // Ordina giocatori
    const players = [...database.players];
    players.sort((a, b) => {
        const rA = rankOrder.indexOf(a.ranks[mode] || 'F');
        const rB = rankOrder.indexOf(b.ranks[mode] || 'F');
        // Se rankOrder.indexOf ritorna -1 (non trovato), mettilo in fondo
        const idxA = rA === -1 ? 99 : rA;
        const idxB = rB === -1 ? 99 : rB;
        return idxA - idxB;
    });

    // Raggruppa per tier
    rankOrder.forEach(tier => {
        const tieredPlayers = players.filter(p => (p.ranks[mode] || 'F') === tier);
        
        // Mostra la riga solo se ci sono giocatori O se è la modalità admin/overall
        if (tieredPlayers.length > 0) {
            const row = document.createElement('div');
            row.className = `tier-row ${rankToClass(tier)}`;
            
            row.innerHTML = `
                <div class="tier-label">${tier}</div>
                <div class="tier-players"></div>
            `;
            
            const pContainer = row.querySelector('.tier-players');
            tieredPlayers.forEach(p => {
                const card = document.createElement('div');
                card.className = `player-card ${rankToClass(tier)}`;
                card.innerHTML = `
                    <span class="p-rank">${tier}</span>
                    <span class="p-name">${p.name}</span>
                    <span class="p-region">${p.region}</span>
                `;
                card.onclick = () => openProfile(p);
                pContainer.appendChild(card);
            });
            
            container.appendChild(row);
        }
    });
}

function openProfile(player) {
    const modal = document.getElementById('playerDetailModal');
    const content = modal.querySelector('.modal-body');
    
    const statsHtml = database.modes
        .filter(m => m.name !== 'Admin')
        .map(m => {
            const r = player.ranks[m.name] || 'N/A';
            return `
                <div class="stat-item ${rankToClass(r)}">
                    <span class="stat-mode">${modeIcons[m.name] || ''} ${m.name}</span>
                    <span class="stat-val">${r}</span>
                </div>
            `;
        }).join('');

    content.innerHTML = `
        <div class="profile-header">
            <h2 class="profile-title">${player.name}</h2>
            <span class="profile-badge">${player.region}</span>
        </div>
        <div class="stats-grid">
            ${statsHtml}
        </div>
    `;
    modal.style.display = 'flex';
}

// === LOGICA ADMIN COMPLETA ===
function setupAdmin() {
    const icon = document.getElementById('adminIcon');
    const modal = document.getElementById('adminLoginModal');
    const panel = document.getElementById('adminPanelContainer');
    
    // Login toggle
    icon.onclick = () => {
        const key = localStorage.getItem('adminKey');
        if (key) {
            // Se già loggato, mostra/nascondi pannello
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        } else {
            modal.style.display = 'flex';
        }
    };

    // Form Login
    document.getElementById('adminLoginForm').onsubmit = (e) => {
        e.preventDefault();
        const key = document.getElementById('adminKeyInput').value;
        localStorage.setItem('adminKey', key);
        modal.style.display = 'none';
        icon.classList.add('logged-in');
        alert("Chiave salvata. Clicca di nuovo sull'icona per aprire il pannello.");
        populateAdminSelects(); // Popola i menu a tendina
    };

    // Popola i menu a tendina per l'aggiunta
    window.populateAdminSelects = () => {
        const modeSelect = document.getElementById('admMode');
        const tierSelect = document.getElementById('admTier');
        
        modeSelect.innerHTML = database.modes
            .filter(m => m.name !== 'Overall' && m.name !== 'Admin')
            .map(m => `<option value="${m.name}">${m.name}</option>`).join('');
            
        tierSelect.innerHTML = rankOrder.map(r => `<option value="${r}">${r}</option>`).join('');
    };

    // Aggiungi Giocatore
    document.getElementById('btnSavePlayer').onclick = async () => {
        const name = document.getElementById('admName').value;
        const region = document.getElementById('admRegion').value;
        const mode = document.getElementById('admMode').value;
        const tier = document.getElementById('admTier').value;
        const key = localStorage.getItem('adminKey');

        try {
            const res = await fetch(`${BACKEND_URL}/api/add-player`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': key },
                body: JSON.stringify({ name, region, mode, tier })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                loadData(); // Ricarica tabella
            } else {
                alert("Errore: " + data.error);
            }
        } catch (e) { alert("Errore connessione"); }
    };

    // Rimuovi Giocatore
    document.getElementById('btnDeletePlayer').onclick = async () => {
        const name = prompt("Inserisci il nome esatto del giocatore da eliminare:");
        if (!name) return;
        
        const key = localStorage.getItem('adminKey');
        try {
            const res = await fetch(`${BACKEND_URL}/api/remove-player`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': key },
                body: JSON.stringify({ name })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                loadData();
            } else {
                alert("Errore: " + data.error);
            }
        } catch (e) { alert("Errore connessione"); }
    };
}

// === RICERCA ===
function setupSearch() {
    const input = document.getElementById('playerSearch');
    const box = document.getElementById('playerSuggestions');
    
    input.oninput = debounce((e) => {
        const val = e.target.value.toLowerCase();
        if (val.length < 2) { box.style.display = 'none'; return; }
        
        const matches = database.players.filter(p => p.name.toLowerCase().includes(val));
        box.innerHTML = '';
        
        if (matches.length > 0) {
            box.style.display = 'block';
            matches.slice(0, 5).forEach(p => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.innerText = `${p.name} (${p.overallRank || 'N/A'})`;
                div.onclick = () => {
                    openProfile(p);
                    box.style.display = 'none';
                    input.value = '';
                };
                box.appendChild(div);
            });
        } else {
            box.style.display = 'none';
        }
    }, 300);
}

// Chiudi Modali globalmente
window.onclick = (e) => {
    if (e.target.classList.contains('modal')) e.target.style.display = 'none';
}
