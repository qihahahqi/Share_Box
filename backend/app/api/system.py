"""系统API"""

from flask import Blueprint
from ..services.metadata_service import metadata_service
from ..utils.response import success

system_bp = Blueprint('system', __name__)


@system_bp.route('/health', methods=['GET'])
def health():
    """健康检查"""
    return success({'status': 'ok'})


@system_bp.route('/stats', methods=['GET'])
def stats():
    """存储统计"""
    stats_data = metadata_service.get_stats()
    return success(stats_data)