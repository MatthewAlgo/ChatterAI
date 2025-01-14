from flask import jsonify
from utils.logger import get_logger
from utils.response_utils import error_response

logger = get_logger(__name__)
class DatabaseError(Exception):
    pass
class ValidationError(Exception):
    pass

def register_error_handlers(app):
    @app.errorhandler(DatabaseError)
    def handle_database_error(error):
        logger.error(f"Database error: {str(error)}")
        return error_response(
            'Database operation failed',
            details=str(error),
            status_code=500
        )
    
    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        logger.warning(f"Validation error: {str(error)}")
        return error_response(
            'Validation failed',
            details=str(error),
            status_code=400
        )
    
    @app.errorhandler(Exception)
    def handle_generic_error(error):
        logger.error(f"Unhandled error: {str(error)}")
        return error_response(
            'Internal server error',
            details=str(error) if app.debug else None,
            status_code=500
        )
