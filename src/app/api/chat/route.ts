import { NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import '@azure/openai/types';
import { azureOpenAIConfig } from '@/config/azure-openai-config';

export async function POST(request: Request) {
    try {
        const { messages } = await request.json();

        if (!azureOpenAIConfig.apiKey || !azureOpenAIConfig.endpoint) {
            throw new Error('Azure OpenAI configuration is missing');
        }

        const client = new AzureOpenAI({
            apiKey: azureOpenAIConfig.apiKey,
            endpoint: azureOpenAIConfig.endpoint,
            deployment: azureOpenAIConfig.deploymentName,
            apiVersion: azureOpenAIConfig.apiVersion,
        });

        const completion = await client.chat.completions.create({
            messages: messages,
            model: azureOpenAIConfig.deploymentName,
            temperature: 0.7,
            max_tokens: 800,
        });

        if (!completion.choices[0].message?.content) {
            throw new Error('No response from Azure OpenAI');
        }

        return NextResponse.json({
            content: completion.choices[0].message.content
        });
    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to get chat completion' },
            { status: 500 }
        );
    }
}
