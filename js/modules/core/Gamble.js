import { Formatter } from './Formatter.js';

export class Gamble {
    constructor(game) {
        this.game = game; // Koppeling met hoofdgame instance[cite: 3, 26]
        this.modal = document.getElementById('gamble-modal');
        this.resultDisplay = document.getElementById('gamble-result');
        this.init();
    }

    init() {
        // Open & Sluit knoppen
        const openBtn = document.getElementById('open-gamble-btn');
        if (openBtn) {
            openBtn.addEventListener('click', () => this.openModal());
        }

        const closeBtn = document.getElementById('close-gamble-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Sluit modal bij klikken buiten het venster
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }

        // Event listeners voor gok-knoppen
        const gambleButtons = document.querySelectorAll('.gamble-btn');
        gambleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amountType = e.currentTarget.getAttribute('data-amount');
                this.play(amountType);
            });
        });
    }

    openModal() {
        if (this.modal) {
            this.modal.classList.add('show');
            this.updateResultText('Kies je inzet en beproef je geluk!');
        }
    }

    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('show');
        }
    }

    updateResultText(text) {
        if (this.resultDisplay) {
            this.resultDisplay.innerText = text;
        }
    }

    play(type) {
        let wager = 0;

        if (type === '100') {
            wager = 100;
        } else if (type === '1000') {
            wager = 1000;
        } else if (type === 'all-in') {
            wager = this.game.döner; // Inzet gelijk aan het actuele saldo[cite: 3]
        }

        // Controleer op een geldige inzet en voldoende Döner
        if (wager <= 0 || this.game.döner < wager) {
            this.updateResultText('Je hebt niet genoeg Döner voor deze inzet!');
            return;
        }

        // Inzet aftrekken van het saldo
        this.game.döner -= wager;

        // Random kansberekening
        const roll = Math.random();

        if (roll < 0.30) {
            // 30% kans: Verlies (was 50%)
            this.updateResultText(`U LOSEEE!!! ${Formatter.format(wager)} Döner lost.`);
        } else if (roll < 0.50) {
            // 20% kans: Inzet terug (van 0.30 tot 0.50)
            this.game.döner += wager;
            this.updateResultText(`QUITTE ${Formatter.format(wager)} Döner BACK!`);
        } else {
            // 50% kans: Winst (2x de inzet, van 0.50 tot 1.00 - was 30%)
            const winnings = wager * 2;
            this.game.döner += winnings;
            this.updateResultText(`JACKPOOOOOOTT!! ${Formatter.format(winnings)} Döner!`);
        }

        // Direct de hoofd-UI van de game verversen
        this.game.updateUI();
    }
}