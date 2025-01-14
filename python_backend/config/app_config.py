import os
from dotenv import load_dotenv

load_dotenv()

class AppConfig:
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'your-secret-key')
    
    
    DB_CONFIG = {
        'driver': '{ODBC Driver 17 for SQL Server}',
        'server': os.getenv('AZURE_DB_SERVER'),
        'database': os.getenv('AZURE_DB_NAME'),
        'user': os.getenv('AZURE_DB_USER'),
        'password': os.getenv('AZURE_DB_PASSWORD'),
        'Encrypt': 'yes',
        'TrustServerCertificate': 'no'
    }
    
    
    DB_POOL_SIZE = int(os.getenv('DB_POOL_SIZE', '5'))
    DB_POOL_TIMEOUT = int(os.getenv('DB_POOL_TIMEOUT', '30'))
    
    
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FORMAT = '[%(asctime)s] [%(levelname)s] [%(name)s:%(lineno)d] - %(message)s'
    LOG_DATE_FORMAT = '%Y-%m-%d %H:%M:%S'
    LOG_FILE = 'logs/app.log'
    LOG_MAX_SIZE = 10 * 1024 * 1024  
    LOG_BACKUP_COUNT = 5
