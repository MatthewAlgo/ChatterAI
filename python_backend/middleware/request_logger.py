from werkzeug.wrappers import Request, Response
from utils.logger import get_logger
import time

logger = get_logger(__name__)

class RequestLoggerMiddleware:
    def __init__(self, app):
        self.app = app
    
    def __call__(self, environ, start_response):
        request = Request(environ)
        start_time = time.time()
        
        logger.info(f"Request started: {request.method} {request.url}")
        logger.debug(f"Headers: {dict(request.headers)}")
        def custom_start_response(status, headers, exc_info=None):
            duration = time.time() - start_time
            logger.info(f"Request completed: {status} in {duration:.2f}s")
            return start_response(status, headers, exc_info)
        
        return self.app(environ, custom_start_response)
