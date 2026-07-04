"""图片处理工具"""

from PIL import Image
import os


def create_thumbnail(source_path, thumb_path, size=(200, 200)):
    """创建缩略图"""
    try:
        with Image.open(source_path) as img:
            # 保持比例缩放
            img.thumbnail(size, Image.Resampling.LANCZOS)
            # 保存为JPEG
            img.save(thumb_path, 'JPEG', quality=85)
            return True
    except Exception as e:
        print(f'缩略图生成失败: {e}')
        return False


def get_image_info(path):
    """获取图片尺寸"""
    try:
        with Image.open(path) as img:
            return img.width, img.height
    except Exception:
        return 0, 0