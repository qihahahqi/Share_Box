// WebSocket实时更新
const Socket = {
    socket: null,
    connected: false,

    init() {
        this.statusEl = document.getElementById('connection-status');
        this.updateStatus(false);

        this.socket = io(window.location.origin, {
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            this.connected = true;
            console.log('WebSocket 已连接');
            this.updateStatus(true);
            Toast.success('已连接到服务器');
        });

        this.socket.on('disconnect', () => {
            this.connected = false;
            console.log('WebSocket 已断开');
            this.updateStatus(false);
            Toast.warning('连接已断开，正在尝试重连...');
        });

        this.socket.on('connect_error', () => {
            this.connected = false;
            this.updateStatus(false);
        });

        this.socket.on('data_change', (data) => {
            this.handleChange(data.type);
        });
    },

    updateStatus(isConnected) {
        if (!this.statusEl) return;
        const dot = this.statusEl.querySelector('.connection-dot');
        const text = this.statusEl.querySelector('.connection-text');
        if (isConnected) {
            dot.className = 'connection-dot connected';
            if (text) text.textContent = '已连接';
        } else {
            dot.className = 'connection-dot disconnected';
            if (text) text.textContent = '离线';
        }
    },

    handleChange(type) {
        switch (type) {
            case 'text':
                ShareModule.load();
                break;
            case 'file':
                FilesModule.load();
                break;
            case 'photo':
                PhotosModule.load();
                break;
            case 'all':
                ShareModule.load();
                FilesModule.load();
                PhotosModule.load();
                break;
        }
        App.updateStats();
    }
};
