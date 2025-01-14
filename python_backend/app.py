from flask import Flask
from flask_cors import CORS
from middleware.error_handler import register_error_handlers
from middleware.request_logger import RequestLoggerMiddleware
from routes import db_routes, chat_routes
from config.app_config import AppConfig
from utils.logger import setup_logger
from database.connection_pool import init_db_pool
import os

def create_app():
    app = Flask(__name__)
    CORS(app, resources={
        r"/api/*": {
            "origins": os.getenv('CORS_ORIGINS', '').split(','),
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    config = AppConfig()
    app.config.from_object(config)
    logger = setup_logger()
    app.logger = logger
    init_db_pool()
    app.wsgi_app = RequestLoggerMiddleware(app.wsgi_app)
    register_error_handlers(app)
    
    app.register_blueprint(db_routes.bp)
    app.register_blueprint(chat_routes.bp)
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(
        host=os.getenv('FLASK_HOST', '0.0.0.0'),
        port=int(os.getenv('FLASK_PORT', 3000)),
        debug=app.config['DEBUG']
    )
