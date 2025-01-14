export interface Message {
    id: string;
    content: string;
    sender: 'user' | 'gpt';
    timestamp: Date;
}

export interface ChatMessage {
    sender: 'user' | 'gpt';
    content: string;
}

export interface ChatRecord {
    convoId: string;
    content: string;
    person: 'user' | 'gpt';  // Keep person for database records
    timestamp: string;
}

export interface ChatSession {
    chatId: string;
    chatName: string;
    createdAt: Date;
    updatedAt?: Date;
    lastMessage?: string;
}

export interface OpenAIMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface QueryResponse<T = any> {
    status: 'success' | 'error';
    data?: {
        recordset?: T[];
        message?: string;
    };
    message?: string;
    details?: string;
}
