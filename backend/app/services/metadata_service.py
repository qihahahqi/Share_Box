"""元数据管理服务"""

import os
import json
import uuid
from datetime import datetime
from threading import Lock


class MetadataService:
    """元数据管理（单例）"""
    _instance = None
    _lock = Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'data')
        self.metadata_file = os.path.join(self.data_dir, 'metadata.json')
        self._load_metadata()

    def _load_metadata(self):
        """加载元数据"""
        if os.path.exists(self.metadata_file):
            with open(self.metadata_file, 'r', encoding='utf-8') as f:
                self.metadata = json.load(f)
        else:
            self.metadata = {
                'texts': [],
                'files': [],
                'photos': []
            }
            self._save_metadata()

        # 启动时自动修复数据一致性
        self._repair_consistency()

    def _save_metadata(self):
        """保存元数据"""
        with open(self.metadata_file, 'w', encoding='utf-8') as f:
            json.dump(self.metadata, f, indent=2, ensure_ascii=False)

    def _repair_consistency(self):
        """修复数据一致性：清除孤儿文件和孤儿元数据"""
        import logging
        log = logging.getLogger(__name__)
        repaired_files = 0
        repaired_meta = 0
        repaired_thumbs = 0

        # 1. 清理孤儿物理文件（磁盘有但 metadata 无）
        meta_file_ids = {f['id'] for f in self.metadata['files']}
        meta_photo_ids = {p['id'] for p in self.metadata['photos']}

        files_dir = os.path.join(self.data_dir, 'files')
        if os.path.exists(files_dir):
            for fname in os.listdir(files_dir):
                parts = fname.split('_', 2)
                if len(parts) >= 2:
                    fid = parts[1]
                    if fid not in meta_file_ids:
                        fpath = os.path.join(files_dir, fname)
                        try:
                            os.remove(fpath)
                            repaired_files += 1
                        except OSError:
                            pass

        photos_dir = os.path.join(self.data_dir, 'photos')
        if os.path.exists(photos_dir):
            for fname in os.listdir(photos_dir):
                parts = fname.split('_', 2)
                if len(parts) >= 2:
                    pid = parts[1]
                    if pid not in meta_photo_ids:
                        ppath = os.path.join(photos_dir, fname)
                        try:
                            os.remove(ppath)
                            repaired_files += 1
                        except OSError:
                            pass

        # 2. 清理孤儿 metadata（metadata 有但磁盘文件不存在）
        valid_files = []
        for f in self.metadata['files']:
            fpath = os.path.join(files_dir, f['filename'])
            if os.path.exists(fpath):
                valid_files.append(f)
            else:
                repaired_meta += 1
        self.metadata['files'] = valid_files

        valid_photos = []
        for p in self.metadata['photos']:
            ppath = os.path.join(photos_dir, p['filename'])
            if os.path.exists(ppath):
                valid_photos.append(p)
            else:
                repaired_meta += 1
        self.metadata['photos'] = valid_photos

        # 3. 清理孤儿缩略图
        thumbs_dir = os.path.join(self.data_dir, 'thumbnails')
        if os.path.exists(thumbs_dir):
            for fname in os.listdir(thumbs_dir):
                tid = fname.replace('_thumb.jpg', '')
                if tid not in meta_photo_ids:
                    tpath = os.path.join(thumbs_dir, fname)
                    try:
                        os.remove(tpath)
                        repaired_thumbs += 1
                    except OSError:
                        pass

        if repaired_files or repaired_meta or repaired_thumbs:
            self._save_metadata()
            log.warning(
                f'数据一致性修复: 清除 {repaired_files} 个孤儿文件, '
                f'{repaired_meta} 条孤儿元数据, {repaired_thumbs} 个孤儿缩略图'
            )

        return {
            'orphaned_files_removed': repaired_files,
            'orphaned_metadata_removed': repaired_meta,
            'orphaned_thumbnails_removed': repaired_thumbs
        }

    def _generate_id(self):
        """生成唯一ID"""
        return uuid.uuid4().hex[:8]

    def _now(self):
        """当前时间字符串"""
        return datetime.now().strftime('%Y-%m-%dT%H:%M:%S')

    # === 文字分享 ===
    def add_text(self, content):
        """添加文字分享"""
        id = self._generate_id()
        text_data = {
            'id': id,
            'content': content,
            'created_at': self._now(),
            'access_count': 0
        }
        self.metadata['texts'].append(text_data)
        self._save_metadata()

        # 保存内容到单独文件
        text_file = os.path.join(self.data_dir, 'texts', f'{id}.json')
        with open(text_file, 'w', encoding='utf-8') as f:
            json.dump(text_data, f, ensure_ascii=False)

        return text_data

    def get_texts(self):
        """获取所有文字分享"""
        return sorted(self.metadata['texts'], key=lambda x: x['created_at'], reverse=True)

    def get_text(self, id):
        """获取单个文字分享"""
        for text in self.metadata['texts']:
            if text['id'] == id:
                text['access_count'] += 1
                self._save_metadata()
                return text
        return None

    def delete_text(self, id):
        """删除文字分享"""
        self.metadata['texts'] = [t for t in self.metadata['texts'] if t['id'] != id]
        self._save_metadata()

        # 删除文件
        text_file = os.path.join(self.data_dir, 'texts', f'{id}.json')
        if os.path.exists(text_file):
            os.remove(text_file)

        return True

    # === 文件 ===
    def add_file(self, filename, original_name, size, mime_type):
        """添加文件记录"""
        id = self._generate_id()
        file_data = {
            'id': id,
            'filename': filename,
            'original_name': original_name,
            'size': size,
            'mime_type': mime_type,
            'created_at': self._now(),
            'download_count': 0
        }
        self.metadata['files'].append(file_data)
        self._save_metadata()
        return file_data

    def get_files(self):
        """获取所有文件"""
        return sorted(self.metadata['files'], key=lambda x: x['created_at'], reverse=True)

    def get_file(self, id):
        """获取单个文件"""
        for file in self.metadata['files']:
            if file['id'] == id:
                return file
        return None

    def delete_file(self, id):
        """删除文件"""
        file_info = self.get_file(id)
        if file_info:
            self.metadata['files'] = [f for f in self.metadata['files'] if f['id'] != id]
            self._save_metadata()

            # 删除物理文件
            file_path = os.path.join(self.data_dir, 'files', file_info['filename'])
            if os.path.exists(file_path):
                os.remove(file_path)
            return True
        return False

    # === 照片 ===
    def add_photo(self, filename, original_name, size, width, height, id=None):
        """添加照片记录"""
        if id is None:
            id = self._generate_id()
        photo_data = {
            'id': id,
            'filename': filename,
            'original_name': original_name,
            'size': size,
            'width': width,
            'height': height,
            'created_at': self._now(),
            'has_thumbnail': True
        }
        self.metadata['photos'].append(photo_data)
        self._save_metadata()
        return photo_data

    def get_photos(self):
        """获取所有照片"""
        return sorted(self.metadata['photos'], key=lambda x: x['created_at'], reverse=True)

    def get_photo(self, id):
        """获取单个照片"""
        for photo in self.metadata['photos']:
            if photo['id'] == id:
                return photo
        return None

    def delete_photo(self, id):
        """删除照片"""
        photo_info = self.get_photo(id)
        if photo_info:
            self.metadata['photos'] = [p for p in self.metadata['photos'] if p['id'] != id]
            self._save_metadata()

            # 删除物理文件
            photo_path = os.path.join(self.data_dir, 'photos', photo_info['filename'])
            thumb_path = os.path.join(self.data_dir, 'thumbnails', f'{id}_thumb.jpg')
            if os.path.exists(photo_path):
                os.remove(photo_path)
            if os.path.exists(thumb_path):
                os.remove(thumb_path)
            return True
        return False

    # === 统计 ===
    def get_stats(self):
        """获取存储统计"""
        texts_count = len(self.metadata['texts'])
        files_count = len(self.metadata['files'])
        photos_count = len(self.metadata['photos'])

        files_size = sum(f['size'] for f in self.metadata['files'])
        photos_size = sum(p['size'] for p in self.metadata['photos'])

        return {
            'texts_count': texts_count,
            'files_count': files_count,
            'photos_count': photos_count,
            'total_size': files_size + photos_size,
            'files_size': files_size,
            'photos_size': photos_size
        }

    # === 清理 ===
    def get_expired_items(self, days=30):
        """获取过期项目"""
        from datetime import timedelta
        threshold = datetime.now() - timedelta(days=days)
        threshold_str = threshold.strftime('%Y-%m-%dT%H:%M:%S')

        expired_texts = [t for t in self.metadata['texts'] if t['created_at'] < threshold_str]
        expired_files = [f for f in self.metadata['files'] if f['created_at'] < threshold_str]
        expired_photos = [p for p in self.metadata['photos'] if p['created_at'] < threshold_str]

        return {
            'texts': expired_texts,
            'files': expired_files,
            'photos': expired_photos
        }

    # === 搜索 ===
    def search(self, keyword):
        """搜索"""
        keyword = keyword.lower()

        matched_texts = [t for t in self.metadata['texts'] if keyword in t['content'].lower()]
        matched_files = [f for f in self.metadata['files'] if keyword in f['original_name'].lower()]
        matched_photos = [p for p in self.metadata['photos'] if keyword in p['original_name'].lower()]

        return {
            'texts': matched_texts,
            'files': matched_files,
            'photos': matched_photos
        }


# 全局单例
metadata_service = MetadataService()