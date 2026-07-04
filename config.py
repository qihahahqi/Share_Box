"""ShareBox 配置"""

# 服务器配置
SERVER_PORT = 9002
SERVER_HOST = '0.0.0.0'

# 存储配置
DATA_DIR = 'data'
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

# 清理配置
EXPIRE_DAYS = 30

# 文件类型配置
ALLOWED_EXTENSIONS = set()

# 缩略图配置
THUMBNAIL_SIZE = (200, 200)