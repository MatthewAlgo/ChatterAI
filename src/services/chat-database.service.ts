import { v4 as uuidv4 } from 'uuid';
import { azureQueryService, QueryParams } from './azure-query.service';
import { ChatSession } from './types/chat.types';
import { authService } from './auth.service';

// Make sure to export ChatSession interface if used externally
export type { ChatSession };

export const chatDatabaseService = {
    async getUserChats(userId?: string): Promise<ChatSession[]> {
        const userHash = userId || authService.getUserHash();
        if (!userHash) {
            throw new Error('User not authenticated');
        }

        try {
            const result = await azureQueryService.executeQuery<ChatSession>(
                'GET_USER_CHATS',
                `SELECT cn.chatId, cn.chatName, cn.createdAt, cn.updatedAt,
                    (SELECT TOP 1 c.convoContent 
                     FROM Conversations c 
                     JOIN ChatNamesConversations cnc ON c.convoId = cnc.convoId 
                     WHERE cnc.chatId = cn.chatId 
                     ORDER BY c.convoTimestamp DESC) as lastMessage
                 FROM ChatNames cn
                 JOIN UserChatNames ucn ON cn.chatId = ucn.chatId
                 WHERE ucn.userId = @userId
                 ORDER BY cn.updatedAt DESC`,
                { userId: userHash }
            );

            return result?.data?.recordset?.map(record => ({
                chatId: record.chatId,
                chatName: record.chatName || 'Unnamed Chat',
                createdAt: new Date(record.createdAt),
                updatedAt: record.updatedAt ? new Date(record.updatedAt) : undefined,
                lastMessage: record.lastMessage || ''
            })) || [];
        } catch (error) {
            console.error('Error fetching chats:', error);
            return [];
        }
    },

    async updateChatName(chatId: string, newName: string): Promise<void> {
        await azureQueryService.executeQuery(
            'UPDATE_CHAT_NAME',
            'UPDATE ChatNames SET chatName = @newName WHERE chatId = @chatId',
            { chatId, newName }
        );
    },

    async createNewChat(userId: string, initialMessage?: string): Promise<string> {
        const chatId = uuidv4();
        const params: QueryParams = {
            chatId,
            userId,
            chatName: 'New Chat',
            convoId: initialMessage ? uuidv4() : undefined,
            initialMessage
        };

        await azureQueryService.executeQuery(
            'CREATE_NEW_CHAT',
            `BEGIN TRANSACTION;
             INSERT INTO ChatNames (chatId, chatName) VALUES (@chatId, @chatName);
             INSERT INTO UserChatNames (userId, chatId) VALUES (@userId, @chatId);
             ${initialMessage ? `
                INSERT INTO Conversations (convoId, convoPerson, convoContent)
                VALUES (@convoId, 'user', @initialMessage);
                INSERT INTO ChatNamesConversations (chatId, convoId)
                VALUES (@chatId, @convoId);
             ` : ''}
             COMMIT;`,
            params
        );
        
        return chatId; // Return the string directly instead of from params
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
    }
};
