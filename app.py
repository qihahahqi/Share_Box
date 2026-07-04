"""ShareBox 启动入口"""

from backend.app import create_app, socketio

app = create_app()

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=9002, debug=True, use_reloader=True)