import pyodbc
from queue import Queue, Empty
from threading import Lock
from config.app_config import AppConfig
from utils.logger import get_logger

logger = get_logger(__name__)
class DatabaseConnectionPool:
    _instance = None
    _lock = Lock()
    
    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                cls._instance.initialize()
            return cls._instance
    
    def initialize(self):
        self.config = AppConfig().DB_CONFIG
        self.pool = Queue(maxsize=AppConfig().DB_POOL_SIZE)
        self.timeout = AppConfig().DB_POOL_TIMEOUT
        self._fill_pool()
    
    def _fill_pool(self):
        while not self.pool.full():
            connection = self._create_connection()
            self.pool.put(connection)
    
    def _create_connection(self):
        conn_str = self._build_connection_string()
        try:
            
            drivers = [x for x in pyodbc.drivers() if x.startswith('ODBC Driver')]
            if not drivers:
                error_msg = """
                ODBC Driver not found. Please install it using:
                For Ubuntu/Debian:
                curl https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
                curl https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/prod.list > /etc/apt/sources.list.d/mssql-release.list
                sudo apt-get update
                sudo ACCEPT_EULA=Y apt-get install -y msodbcsql17 unixodbc-dev
                
                For RHEL/CentOS:
                sudo curl https://packages.microsoft.com/config/rhel/8/prod.repo > /etc/yum.repos.d/mssql-release.repo
                sudo ACCEPT_EULA=Y yum install -y msodbcsql17 unixODBC-devel
                """
                logger.error(error_msg)
                raise Exception(error_msg)
            
            
            if self.config['driver'] not in drivers:
                latest_driver = max(drivers)
                logger.warning(f"Specified driver not found. Using {latest_driver} instead")
                self.config['driver'] = latest_driver
                conn_str = self._build_connection_string()
            
            return pyodbc.connect(conn_str)
        except Exception as e:
            logger.error(f"Failed to create database connection: {str(e)}")
            raise
    
    def _build_connection_string(self):
        return (
            f"DRIVER={self.config['driver']};"
            f"SERVER={self.config['server']};"
            f"DATABASE={self.config['database']};"
            f"UID={self.config['user']};"
            f"PWD={self.config['password']};"
            f"Encrypt={self.config['Encrypt']};"
            f"TrustServerCertificate={self.config['TrustServerCertificate']};"
        )
    
    def get_connection(self):
        try:
            connection = self.pool.get(timeout=self.timeout)
            if not self._is_connection_valid(connection):
                connection = self._create_connection()
            return connection
        except Empty:
            logger.warning("Connection pool timeout, creating new connection")
            return self._create_connection()
    
    def return_connection(self, connection):
        try:
            if self._is_connection_valid(connection):
                self.pool.put(connection)
            else:
                self._dispose_connection(connection)
        except:
            self._dispose_connection(connection)
    
    def _is_connection_valid(self, connection):
        try:
            connection.execute("SELECT 1")
            return True
        except:
            return False
    
    def _dispose_connection(self, connection):
        try:
            connection.close()
        except:
            pass

_pool = None

def init_db_pool():
    global _pool
    _pool = DatabaseConnectionPool()

def get_db_pool():
    if _pool is None:
        init_db_pool()
    return _pool
