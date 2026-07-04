"""清理API"""

from flask import Blueprint
from ..services.metadata_service import metadata_service
from ..utils.response import success, error
from .. import notify_change

cleanup_bp = Blueprint('cleanup', __name__)


@cleanup_bp.route('/status', methods=['GET'])
def get_cleanup_status():
    """获取可清理项目"""
    expired = metadata_service.get_expired_items(days=30)

    texts_count = len(expired['texts'])
    files_count = len(expired['files'])
    photos_count = len(expired['photos'])

    texts_size = sum(0 for _ in expired['texts'])  # 文字不占存储
    files_size = sum(metadata_service.get_file(f['id'])['size'] for f in expired['files'] if metadata_service.get_file(f['id']))
    photos_size = sum(metadata_service.get_photo(p['id'])['size'] for p in expired['photos'] if metadata_service.get_photo(p['id']))

    return success({
        'texts_count': texts_count,
        'files_count': files_count,
        'photos_count': photos_count,
        'total_size': files_size + photos_size,
        'items': expired
    })


@cleanup_bp.route('/execute', methods=['POST'])
def execute_cleanup():
    """执行清理"""
    expired = metadata_service.get_expired_items(days=30)

    # 删除过期文字
    for text in expired['texts']:
        metadata_service.delete_text(text['id'])

    # 删除过期文件
    for file in expired['files']:
        metadata_service.delete_file(file['id'])

    # 删除过期照片
    for photo in expired['photos']:
        metadata_service.delete_photo(photo['id'])

    # 通知所有客户端
    notify_change('all')

    return success({
        'texts_deleted': len(expired['texts']),
        'files_deleted': len(expired['files']),
        'photos_deleted': len(expired['photos'])
    })