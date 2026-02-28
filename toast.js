/* --- TOAST SYSTEM --- */
const Toast = {
    init() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 12px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    },

    show(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toast-container');
        if (!container) this.init();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icon = type === 'success' ? 'check_circle' :
            type === 'error' ? 'error' :
                type === 'warning' ? 'warning' : 'info';

        toast.innerHTML = `
            <span class="material-symbols-outlined">${icon}</span>
            <div class="toast-content">${message}</div>
        `;

        const style = `
            background: var(--surface-4);
            color: var(--text-1);
            padding: 12px 20px;
            border-radius: 12px;
            box-shadow: var(--elev-3);
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 280px;
            max-width: 400px;
            border-left: 4px solid var(--primary);
            pointer-events: auto;
            animation: toast-in 0.3s cubic-bezier(0.2, 0, 0, 1) forwards;
            font-size: 14px;
            font-weight: 500;
        `;

        if (type === 'success') toast.style.borderLeftColor = 'var(--tertiary)';
        if (type === 'error') toast.style.borderLeftColor = 'var(--error)';
        if (type === 'warning') toast.style.borderLeftColor = 'var(--warning)';

        toast.style.cssText += style;
        document.getElementById('toast-container').appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toast-out 0.3s cubic-bezier(0.2, 0, 0, 1) forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    success(m) { this.show(m, 'success'); },
    error(m) { this.show(m, 'error'); },
    warn(m) { this.show(m, 'warning'); },
    info(m) { this.show(m, 'info'); }
};

// Add Toast animations to CSS
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes toast-in {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes toast-out {
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(styleSheet);
