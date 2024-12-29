import { NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/azure-db-config';

export async function GET() {
  try {
    await sql.connect(sqlConfig);
    return NextResponse.json({ status: 'connected' });
  } catch (error) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { query, params } = await request.json();
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request()
      .query(query);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Query execution failed' }, { status: 500 });
  }
}
