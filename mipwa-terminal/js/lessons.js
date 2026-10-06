// Manejo de lecciones interactivas para AprendeX86
class LessonManager {
    constructor() {
        this.lessons = [];
        this.currentIndex = 0;
        this.completedLessons = new Set(JSON.parse(localStorage.getItem('completed_lessons') || '[]'));
        this.currentInput = '';
    }

    async init() {
        try {
            const res = await fetch('data/lessons.json');
            this.lessons = await res.json();
            const savedIndex = parseInt(localStorage.getItem('current_lesson_index') || '0', 10);
            this.currentIndex = Math.min(Math.max(0, savedIndex), this.lessons.length - 1);
            this.renderLesson();
            this.renderLessonsList();
        } catch (e) {
            console.error('Error cargando lecciones:', e);
        }
    }

    getCurrentLesson() {
        return this.lessons[this.currentIndex];
    }

    renderLesson() {
        const lesson = this.getCurrentLesson();
        if (!lesson) return;

        // Elementos en la tarjeta de lección
        const moduleBadge = document.getElementById('lesson-module');
        const titleEl = document.getElementById('lesson-title');
        const conceptEl = document.getElementById('lesson-concept');
        const goalEl = document.getElementById('lesson-goal');
        const hintEl = document.getElementById('lesson-hint');
        const progressEl = document.getElementById('lesson-progress-count');
        const prevBtn = document.getElementById('btn-prev-lesson');
        const nextBtn = document.getElementById('btn-next-lesson');

        if (moduleBadge) moduleBadge.textContent = lesson.module;
        if (titleEl) titleEl.textContent = lesson.title;
        if (conceptEl) conceptEl.textContent = lesson.concept;
        if (goalEl) goalEl.textContent = lesson.goal;
        if (hintEl) {
            hintEl.textContent = lesson.hint;
            hintEl.style.display = 'none'; // oculto por defecto
        }

        if (progressEl) {
            progressEl.textContent = `${this.currentIndex + 1}/${this.lessons.length}`;
        }

        if (prevBtn) prevBtn.disabled = (this.currentIndex === 0);
        if (nextBtn) nextBtn.disabled = (this.currentIndex === this.lessons.length - 1);

        // Actualizar chips contextuales en la barra de herramientas
        this.renderContextChips(lesson.chips || []);

        // Guardar progreso
        localStorage.setItem('current_lesson_index', this.currentIndex);

        // Actualizar lista en panel lateral
        this.updateActiveLessonInDrawer();
    }

    renderContextChips(chips) {
        const container = document.getElementById('context-chips');
        if (!container) return;
        container.innerHTML = '';

        chips.forEach(chip => {
            const btn = document.createElement('button');
            btn.className = 'chip-btn';
            btn.textContent = chip;
            btn.onpointerdown = (e) => {
                e.preventDefault();
                this.insertToTerminal(chip);
            };
            container.appendChild(btn);
        });
    }

    insertToTerminal(text) {
        if (!window.emulator) return;
        if (text === '↵') {
            window.emulator.serial0_send('\r');
        } else {
            window.emulator.serial0_send(text);
        }
        if (window.term) window.term.focus();
    }

    pasteExpectedCommand() {
        const lesson = this.getCurrentLesson();
        if (!lesson) return;
        this.insertToTerminal(lesson.command);
    }

    toggleHint() {
        const hintEl = document.getElementById('lesson-hint');
        if (!hintEl) return;
        if (hintEl.style.display === 'none' || !hintEl.style.display) {
            hintEl.style.display = 'block';
        } else {
            hintEl.style.display = 'none';
        }
    }

    nextLesson() {
        if (this.currentIndex < this.lessons.length - 1) {
            this.currentIndex++;
            this.renderLesson();
        }
    }

    prevLesson() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.renderLesson();
        }
    }

    jumpToLesson(index) {
        if (index >= 0 && index < this.lessons.length) {
            this.currentIndex = index;
            this.renderLesson();
            // Cerrar menú en móvil
            const panel = document.getElementById('lessons-panel');
            if (panel && panel.classList.contains('is-open')) {
                panel.classList.remove('is-open');
            }
        }
    }

    onTerminalByte(char) {
        if (char === '\r' || char === '\n') {
            this.checkCommand(this.currentInput.trim());
            this.currentInput = '';
        } else if (char === '\x7f' || char === '\b') {
            this.currentInput = this.currentInput.slice(0, -1);
        } else if (char.length === 1 && char >= ' ') {
            this.currentInput += char;
        }
    }

    checkCommand(executedCmd) {
        if (!executedCmd) return;
        const lesson = this.getCurrentLesson();
        if (!lesson) return;

        const expected = lesson.command.trim().toLowerCase();
        const actual = executedCmd.toLowerCase();

        // Si coincide con el comando esperado de la lección
        if (actual === expected || actual.startsWith(expected)) {
            this.markCompleted(this.currentIndex);
        }
    }

    markCompleted(index) {
        const lesson = this.lessons[index];
        if (!lesson) return;

        if (!this.completedLessons.has(lesson.id)) {
            this.completedLessons.add(lesson.id);
            localStorage.setItem('completed_lessons', JSON.stringify(Array.from(this.completedLessons)));
            
            if (window.showToast) {
                window.showToast(`¡Excelente! Lección completada 🎉 (+20 XP)`);
            }

            // Auto-avanzar suavemente tras 1.5s
            setTimeout(() => {
                if (this.currentIndex === index && this.currentIndex < this.lessons.length - 1) {
                    this.nextLesson();
                }
            }, 1500);

            this.updateActiveLessonInDrawer();
        }
    }

    renderLessonsList() {
        const container = document.getElementById('drawer-lessons-list');
        if (!container) return;
        container.innerHTML = '';

        let currentModule = '';
        this.lessons.forEach((l, idx) => {
            if (l.module !== currentModule) {
                currentModule = l.module;
                const modTitle = document.createElement('div');
                modTitle.className = 'drawer-module-title';
                modTitle.textContent = currentModule;
                container.appendChild(modTitle);
            }

            const item = document.createElement('button');
            item.className = `drawer-lesson-item ${idx === this.currentIndex ? 'is-active' : ''}`;
            item.dataset.index = idx;
            const isDone = this.completedLessons.has(l.id);

            item.innerHTML = `
                <span class="lesson-check">${isDone ? '✅' : '○'}</span>
                <span class="lesson-item-title">${l.title}</span>
            `;

            item.onclick = () => this.jumpToLesson(idx);
            container.appendChild(item);
        });
    }

    updateActiveLessonInDrawer() {
        const items = document.querySelectorAll('.drawer-lesson-item');
        items.forEach(el => {
            const idx = parseInt(el.dataset.index, 10);
            el.classList.toggle('is-active', idx === this.currentIndex);
            const isDone = this.completedLessons.has(this.lessons[idx]?.id);
            const check = el.querySelector('.lesson-check');
            if (check) check.textContent = isDone ? '✅' : '○';
        });
    }
}

window.lessonManager = new LessonManager();
