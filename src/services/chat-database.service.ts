import { azureQueryService } from './azure-query.service';
import { v4 as uuidv4 } from 'uuid';

export interface ChatSession {
    chatId: string;
    chatName: string;
    createdAt: Date;
    lastMessage?: string;
}

export const chatDatabaseService = {
    async getUserChats(userId: string): Promise<ChatSession[]> {
        const result = await azureQueryService.executeQuery(`
            SELECT cn.chatId, cn.chatName, cn.createdAt, 
                   (SELECT TOP 1 c.convoContent 
                    FROM Conversations c 
                    JOIN ChatNamesConversations cnc ON c.convoId = cnc.convoId 
                    WHERE cnc.chatId = cn.chatId 
                    ORDER BY c.convoTimestamp DESC) as lastMessage
            FROM ChatNames cn
            JOIN UserChatNames ucn ON cn.chatId = ucn.chatId
            WHERE ucn.userId = '${userId}'
            ORDER BY cn.updatedAt DESC
        `);
        
        return result.recordset;
    },

    async createNewChat(userId: string, initialMessage?: string): Promise<string> {
        const chatId = uuidv4();
        const convoId = uuidv4();
        
        await azureQueryService.executeQuery(`
            BEGIN TRANSACTION;
            
            INSERT INTO ChatNames (chatId, chatName) 
            VALUES ('${chatId}', 'New Chat');
            
            INSERT INTO UserChatNames (userId, chatId) 
            VALUES ('${userId}', '${chatId}');
            
            ${initialMessage ? `
                INSERT INTO Conversations (convoId, convoPerson, convoContent)
                VALUES ('${convoId}', 'user', '${initialMessage}');
                
                INSERT INTO ChatNamesConversations (chatId, convoId)
                VALUES ('${chatId}', '${convoId}');
            ` : ''}
            
            COMMIT;
        `);
        
        return chatId;
    },

    async deleteChatHistory(chatId: string): Promise<void> {
        await azureQueryService.executeQuery(`
            BEGIN TRANSACTION;
            
            DELETE FROM ChatNamesConversations WHERE chatId = '${chatId}';
            DELETE FROM UserChatNames WHERE chatId = '${chatId}';
            DELETE FROM ChatNames WHERE chatId = '${chatId}';
            
            COMMIT;
        `);
    }
};
