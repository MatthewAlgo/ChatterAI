import logging
import os
from logging.handlers import RotatingFileHandler
from config.app_config import AppConfig

def setup_logger():
    config = AppConfig()
    os.makedirs(os.path.dirname(config.LOG_FILE), exist_ok=True)
    
    logger = logging.getLogger('ChatterAI')
    logger.setLevel(config.LOG_LEVEL)
    logger.handlers.clear()
    
    console_handler = logging.StreamHandler()
    file_handler = RotatingFileHandler(
        config.LOG_FILE,
        maxBytes=config.LOG_MAX_SIZE,
        backupCount=config.LOG_BACKUP_COUNT
    )
    console_handler.setLevel(config.LOG_LEVEL)
    file_handler.setLevel(config.LOG_LEVEL)
    formatter = logging.Formatter(
        fmt=config.LOG_FORMAT,
        datefmt=config.LOG_DATE_FORMAT
    )
    console_handler.setFormatter(formatter)
    file_handler.setFormatter(formatter)
    
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    logger.propagate = False
    
    return logger

def get_logger(name):
    return logging.getLogger(name)
