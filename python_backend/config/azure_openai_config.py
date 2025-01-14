import os
from dotenv import load_dotenv
from typing import Dict, Any

load_dotenv()
def _validate_config() -> None:
    required_vars = [
        'NEXT_PUBLIC_AZURE_OPENAI_API_KEY',  
        'NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT',  
        'NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT_NAME'
    ]
    
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

_validate_config()
azure_openai_config: Dict[str, Any] = {
    'apiKey': os.getenv('NEXT_PUBLIC_AZURE_OPENAI_API_KEY'),  
    'endpoint': os.getenv('NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT'),  
    'deploymentName': os.getenv('NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT_NAME'),
    'model': {
        'temperature': 0.7,
        'maxTokens': 800
    }
}
