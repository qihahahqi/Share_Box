"""响应格式化工具"""

from flask import jsonify


def success(data=None, message='success'):
    """成功响应"""
    return jsonify({
        'success': True,
        'message': message,
        'data': data
    })


def error(message='error', code=400):
    """错误响应"""
    return jsonify({
        'success': False,
        'message': message
    }), code


def paginated(items, total, page=1, size=20):
    """分页响应"""
    return jsonify({
        'success': True,
        'data': {
            'items': items,
            'total': total,
            'page': page,
            'size': size
        }
    })