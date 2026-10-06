// Chuleta de comandos (Cheatsheet) interactiva
class CheatsheetManager {
    constructor() {
        this.commands = [];
        this.activeFilter = 'Todos';
    }

    async init() {
        try {
            const res = await fetch('data/commands.json');
            this.commands = await res.json();
            this.renderFilters();
            this.renderList();
        } catch (e) {
            console.error('Error cargando chuleta:', e);
        }
    }

    renderFilters() {
        const categories = ['Todos', ...new Set(this.commands.map(c => c.category))];
        const container = document.getElementById('cheatsheet-filters');
        if (!container) return;
        container.innerHTML = '';

        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `cheat-filter-btn ${cat === this.activeFilter ? 'is-active' : ''}`;
            btn.textContent = cat;
            btn.onclick = () => {
                this.activeFilter = cat;
                document.querySelectorAll('.cheat-filter-btn').forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                this.renderList();
            };
            container.appendChild(btn);
        });
    }

    renderList() {
        const query = (document.getElementById('cheatsheet-search')?.value || '').toLowerCase().trim();
        const container = document.getElementById('cheatsheet-list');
        if (!container) return;
        container.innerHTML = '';

        const filtered = this.commands.filter(c => {
            const matchCat = (this.activeFilter === 'Todos' || c.category === this.activeFilter);
            const matchQuery = !query || c.cmd.toLowerCase().includes(query) || c.desc.toLowerCase().includes(query);
            return matchCat && matchQuery;
        });

        if (filtered.length === 0) {
            container.innerHTML = '<div class="cheat-empty">No se encontraron comandos</div>';
            return;
        }

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'cheat-card';
            card.innerHTML = `
                <div class="cheat-card-top">
                    <span class="cheat-cmd">${item.cmd}</span>
                    <span class="cheat-cat">${item.category}</span>
                </div>
                <p class="cheat-desc">${item.desc}</p>
                <div class="cheat-card-bottom">
                    <code class="cheat-code">$ ${item.example}</code>
                    <button class="cheat-use-btn" title="Copiar al terminal">Insertar</button>
                </div>
            `;

            card.querySelector('.cheat-use-btn').onclick = () => {
                if (window.emulator) {
                    window.emulator.serial0_send(item.example + '\n');
                }
                closeCheatsheet();
                if (window.term) window.term.focus();
            };

            container.appendChild(card);
        });
    }
}

window.cheatsheetManager = new CheatsheetManager();

function openCheatsheet() {
    document.getElementById('cheatsheet-modal').classList.add('is-open');
    if (!window.cheatsheetManager.commands.length) {
        window.cheatsheetManager.init();
    }
}

function closeCheatsheet() {
    document.getElementById('cheatsheet-modal').classList.remove('is-open');
    if (window.term) window.term.focus();
}
