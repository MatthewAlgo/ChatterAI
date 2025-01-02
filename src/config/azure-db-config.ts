import sql from 'mssql';

export const sqlConfig = {
  user: process.env.AZURE_DB_USER as string,
  password: process.env.AZURE_DB_PASSWORD as string,
  database: process.env.AZURE_DB_NAME as string,
  server: process.env.AZURE_DB_SERVER as string,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
} as const

// Funcție pentru a obține conexiunea
export async function getDbConnection() {
  try {
    // Validate configuration
    if (!process.env.AZURE_DB_USER || !process.env.AZURE_DB_PASSWORD || 
        !process.env.AZURE_DB_NAME || !process.env.AZURE_DB_SERVER) {
      throw new Error('Database configuration is incomplete. Please check environment variables.');
    }
    
    const pool = await sql.connect(sqlConfig);
    return pool;
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
}