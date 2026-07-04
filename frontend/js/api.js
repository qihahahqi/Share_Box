// API封装
const API = {
    baseUrl: '/api',

    // 通用网络错误处理
    async _fetch(url, options = {}) {
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            return data;
        } catch (err) {
            console.error('API请求失败:', url, err);
            // 网络错误时显示toast提示
            if (typeof Toast !== 'undefined' && Toast.error) {
                Toast.error('网络错误，请检查连接');
            }
            return { success: false, message: '网络错误，请检查连接' };
        }
    },

    // 文字分享
    share: {
        create: async (content) => {
            return await API._fetch(`${API.baseUrl}/share/text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
        },
        list: async () => {
            return await API._fetch(`${API.baseUrl}/share/text`);
        },
        download: (id) => {
            return `${API.baseUrl}/share/text/${id}/download`;
        },
        delete: async (id) => {
            return await API._fetch(`${API.baseUrl}/share/text/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // 文件
    files: {
        upload: async (file) => {
            try {
                const formData = new FormData();
                formData.append('file', file);
                const response = await fetch(`${API.baseUrl}/files/upload`, {
                    method: 'POST',
                    body: formData
                });
                return await response.json();
            } catch (err) {
                console.error('文件上传失败:', err);
                if (typeof Toast !== 'undefined' && Toast.error) {
                    Toast.error('文件上传失败，请检查网络连接');
                }
                return { success: false, message: '上传失败，请检查网络连接' };
            }
        },
        list: async () => {
            return await API._fetch(`${API.baseUrl}/files`);
        },
        download: (id) => {
            return `${API.baseUrl}/files/${id}/download`;
        },
        delete: async (id) => {
            return await API._fetch(`${API.baseUrl}/files/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // 照片
    photos: {
        upload: async (file) => {
            try {
                const formData = new FormData();
                formData.append('file', file);
                const response = await fetch(`${API.baseUrl}/photos/upload`, {
                    method: 'POST',
                    body: formData
                });
                return await response.json();
            } catch (err) {
                console.error('照片上传失败:', err);
                if (typeof Toast !== 'undefined' && Toast.error) {
                    Toast.error('照片上传失败，请检查网络连接');
                }
                return { success: false, message: '上传失败，请检查网络连接' };
            }
        },
        list: async () => {
            return await API._fetch(`${API.baseUrl}/photos`);
        },
        thumbnail: (id) => {
            return `${API.baseUrl}/photos/${id}/thumbnail`;
        },
        original: (id) => {
            return `${API.baseUrl}/photos/${id}/original`;
        },
        delete: async (id) => {
            return await API._fetch(`${API.baseUrl}/photos/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // 清理
    cleanup: {
        status: async () => {
            return await API._fetch(`${API.baseUrl}/cleanup/status`);
        },
        execute: async () => {
            return await API._fetch(`${API.baseUrl}/cleanup/execute`, {
                method: 'POST'
            });
        }
    },

    // 搜索
    search: async (keyword) => {
        return await API._fetch(`${API.baseUrl}/search?q=${encodeURIComponent(keyword)}`);
    },

    // 系统
    stats: async () => {
        return await API._fetch(`${API.baseUrl}/stats`);
    },
    health: async () => {
        return await API._fetch(`${API.baseUrl}/health`);
    },
    repair: async () => {
        return await API._fetch(`${API.baseUrl}/repair`, { method: 'POST' });
    }
};
