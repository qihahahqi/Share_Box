// 主应用逻辑
const App = {
    searchDebounceTimer: null,
    searchDebounceMs: 500,

    init() {
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.searchModal = document.getElementById('search-modal');
        this.statsEl = document.getElementById('stats-text');
        this.statsSpinner = document.getElementById('stats-spinner');

        // 初始化WebSocket、Toast和Confirm
        Socket.init();
        Toast.init();
        Confirm.init();

        // 搜索 - 点击按钮直接搜索
        this.searchBtn.addEventListener('click', () => this.search());

        // 搜索 - 输入框使用防抖
        this.searchInput.addEventListener('input', () => {
            this.debouncedSearch();
        });
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                // Enter键立即搜索（取消防抖）
                clearTimeout(this.searchDebounceTimer);
                this.search();
            }
        });

        // 搜索模态框关闭
        this.searchModal.querySelector('.modal-close').addEventListener('click', () => {
            this.searchModal.classList.add('hidden');
        });
        this.searchModal.addEventListener('click', (e) => {
            if (e.target === this.searchModal) this.searchModal.classList.add('hidden');
        });

        // 初始化各模块
        ShareModule.init();
        FilesModule.init();
        PhotosModule.init();
        CleanupModule.init();

        // 加载统计
        this.updateStats();
    },

    debouncedSearch() {
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(() => {
            this.search();
        }, this.searchDebounceMs);
    },

    async search() {
        const keyword = this.searchInput.value.trim();
        if (!keyword) return;

        // 显示搜索loading状态
        this.searchBtn.disabled = true;
        this.searchBtn.textContent = '搜索中...';

        try {
            const res = await API.search(keyword);
            if (res.success) {
                this.renderSearchResults(res.data);
            } else {
                Toast.warning(res.message || '搜索失败');
            }
        } catch (err) {
            console.error('搜索出错:', err);
            Toast.error('网络错误，搜索失败，请检查连接');
        } finally {
            this.searchBtn.disabled = false;
            this.searchBtn.textContent = '搜索';
        }
    },

    renderSearchResults(data) {
        const total = data.texts.length + data.files.length + data.photos.length;
        const body = this.searchModal.querySelector('.modal-body');
        if (total === 0) {
            body.innerHTML = '<div class="empty-state"><p>未找到相关内容</p></div>';
        } else {
            body.innerHTML = `
                <p style="color: var(--text-secondary); margin-bottom: 16px;">找到 ${total} 个结果</p>
                <div class="card-list">
                    ${data.files.map(f => `
                        <div class="card">
                            <div class="card-content">
                                <span class="file-icon">${Icons.folder}</span>
                                <span class="card-title">${this.escapeHtml(f.original_name)}</span>
                            </div>
                            <button class="btn-primary btn-small" onclick="FilesModule.download('${f.id}')">下载</button>
                        </div>
                    `).join('')}
                    ${data.photos.map(p => `
                        <div class="card">
                            <div class="card-content">
                                <span class="file-icon">${Icons.image}</span>
                                <span class="card-title">${this.escapeHtml(p.original_name)}</span>
                            </div>
                            <button class="btn-primary btn-small" onclick="PhotosModule.preview('${p.id}')">查看</button>
                        </div>
                    `).join('')}
                    ${data.texts.map(t => `
                        <div class="card">
                            <div class="card-content">
                                <span class="file-icon">${Icons.fileText}</span>
                                <div class="text-content" style="max-height: 40px; flex:1;">${this.escapeHtml(t.content)}</div>
                            </div>
                            <button class="btn-primary btn-small" onclick="ShareModule.copy('${this.escapeHtml(t.content).replace(/'/g, "\\'")}')">复制</button>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        this.searchModal.classList.remove('hidden');
    },

    async updateStats() {
        this.statsSpinner.style.display = 'inline-block';
        try {
            const res = await API.stats();
            if (res.success) {
                const data = res.data;
                const size = this.formatSize(data.total_size);
                this.statsEl.textContent = `${data.files_count} 个文件 · ${data.photos_count} 张照片 · ${data.texts_count} 条文字 · 共 ${size}`;
            }
        } catch (err) {
            console.error('获取统计信息出错:', err);
            this.statsEl.textContent = '统计信息加载失败';
        } finally {
            this.statsSpinner.style.display = 'none';
        }
    },

    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
        return (bytes/1024/1024).toFixed(1) + ' MB';
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// 启动应用
document.addEventListener('DOMContentLoaded', () => App.init());
