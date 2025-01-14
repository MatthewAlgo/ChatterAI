import { ChatMessage, OpenAIMessage } from './types/chat.types';

export const openAIService = {
    formatMessages(messages: ChatMessage[]): OpenAIMessage[] {
        return messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));
    },

    async getChatCompletion(messages: ChatMessage[], chatId: string): Promise<string> {
        try {
            const formattedMessages = this.formatMessages(messages);

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    messages: formattedMessages,
                    chatId,
                    model: 'gpt-3.5-turbo'
                }),
            });

            const data = await response.json();

            // Check for error status first
            if (!response.ok || data.status === 'error') {
                throw new Error(data.message || data.error || 'Failed to get AI response');
            }

            // Handle the specific response format we're receiving
            if (data.data?.recordset?.[0]?.content) {
                return data.data.recordset[0].content;
            }

            if (data.data?.content) {
                return data.data.content;
            }

            // Log the actual response for debugging
            console.debug('API Response:', JSON.stringify(data, null, 2));
            
            throw new Error('Could not extract content from API response');

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to get AI response';
            console.error('Azure OpenAI Error:', errorMessage);
            throw new Error(errorMessage);
        }
    }
};
