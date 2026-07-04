"""ShareBox Flask应用"""

from flask import Flask
from flask_socketio import SocketIO
import os

socketio = SocketIO(async_mode='eventlet', cors_allowed_origins="*")


def create_app():
    """Flask应用工厂"""
    # 获取项目根目录
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

    app = Flask(__name__,
                static_folder=os.path.join(root_dir, 'frontend'),
                static_url_path='',
                template_folder=os.path.join(root_dir, 'frontend'))

    # 配置
    app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB
    app.config['JSON_AS_ASCII'] = False

    # 确保data目录存在
    data_dir = os.path.join(root_dir, 'data')
    os.makedirs(data_dir, exist_ok=True)
    os.makedirs(os.path.join(data_dir, 'texts'), exist_ok=True)
    os.makedirs(os.path.join(data_dir, 'files'), exist_ok=True)
    os.makedirs(os.path.join(data_dir, 'photos'), exist_ok=True)
    os.makedirs(os.path.join(data_dir, 'thumbnails'), exist_ok=True)

    # 注册API蓝图
    from .api.share import share_bp
    from .api.files import files_bp
    from .api.photos import photos_bp
    from .api.cleanup import cleanup_bp
    from .api.search import search_bp
    from .api.system import system_bp

    app.register_blueprint(share_bp, url_prefix='/api/share')
    app.register_blueprint(files_bp, url_prefix='/api/files')
    app.register_blueprint(photos_bp, url_prefix='/api/photos')
    app.register_blueprint(cleanup_bp, url_prefix='/api/cleanup')
    app.register_blueprint(search_bp, url_prefix='/api/search')
    app.register_blueprint(system_bp, url_prefix='/api')

    # 主页路由
    @app.route('/')
    def index():
        return app.send_static_file('index.html')

    # 初始化SocketIO
    socketio.init_app(app)

    return app


def notify_change(event_type):
    """通知所有客户端数据变化"""
    socketio.emit('data_change', {'type': event_type})