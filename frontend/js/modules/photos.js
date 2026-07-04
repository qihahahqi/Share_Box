// 照片模块
const PhotosModule = {
    lastData: null,

    init() {
        this.dropZone = document.getElementById('photos-drop-zone');
        this.input = document.getElementById('photos-input');
        this.gridEl = document.getElementById('photo-grid');
        this.modal = document.getElementById('photo-modal');
        this.preview = document.getElementById('photo-preview');

        this.dropZone.addEventListener('click', () => this.input.click());
        this.input.addEventListener('change', () => this.uploadPhotos(this.input.files));

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
            this.uploadPhotos(e.dataTransfer.files);
        });

        // 模态框关闭
        this.modal.querySelector('.modal-close').addEventListener('click', () => {
            this.modal.classList.add('hidden');
        });
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.modal.classList.add('hidden');
        });

        this.load();
    },

    async uploadPhotos(files) {
        if (!files.length) return;
        Toast.info(`正在上传 ${files.length} 张图片...`);
        let successCount = 0;
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                Toast.warning(`${file.name} 不是图片文件`);
                continue;
            }
            const res = await API.photos.upload(file);
            if (res.success) {
                successCount++;
            } else {
                Toast.error(`${file.name} 上传失败`);
            }
        }
        if (successCount) {
            Toast.success(`成功上传 ${successCount} 张图片`);
        }
        this.input.value = '';
        this.load();
        App.updateStats();
    },

    async load() {
        const res = await API.photos.list();
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
            this.gridEl.innerHTML = '<div class="empty-state"><span class="empty-icon">' + Icons.image + '</span><p>暂无照片</p></div>';
            return;
        }

        this.gridEl.innerHTML = items.map(item => `
            <div class="photo-item" onclick="PhotosModule.preview('${item.id}')">
                <img src="${API.photos.thumbnail(item.id)}"
                     alt="${this.escapeHtml(item.original_name)}"
                     loading="lazy"
                     onerror="this.onerror=null;this.src='data:image/svg+xml,' + encodeURIComponent('<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23f3f4f6%22 width=%22100%22 height=%22100%22/><g stroke=%22%239ca3af%22 stroke-width=%222%22 fill=%22none%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><rect x=%2235%22 y=%2225%22 width=%2230%22 height=%2230%22 rx=%223%22/><circle cx=%2245%22 cy=%2237%22 r=%223%22/><polyline points=%2265 65 53 53 35 70%22/></g></svg>')" />
                <div class="photo-name">${this.escapeHtml(item.original_name)}</div>
                <button class="photo-delete" onclick="event.stopPropagation(); PhotosModule.delete('${item.id}')">×</button>
            </div>
        `).join('');
    },

    preview(id) {
        this.preview.src = API.photos.original(id);
        this.modal.classList.remove('hidden');
    },

    async delete(id) {
        const confirmed = await Confirm.show('确认删除此照片？');
        if (!confirmed) return;
        const res = await API.photos.delete(id);
        if (res.success) {
            Toast.success('已删除');
            this.load();
            App.updateStats();
        } else {
            Toast.error(res.message);
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};