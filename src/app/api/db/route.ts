import { NextResponse } from 'next/server';
import sql from 'mssql';

const config = {
    user: process.env.AZURE_DB_USER,
    password: process.env.AZURE_DB_PASSWORD,
    database: process.env.AZURE_DB_NAME,
    server: process.env.AZURE_DB_SERVER!,
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

export async function GET() {
    try {
        await sql.connect(config);
        return NextResponse.json({ status: 'connected' });
    } catch (error) {
        console.error('Database Connection Error:', error);
        return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { query, params } = await req.json();
        console.log('Executing query:', query);
        console.log('With params:', params);

        const pool = await sql.connect(config);
        const request = new sql.Request(pool);

        // Add parameters if they exist
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                request.input(key, value);
            });
        }

        const result = await request.query(query);
        await pool.close();

        return NextResponse.json(result);
    } catch (error) {
        console.error('Database Query Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json(
            { error: 'Database query failed', details: errorMessage },
            { status: 500 }
        );
    }
}
