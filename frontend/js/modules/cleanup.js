// 清理模块
const CleanupModule = {
    init() {
        this.btn = document.getElementById('cleanup-btn');
        this.modal = document.getElementById('cleanup-modal');
        this.infoEl = document.getElementById('cleanup-info');

        this.btn.addEventListener('click', () => this.show());
        this.modal.querySelector('.modal-close').addEventListener('click', () => this.hide());
        document.getElementById('cleanup-cancel').addEventListener('click', () => this.hide());
        document.getElementById('cleanup-confirm').addEventListener('click', () => this.execute());

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hide();
        });
    },

    async show() {
        const res = await API.cleanup.status();
        if (res.success) {
            const data = res.data;
            if (data.texts_count + data.files_count + data.photos_count === 0) {
                Toast.info('没有需要清理的过期文件');
                return;
            }

            this.infoEl.innerHTML = `
                <p style="margin-bottom: 12px;">以下文件超过30天，可以清理：</p>
                <div class="card-list">
                    ${data.items.files.map(f => `
                        <div class="card">
                            <div class="card-content">
                                <span class="file-icon">${Icons.folder}</span>
                                <span class="card-title">${this.escapeHtml(f.original_name)}</span>
                            </div>
                            <span class="card-meta">${this.formatSize(f.size)}</span>
                        </div>
                    `).join('')}
                    ${data.items.photos.map(p => `
                        <div class="card">
                            <div class="card-content">
                                <span class="file-icon">${Icons.image}</span>
                                <span class="card-title">${this.escapeHtml(p.original_name)}</span>
                            </div>
                            <span class="card-meta">${this.formatSize(p.size)}</span>
                        </div>
                    `).join('')}
                    ${data.items.texts.map(t => `
                        <div class="card">
                            <div class="card-content">
                                <span class="file-icon">${Icons.fileText}</span>
                                <span class="card-title">文字分享</span>
                            </div>
                            <span class="card-meta">${this.formatTime(t.created_at)}</span>
                        </div>
                    `).join('')}
                </div>
                <p style="margin-top: 16px; color: #6b7280; font-size: 13px;">
                    共 ${data.files_count} 个文件，${data.photos_count} 张照片，${data.texts_count} 条文字分享<br>
                    可释放 <strong>${this.formatSize(data.total_size)}</strong> 空间
                </p>
            `;
            this.modal.classList.remove('hidden');
        }
    },

    hide() {
        this.modal.classList.add('hidden');
    },

    async execute() {
        Toast.info('正在清理...');
        const res = await API.cleanup.execute();
        if (res.success) {
            const data = res.data;
            Toast.success(`清理完成：删除了 ${data.files_deleted} 个文件，${data.photos_deleted} 张照片，${data.texts_deleted} 条文字分享`);
            this.hide();
            ShareModule.load();
            FilesModule.load();
            PhotosModule.load();
            App.updateStats();
        } else {
            Toast.error(res.message);
        }
    },

    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
        return (bytes/1024/1024).toFixed(1) + ' MB';
    },

    formatTime(time) {
        const d = new Date(time);
        return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};