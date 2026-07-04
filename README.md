# ShareBox - 内网跨设备剪贴板共享系统

解决不同设备间粘贴板共享问题，以及不同操作系统间复制粘贴乱码问题。通过开启 Web 服务，让局域网内所有设备都能通过浏览器共享文字、文件和图片。

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| 📝 **文字分享** | 任意设备复制文字，所有设备立即可见 |
| 📎 **文件共享** | 上传任意类型文件，支持下载 |
| 🖼️ **图片共享** | 上传图片自动生成缩略图，支持预览 |
| 🔍 **全文搜索** | 搜索文字、文件名、图片名 |
| 🧹 **自动清理** | 超过 30 天的内容自动清理（可配置） |
| 🔌 **WebSocket 实时推送** | 数据变化时所有客户端实时同步 |
| 🌐 **跨平台** | 任何有浏览器的设备都能用（Windows/Mac/Linux/iOS/Android） |

## 🏗️ 技术栈

**后端**: Python 3.11+ / Flask / Flask-SocketIO / eventlet

**前端**: 原生 HTML5 + CSS3 + JavaScript（零依赖，无框架）

**存储**: 本地文件系统 + JSON 元数据索引

## 🚀 快速开始

### 方式一：一键部署（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/qihahahqi/Share_Box.git
cd Share_Box

# 2. 运行部署脚本（自动创建 conda 环境、安装依赖）
chmod +x setup.sh
./setup.sh

# 3. 启动服务
./start.sh
```

### 方式二：手动部署

#### 环境要求

- Python 3.11+
- pip 或 conda

#### 安装步骤

```bash
# 1. 创建虚拟环境
conda create -n sharebox python=3.11 -y
conda activate sharebox

# 或使用 venv
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 2. 安装依赖
pip install -r requirements.txt

# 3. 启动服务
python app.py
```

### 访问服务

启动后浏览器打开 `http://<你的IP>:9002`，局域网内其他设备也可以访问。

例如：`http://192.168.1.100:9002`

## 📁 项目结构

```
ShareBox/
├── app.py                  # Flask 应用入口
├── config.py               # 全局配置
├── requirements.txt         # Python 依赖
├── setup.sh                # 一键部署脚本（conda）
├── start.sh                # 启动脚本
├── backend/
│   ├── __init__.py
│   └── app/
│       ├── __init__.py     # Flask 工厂 + SocketIO
│       ├── api/
│       │   ├── share.py    # 文字分享 API
│       │   ├── files.py    # 文件上传下载 API
│       │   ├── photos.py   # 图片 API
│       │   ├── search.py   # 搜索 API
│       │   ├── cleanup.py  # 清理 API
│       │   └── system.py   # 系统信息 API
│       ├── services/
│       │   └── metadata_service.py  # 元数据管理
│       └── utils/
│           ├── response.py          # 统一响应格式
│           └── image_utils.py       # 图片处理工具
├── frontend/
│   ├── index.html           # 主页面
│   ├── css/style.css        # 样式
│   └── js/
│       ├── app.js           # 主逻辑
│       ├── api.js           # API 封装
│       ├── socket.js        # WebSocket 客户端
│       ├── toast.js         # 提示组件
│       ├── icons.js         # 图标组件
│       └── modules/
│           ├── share.js     # 文字分享模块
│           ├── files.js     # 文件管理模块
│           ├── photos.js    # 图片管理模块
│           └── cleanup.js   # 清理模块
└── data/                    # 运行时数据目录
    ├── metadata.json        # 元数据索引
    ├── texts/               # 文字分享存储
    ├── files/               # 上传文件存储
    ├── photos/              # 图片存储
    └── thumbnails/          # 缩略图缓存
```

## ⚙️ 配置说明

编辑 `config.py` 修改配置：

```python
SERVER_PORT = 9002          # 服务端口
SERVER_HOST = '0.0.0.0'    # 监听地址（0.0.0.0 表示允许局域网访问）
MAX_FILE_SIZE = 100 * 1024 * 1024  # 上传文件大小限制（100MB）
EXPIRE_DAYS = 30            # 自动清理超过多少天的数据
THUMBNAIL_SIZE = (200, 200) # 缩略图尺寸
```

## 🖥️ 部署为系统服务（可选）

创建 systemd 服务实现开机自启：

```bash
sudo tee /etc/systemd/system/sharebox.service << 'EOF'
[Unit]
Description=ShareBox Service
After=network.target

[Service]
Type=simple
User=vibe
WorkingDirectory=/home/vibe/projects/ShareBox
ExecStart=/home/vibe/miniconda3/envs/sharebox/bin/python app.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now sharebox
```

## 📄 许可证

Apache-2.0 License — 详见 [LICENSE](LICENSE)
