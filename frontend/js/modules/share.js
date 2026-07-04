// 文字分享模块
const ShareModule = {
    lastData: null,

    init() {
        this.input = document.getElementById('text-input');
        this.listEl = document.getElementById('text-list');
        this.btn = document.getElementById('share-text-btn');

        this.btn.addEventListener('click', () => this.create());
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) this.create();
        });

        this.load();
    },

    async create() {
        const content = this.input.value.trim();
        if (!content) {
            Toast.warning('请输入内容');
            return;
        }

        const res = await API.share.create(content);
        if (res.success) {
            this.input.value = '';
            Toast.success('分享成功');
            this.load();
            App.updateStats();
        } else {
            Toast.error(res.message);
        }
    },

    async load() {
        const res = await API.share.list();
        if (res.success) {
            const data = JSON.stringify(res.data);
            if (data !== this.lastData) {
                this.lastData = data;
                this.render(res.data);
            }
        }
    },

    render(items) {
        if (!items.length) {
            this.listEl.innerHTML = '<div class="empty-state"><span class="empty-icon">' + Icons.fileText + '</span><p>暂无分享记录</p></div>';
            return;
        }

        this.listEl.innerHTML = `<div class="card-list">${items.map(item => `
            <div class="card" onclick="ShareModule.toggleExpand('${item.id}')">
                <div class="card-content">
                    <span class="file-icon">${Icons.fileText}</span>
                    <div class="card-title-wrap">
                        <div class="text-content" id="text-${item.id}">${this.escapeHtml(item.content)}</div>
                        <div class="card-meta">${this.formatTime(item.created_at)}</div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-primary btn-small" onclick="event.stopPropagation(); ShareModule.copyText('${item.id}')" title="复制全部">复制</button>
                    <button class="btn-icon btn-small" onclick="event.stopPropagation(); ShareModule.delete('${item.id}')" title="删除">${Icons.trash}</button>
                </div>
            </div>
        `).join('')}</div>`;
    },

    toggleExpand(id) {
        const el = document.getElementById(`text-${id}`);
        el.classList.toggle('expanded');
    },

    copyText(id) {
        // 使用隐藏textarea绕过VNC剪贴板编码问题
        const el = document.getElementById(`text-${id}`);
        const text = el.textContent;

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, text.length);

        try {
            document.execCommand('copy');
            Toast.success('已复制');
        } catch (e) {
            Toast.error('复制失败，请手动选中复制');
        }

        document.body.removeChild(textarea);
    },

    download(id) {
        const url = API.share.download(id);
        window.open(url, '_blank');
    },

    async delete(id) {
        const confirmed = await Confirm.show('确认删除这条记录？');
        if (!confirmed) return;
        const res = await API.share.delete(id);
        if (res.success) {
            Toast.success('已删除');
            this.load();
            App.updateStats();
        } else {
            Toast.error(res.message);
        }
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