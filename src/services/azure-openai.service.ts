import { ChatMessage, OpenAIMessage } from './types/chat.types';

export const openAIService = {
    async getChatCompletion(messages: ChatMessage[], chatId: string): Promise<string> {
        try {
            const formattedMessages: OpenAIMessage[] = messages.map(msg => ({
                role: msg.role || (msg.sender === 'user' ? 'user' : 'assistant'),
                content: msg.content
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: formattedMessages,
                    chatId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get AI response');
            }

            const data = await response.json();
            return data.content || '';
        } catch (error) {
            console.error('Azure OpenAI Error:', error);
            throw error instanceof Error ? error : new Error('Failed to get AI response');
        }
    }
};
