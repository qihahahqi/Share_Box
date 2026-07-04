"""文件API"""

from flask import Blueprint, request, send_file
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from ..services.metadata_service import metadata_service
from ..utils.response import success, error
from .. import notify_change

files_bp = Blueprint('files', __name__)

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'data')


@files_bp.route('/upload', methods=['POST'])
def upload_file():
    """上传文件"""
    if 'file' not in request.files:
        return error('没有选择文件')

    file = request.files['file']
    if file.filename == '':
        return error('没有选择文件')

    original_name = secure_filename(file.filename)
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    file_id = metadata_service._generate_id()
    filename = f'{timestamp}_{file_id}_{original_name}'

    # 保存文件
    file_path = os.path.join(DATA_DIR, 'files', filename)
    file.save(file_path)

    # 获取文件大小
    size = os.path.getsize(file_path)

    # 记录元数据
    file_data = metadata_service.add_file(filename, original_name, size, file.content_type or 'application/octet-stream')
    notify_change('file')
    return success(file_data)


@files_bp.route('', methods=['GET'])
def get_files():
    """获取文件列表"""
    files = metadata_service.get_files()
    return success(files)


@files_bp.route('<id>/download', methods=['GET'])
def download_file(id):
    """下载文件"""
    file_info = metadata_service.get_file(id)
    if not file_info:
        return error('未找到', 404)

    # 更新下载计数
    for f in metadata_service.metadata['files']:
        if f['id'] == id:
            f['download_count'] = f.get('download_count', 0) + 1
            metadata_service._save_metadata()
            break

    file_path = os.path.join(DATA_DIR, 'files', file_info['filename'])
    return send_file(file_path, as_attachment=True, download_name=file_info['original_name'])


@files_bp.route('<id>', methods=['DELETE'])
def delete_file(id):
    """删除文件"""
    if metadata_service.delete_file(id):
        notify_change('file')
        return success(message='已删除')
    return error('未找到', 404)