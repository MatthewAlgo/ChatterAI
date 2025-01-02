import { azureQueryService } from './azure-query.service';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
    convoId: string;
    content: string;
    sender: 'user' | 'gpt';
    timestamp: Date;
}

export const chatService = {
    async createNewChat(userId: string): Promise<string> {
        const chatId = uuidv4();
        
        await azureQueryService.executeQuery(`
            BEGIN TRANSACTION;
            
            INSERT INTO ChatNames (chatId) 
            VALUES (@chatId);
            
            INSERT INTO UserChatNames (userId, chatId) 
            VALUES (@userId, @chatId);
            
            COMMIT;
        `, { chatId, userId });
        
        return chatId;
    },

    async saveMessage(chatId: string, content: string, sender: 'user' | 'gpt'): Promise<void> {
        const convoId = uuidv4();
        
        await azureQueryService.executeQuery(`
            BEGIN TRANSACTION;
            
            INSERT INTO Conversations (convoId, convoPerson, convoContent) 
            VALUES (@convoId, @sender, @content);
            
            INSERT INTO ChatNamesConversations (chatId, convoId) 
            VALUES (@chatId, @convoId);
            
            UPDATE ChatNames 
            SET updatedAt = GETUTCDATE()
            WHERE chatId = @chatId;
            
            COMMIT;
        `, {
            convoId,
            sender,
            content,
            chatId
        });
    },

    async updateChatName(chatId: string, newName: string): Promise<void> {
        await azureQueryService.executeQuery(`
            UPDATE ChatNames 
            SET chatName = @newName 
            WHERE chatId = @chatId
        `, { chatId, newName });
    },

    async getChatHistory(chatId: string): Promise<ChatMessage[]> {
        const result = await azureQueryService.executeQuery(`
            SELECT c.convoId, c.convoContent, c.convoPerson, c.convoTimestamp
            FROM Conversations c
            JOIN ChatNamesConversations cnc ON c.convoId = cnc.convoId
            WHERE cnc.chatId = @chatId
            ORDER BY c.convoTimestamp ASC
        `, { chatId });
        
        return result.recordset.map((record: any) => ({
            convoId: record.convoId,
            content: record.convoContent,
            sender: record.convoPerson,
            timestamp: new Date(record.convoTimestamp)
        }));
    }
};
