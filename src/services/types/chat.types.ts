export interface ChatMessage {
    role?: 'system' | 'user' | 'assistant';
    sender?: 'user' | 'gpt';
    content: string;
}

export interface ConversationMessage extends ChatMessage {
    convoId: string;
    timestamp: Date;
    sender: 'user' | 'gpt';
}

export interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
