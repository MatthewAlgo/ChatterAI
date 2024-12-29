import { NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/azure-db-config';

const createTablesQuery = `
-- Create UserChatNames table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserChatNames')
BEGIN
    CREATE TABLE UserChatNames (
        userId NVARCHAR(64) NOT NULL,
        chatId NVARCHAR(64) NOT NULL,
        createdAt DATETIME DEFAULT GETDATE(),
        PRIMARY KEY (userId, chatId)
    );
END;

-- Create ChatNames table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ChatNames')
BEGIN
    CREATE TABLE ChatNames (
        chatId NVARCHAR(64) PRIMARY KEY,
        chatName NVARCHAR(255) DEFAULT 'This chat does not have a name yet',
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE()
    );
END;

-- Create ChatNamesConversations table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ChatNamesConversations')
BEGIN
    CREATE TABLE ChatNamesConversations (
        chatId NVARCHAR(64),
        convoId NVARCHAR(64),
        createdAt DATETIME DEFAULT GETDATE(),
        PRIMARY KEY (chatId, convoId),
        FOREIGN KEY (chatId) REFERENCES ChatNames(chatId)
    );
END;

-- Create Conversations table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Conversations')
BEGIN
    CREATE TABLE Conversations (
        convoId NVARCHAR(64) PRIMARY KEY,
        convoPerson NVARCHAR(10) CHECK (convoPerson IN ('user', 'gpt')),
        convoContent NVARCHAR(MAX),
        convoTimestamp DATETIME DEFAULT GETDATE()
    );
END;
`;

export async function POST() {
    try {
        const pool = await sql.connect(sqlConfig);
        await pool.request().query(createTablesQuery);
        
        return NextResponse.json({ 
            status: 'success', 
            message: 'Database tables created successfully' 
        });
    } catch (error) {
        console.error('Failed to initialize database:', error);
        return NextResponse.json({ 
            status: 'error', 
            message: 'Failed to initialize database' 
        }, { status: 500 });
    }
}