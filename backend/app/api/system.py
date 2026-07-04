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


@system_bp.route('/repair', methods=['POST'])
def repair():
    """手动触发数据一致性修复"""
    result = metadata_service._repair_consistency()
    return success(result, message='数据修复完成')