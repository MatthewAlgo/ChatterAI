from typing import Any, Dict, Tuple, List
import re

def prepare_query_and_params(query: str, params: Dict[str, Any]) -> Tuple[str, List[Any]]:
    if not params:
        return query, []
    param_occurrences = re.findall(r'@(\w+)', query)
    param_values = []
    new_query = query
    for param_name in param_occurrences:
        if param_name not in params:
            raise ValueError(f"Missing parameter value for '@{param_name}'")
        new_query = new_query.replace(f'@{param_name}', '?', 1)  
        param_values.append(params[param_name])
    
    return new_query, param_values
