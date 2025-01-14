from flask import jsonify
from typing import Dict, Any, Optional, Union
from datetime import datetime

def _serialize_value(value: Any) -> Any:
    if isinstance(value, datetime):
        return value.isoformat()
    return value

def success_response(data: Dict[str, Any], message: Optional[str] = None) -> Dict:
    if isinstance(data, dict):
        if 'recordset' not in data:
            data = {'recordset': [data] if not isinstance(data, list) else data}
        elif data['recordset'] is None:
            data['recordset'] = []
    response = {
        'status': 'success',
        'data': data
    }
    if message:
        response['message'] = message
    return jsonify(response)

def error_response(message: str, details: Optional[Any] = None, status_code: int = 500) -> tuple:
    response = {
        'status': 'error',
        'message': message
    }
    if details:
        response['details'] = str(details)  
    return jsonify(response), status_code
