// Toast提示组件 - 自动消失，无需点击
const Toast = {
    container: null,

    init() {
        this.container = document.getElementById('toast-container');
    },

    show(message, type = 'info', duration = 2500) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<span class="toast-icon">${this.getIcon(type)}</span><span class="toast-msg">${message}</span>`;
        this.container.appendChild(toast);

        // 动画进入
        requestAnimationFrame(() => toast.classList.add('toast-show'));

        // 自动消失
        setTimeout(() => {
            toast.classList.remove('toast-show');
            toast.classList.add('toast-hide');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'error', 3500); },
    info(msg) { this.show(msg, 'info'); },
    warning(msg) { this.show(msg, 'warning'); },

    getIcon(type) {
        switch(type) {
            case 'success': return Icons.toastCheck;
            case 'error': return Icons.toastX;
            case 'warning': return Icons.toastWarn;
            default: return Icons.toastInfo;
        }
    }
};

// 确认对话框 - 替代confirm
const Confirm = {
    modal: null,
    messageEl: null,
    okBtn: null,
    cancelBtn: null,
    resolve: null,

    init() {
        this.modal = document.getElementById('confirm-modal');
        this.messageEl = document.getElementById('confirm-message');
        this.okBtn = document.getElementById('confirm-ok');
        this.cancelBtn = document.getElementById('confirm-cancel');

        this.okBtn.addEventListener('click', () => this.close(true));
        this.cancelBtn.addEventListener('click', () => this.close(false));
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close(false);
        });
    },

    show(message) {
        this.messageEl.textContent = message;
        this.modal.classList.remove('hidden');
        return new Promise(resolve => { this.resolve = resolve; });
    },

    close(result) {
        this.modal.classList.add('hidden');
        if (this.resolve) this.resolve(result);
        this.resolve = null;
    }
};