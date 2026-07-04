"""照片API"""

from flask import Blueprint, request, send_file
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from ..services.metadata_service import metadata_service
from ..utils.image_utils import create_thumbnail, get_image_info
from ..utils.response import success, error
from .. import notify_change

photos_bp = Blueprint('photos', __name__)

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'data')


@photos_bp.route('/upload', methods=['POST'])
def upload_photo():
    """上传照片"""
    if 'file' not in request.files:
        return error('没有选择文件')

    file = request.files['file']
    if file.filename == '':
        return error('没有选择文件')

    # 检查是否为图片
    if not file.content_type or not file.content_type.startswith('image/'):
        return error('请上传图片文件')

    original_name = secure_filename(file.filename)
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    photo_id = metadata_service._generate_id()
    filename = f'{timestamp}_{photo_id}_{original_name}'

    # 保存原图
    photo_path = os.path.join(DATA_DIR, 'photos', filename)
    file.save(photo_path)

    # 获取图片信息
    width, height = get_image_info(photo_path)
    size = os.path.getsize(photo_path)

    # 创建缩略图
    thumb_path = os.path.join(DATA_DIR, 'thumbnails', f'{photo_id}_thumb.jpg')
    create_thumbnail(photo_path, thumb_path)

    # 记录元数据，使用已生成的photo_id
    photo_data = metadata_service.add_photo(filename, original_name, size, width, height, id=photo_id)
    notify_change('photo')
    return success(photo_data)


@photos_bp.route('', methods=['GET'])
def get_photos():
    """获取照片列表"""
    photos = metadata_service.get_photos()
    return success(photos)


@photos_bp.route('<id>', methods=['GET'])
def get_photo(id):
    """获取照片详情"""
    photo = metadata_service.get_photo(id)
    if not photo:
        return error('未找到', 404)
    return success(photo)


@photos_bp.route('<id>/thumbnail', methods=['GET'])
def get_thumbnail(id):
    """获取缩略图"""
    thumb_path = os.path.join(DATA_DIR, 'thumbnails', f'{id}_thumb.jpg')
    if not os.path.exists(thumb_path):
        return error('未找到', 404)
    return send_file(thumb_path, mimetype='image/jpeg')


@photos_bp.route('<id>/original', methods=['GET'])
def get_original(id):
    """获取原图"""
    photo_info = metadata_service.get_photo(id)
    if not photo_info:
        return error('未找到', 404)

    photo_path = os.path.join(DATA_DIR, 'photos', photo_info['filename'])
    return send_file(photo_path, mimetype='image/jpeg')


@photos_bp.route('<id>', methods=['DELETE'])
def delete_photo(id):
    """删除照片"""
    if metadata_service.delete_photo(id):
        notify_change('photo')
        return success(message='已删除')
    return error('未找到', 404)