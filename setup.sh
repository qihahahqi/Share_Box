#!/bin/bash
# ============================================
# ShareBox 一键部署脚本（初次使用）
# ============================================
set -e

# 配置
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONDA_BASE="/home/vibe/miniconda3"
CONDA_ENV="sharebox"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}   📦 ShareBox - 环境部署脚本           ${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# 1. 检测 conda
echo -e "${YELLOW}[1/4]${NC} 检测 conda..."
if [ -f "${CONDA_BASE}/etc/profile.d/conda.sh" ]; then
    source "${CONDA_BASE}/etc/profile.d/conda.sh"
    echo -e "${GREEN}   ✅ miniconda3 已找到${NC}"
else
    echo -e "${RED}❌ 未找到 miniconda3，路径: ${CONDA_BASE}${NC}"
    exit 1
fi

# 2. 创建虚拟环境
echo -e "${YELLOW}[2/4]${NC} 创建虚拟环境 ${CONDA_ENV}..."
if conda env list | grep -q "^${CONDA_ENV} "; then
    echo -e "${YELLOW}   ⚠️  环境已存在，跳过创建${NC}"
else
    conda create -n "${CONDA_ENV}" python=3.11 -y
    echo -e "${GREEN}   ✅ 环境创建完成${NC}"
fi

# 3. 激活并安装依赖
echo -e "${YELLOW}[3/4]${NC} 安装 Python 依赖..."
conda activate "${CONDA_ENV}"
pip install -r "${PROJECT_DIR}/requirements.txt"
echo -e "${GREEN}   ✅ 依赖安装完成${NC}"

# 4. 验证
echo -e "${YELLOW}[4/4]${NC} 验证环境..."
python -c "
import flask; print('Flask:', flask.__version__)
import flask_socketio; print('Flask-SocketIO: OK')
import PIL; print('Pillow:', PIL.__version__)
import eventlet; print('eventlet:', eventlet.__version__)
print('所有依赖验证通过')
"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ✅ ShareBox 环境部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "  启动方式: ${CYAN}./start.sh${NC}"
echo -e "  或手动启动: ${CYAN}conda activate sharebox && python app.py${NC}"
echo ""
