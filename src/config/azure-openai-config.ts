export interface AzureOpenAIConfig {
    apiKey: string;
    endpoint: string;
    deploymentName: string;
    apiVersion: string;
}

export const azureOpenAIConfig: AzureOpenAIConfig = {
    apiKey: process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY || '',
    endpoint: process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT || '',
    deploymentName: process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT_NAME || '',
    apiVersion: '2024-02-15-preview'
};

// Validation
if (!azureOpenAIConfig.apiKey) {
    console.warn('Warning: AZURE_OPENAI_API_KEY is not set');
}

if (!azureOpenAIConfig.endpoint) {
    console.warn('Warning: AZURE_OPENAI_API_ENDPOINT is not set');
}
