import { azureQueryService, QueryParams } from './azure-query.service';
import { Message, ChatMessage, ChatRecord, OpenAIMessage } from './types/chat.types';
import { v4 as uuidv4 } from 'uuid';

export const chatService = {
    async createNewChat(userId: string): Promise<string> {
        const chatId = uuidv4();
        const params: QueryParams = { chatId, userId };
        
        await azureQueryService.executeQuery(
            'CREATE_CHAT',
            `BEGIN TRANSACTION;
             INSERT INTO ChatNames (chatId) VALUES (@chatId);
             INSERT INTO UserChatNames (userId, chatId) VALUES (@userId, @chatId);
             COMMIT;`,
            params
        );
        
        return chatId;
    },

    async saveMessage(chatId: string, content: string, sender: 'user' | 'gpt'): Promise<void> {
        try {
            const messageId = uuidv4();
            
            // Simplified query without using variables
            const result = await azureQueryService.executeQuery(
                'SAVE_MESSAGE',
                `BEGIN TRANSACTION;
                 INSERT INTO Conversations 
                 (convoId, convoPerson, convoContent, convoTimestamp)
                 VALUES 
                 (@convoId, @person, @content, GETDATE());
                 
                 INSERT INTO ChatNamesConversations 
                 (chatId, convoId)
                 VALUES 
                 (@chatId, @convoId);
                 
                 UPDATE ChatNames 
                 SET updatedAt = GETDATE() 
                 WHERE chatId = @chatId;
                 
                 COMMIT;`,
                {
                    chatId,
                    convoId: messageId,
                    person: sender,
                    content
                }
            );

            if (result.status === 'error') {
                throw new Error(result.message || 'Failed to save message');
            }
        } catch (error) {
            const errorMessage = error instanceof Error 
                ? error.message 
                : 'Failed to save message to database';
            throw new Error(`Save message failed: ${errorMessage}`);
        }
    },

    async updateChatName(chatId: string, newName: string): Promise<void> {
        await azureQueryService.executeQuery(
            'UPDATE_CHAT_NAME',
            'UPDATE ChatNames SET chatName = @newName WHERE chatId = @chatId',
            { chatId, newName }
        );
    },

    async deleteChatHistory(chatId: string): Promise<void> {
        await azureQueryService.executeQuery(
            'DELETE_CHAT',
            `BEGIN TRANSACTION;
             DELETE FROM ChatNamesConversations WHERE chatId = @chatId;
             DELETE FROM UserChatNames WHERE chatId = @chatId;
             DELETE FROM ChatNames WHERE chatId = @chatId;
             COMMIT;`,
            { chatId }
        );
    },

    async getChatHistory(chatId: string): Promise<Message[]> {
        try {
            const result = await azureQueryService.executeQuery<ChatRecord>(
                'GET_CHAT_HISTORY',
                `SELECT c.convoId, c.convoContent as content, c.convoPerson as person, 
                        c.convoTimestamp as timestamp
                 FROM Conversations c
                 JOIN ChatNamesConversations cnc ON c.convoId = cnc.convoId
                 WHERE cnc.chatId = @chatId
                 ORDER BY c.convoTimestamp ASC`,
                { chatId }
            );

            if (!result?.data?.recordset) {
                return [];
            }

            return result.data.recordset.map(conv => ({
                id: conv.convoId,
                content: conv.content,
                sender: conv.person,
                timestamp: new Date(conv.timestamp)
            }));
        } catch (error) {
            console.error('Failed to get chat history:', error);
            return [];
        }
    },

    formatMessagesForAI(messages: ChatMessage[]): OpenAIMessage[] {
        return messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));
    }
};
