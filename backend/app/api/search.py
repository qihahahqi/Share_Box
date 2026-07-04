"""搜索API"""

from flask import Blueprint, request
from ..services.metadata_service import metadata_service
from ..utils.response import success, error

search_bp = Blueprint('search', __name__)


@search_bp.route('', methods=['GET'])
def search():
    """搜索"""
    keyword = request.args.get('q', '')
    if not keyword.strip():
        return error('请输入搜索关键词')

    results = metadata_service.search(keyword)
    return success({
        'texts': results['texts'],
        'files': results['files'],
        'photos': results['photos'],
        'total': len(results['texts']) + len(results['files']) + len(results['photos'])
    })