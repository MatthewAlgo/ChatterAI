import sql from 'mssql';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

// Validate environment variables first
if (!process.env.AZURE_DB_USER || 
    !process.env.AZURE_DB_PASSWORD || 
    !process.env.AZURE_DB_NAME || 
    !process.env.AZURE_DB_SERVER) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const sqlConfig = {
  user: process.env.AZURE_DB_USER,
  password: process.env.AZURE_DB_PASSWORD,
  database: process.env.AZURE_DB_NAME,
  server: process.env.AZURE_DB_SERVER,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

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

async function initializeDatabase() {
  let pool = null;
  try {
    console.log('Connecting to database...');
    pool = await new sql.ConnectionPool(sqlConfig).connect();
    
    console.log('Initializing database tables...');
    await pool.request().query(createTablesQuery);
    
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
    }
    process.exit(0);
  }
}

// Immediately invoke the function
initializeDatabase().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
