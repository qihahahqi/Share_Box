#!/bin/bash
# ============================================
# ShareBox 一键启动脚本
# ============================================
set -e

# 配置
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONDA_BASE="/home/vibe/miniconda3"
CONDA_ENV="sharebox"
APP_PORT=9002

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}   📦 ShareBox - 内网文件分享启动脚本   ${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# 1. 初始化 conda
echo -e "${YELLOW}[1/4]${NC} 初始化 conda..."
if [ -f "${CONDA_BASE}/etc/profile.d/conda.sh" ]; then
    source "${CONDA_BASE}/etc/profile.d/conda.sh"
else
    echo -e "${RED}❌ 未找到 conda，请确认 miniconda3 安装路径${NC}"
    exit 1
fi

# 2. 检查并激活虚拟环境
echo -e "${YELLOW}[2/4]${NC} 激活虚拟环境 ${CONDA_ENV}..."
if conda env list | grep -q "^${CONDA_ENV} "; then
    conda activate "${CONDA_ENV}"
    echo -e "${GREEN}   ✅ 虚拟环境已激活: ${CONDA_ENV}${NC}"
else
    echo -e "${RED}❌ 虚拟环境 ${CONDA_ENV} 不存在，请先运行部署脚本${NC}"
    exit 1
fi

# 3. 检查依赖
echo -e "${YELLOW}[3/4]${NC} 检查依赖..."
python -c "import flask; import flask_socketio; import PIL; import eventlet" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ 所有依赖已就绪${NC}"
else
    echo -e "${RED}❌ 依赖缺失，正在安装...${NC}"
    pip install -r "${PROJECT_DIR}/requirements.txt"
fi

# 4. 启动应用
echo -e "${YELLOW}[4/4]${NC} 启动 ShareBox..."
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   🚀 ShareBox 已启动！${NC}"
echo -e "${GREEN}   🌐 访问地址: http://localhost:${APP_PORT}${NC}"
echo -e "${GREEN}   📡 局域网访问: http://$(hostname -I 2>/dev/null | awk '{print $1}'):${APP_PORT}${NC}"
echo -e "${GREEN}   🛑 按 Ctrl+C 停止服务${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

cd "${PROJECT_DIR}"
python app.py
