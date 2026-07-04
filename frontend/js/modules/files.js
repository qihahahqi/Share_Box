// 文件模块
const FilesModule = {
    lastData: null,

    init() {
        this.dropZone = document.getElementById('files-drop-zone');
        this.input = document.getElementById('files-input');
        this.listEl = document.getElementById('file-list');

        this.dropZone.addEventListener('click', () => this.input.click());
        this.input.addEventListener('change', () => this.uploadFiles(this.input.files));

        // 拖拽
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('drag-over');
        });
        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('drag-over');
        });
        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('drag-over');
            this.uploadFiles(e.dataTransfer.files);
        });

        this.load();
    },

    async uploadFiles(files) {
        if (!files.length) return;
        Toast.info(`正在上传 ${files.length} 个文件...`);
        let successCount = 0;
        for (const file of files) {
            const res = await API.files.upload(file);
            if (res.success) {
                successCount++;
            } else {
                Toast.error(`${file.name} 上传失败`);
            }
        }
        if (successCount) {
            Toast.success(`成功上传 ${successCount} 个文件`);
        }
        this.input.value = '';
        this.load();
        App.updateStats();
    },

    async load() {
        const res = await API.files.list();
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
            this.listEl.innerHTML = '<div class="empty-state"><span class="empty-icon">' + Icons.folder + '</span><p>暂无文件</p></div>';
            return;
        }

        this.listEl.innerHTML = `<div class="card-list">${items.map(item => `
            <div class="card">
                <div class="card-content">
                    <span class="file-icon">${Icons.get(this.getFileIcon(item.mime_type))}</span>
                    <div class="card-title-wrap">
                        <span class="card-title">${this.escapeHtml(item.original_name)}</span>
                        <div class="card-meta">${this.formatSize(item.size)} · ${this.formatTime(item.created_at)} · 下载 ${item.download_count} 次</div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-primary btn-small" onclick="FilesModule.download('${item.id}')">下载</button>
                    <button class="btn-icon btn-small" onclick="FilesModule.delete('${item.id}')">${Icons.trash}</button>
                </div>
            </div>
        `).join('')}</div>`;
    },

    download(id) {
        const url = API.files.download(id);
        window.open(url, '_blank');
    },

    async delete(id) {
        const confirmed = await Confirm.show('确认删除此文件？');
        if (!confirmed) return;
        const res = await API.files.delete(id);
        if (res.success) {
            Toast.success('已删除');
            this.load();
            App.updateStats();
        } else {
            Toast.error(res.message);
        }
    },

    getFileIcon(mime) {
        if (mime.startsWith('image/')) return 'image';
        if (mime.startsWith('video/')) return 'video';
        if (mime.startsWith('audio/')) return 'music';
        if (mime.includes('pdf')) return 'file';
        if (mime.includes('zip') || mime.includes('rar') || mime.includes('archive')) return 'box';
        if (mime.includes('word') || mime.includes('document')) return 'fileText';
        if (mime.includes('excel') || mime.includes('spreadsheet')) return 'barChart';
        return 'folder';
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