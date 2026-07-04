"""文字分享API"""

from flask import Blueprint, request, send_file
from ..services.metadata_service import metadata_service
from ..utils.response import success, error
from .. import notify_change
import os
import tempfile

share_bp = Blueprint('share', __name__)


@share_bp.route('/text', methods=['POST'])
def create_text():
    """创建文字分享"""
    content = request.json.get('content', '')
    if not content.strip():
        return error('内容不能为空')

    text = metadata_service.add_text(content)
    notify_change('text')
    return success(text)


@share_bp.route('/text', methods=['GET'])
def get_texts():
    """获取文字分享列表"""
    texts = metadata_service.get_texts()
    return success(texts)


@share_bp.route('/text/<id>', methods=['GET'])
def get_text(id):
    """获取单个文字分享"""
    text = metadata_service.get_text(id)
    if not text:
        return error('未找到', 404)
    return success(text)


@share_bp.route('/text/<id>/download', methods=['GET'])
def download_text(id):
    """下载文字为文件"""
    text = metadata_service.get_text(id)
    if not text:
        return error('未找到', 404)

    # 创建临时文件
    temp_file = tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8')
    temp_file.write(text['content'])
    temp_file.close()

    return send_file(temp_file.name, as_attachment=True, download_name=f'sharebox_{id}.txt', mimetype='text/plain')


@share_bp.route('/text/<id>', methods=['DELETE'])
def delete_text(id):
    """删除文字分享"""
    if metadata_service.delete_text(id):
        notify_change('text')
        return success(message='已删除')
    return error('未找到', 404)