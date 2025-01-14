import os
from openai import AzureOpenAI
from typing import List, Dict, Any
from config.azure_openai_config import azure_openai_config
import logging
logger = logging.getLogger(__name__)

def get_azure_openai_client() -> AzureOpenAI:
    try:
        client = AzureOpenAI(
            api_key=azure_openai_config['apiKey'],
            api_version="2023-05-15",
            azure_endpoint=azure_openai_config['endpoint']
        )
        return client
        
    except Exception as e:
        logger.error(f"Failed to initialize Azure OpenAI client: {str(e)}")
        logger.error(f"Error type: {type(e)}")
        raise

def get_completion(messages: List[Dict[str, Any]]) -> str:
    try:
        client = get_azure_openai_client()
        formatted_messages = [
            {"role": msg.get("role", "user"), "content": msg.get("content", "")}
            for msg in messages
        ]
        if not any(msg.get("role") == "system" for msg in formatted_messages):
            formatted_messages.insert(0, {
                "role": "system",
                "content": "You are a helpful AI assistant. Provide detailed, accurate answers."
            })
        completion = client.chat.completions.create(
            model=azure_openai_config['deploymentName'],
            messages=formatted_messages,
            temperature=azure_openai_config['model']['temperature'],
            max_tokens=azure_openai_config['model']['maxTokens']
        )

        if not completion.choices[0].message.content:
            raise ValueError('No response from Azure OpenAI')
        return completion.choices[0].message.content
    except Exception as e:
        logger.error(f"Azure OpenAI Error: {str(e)}")
        raise
