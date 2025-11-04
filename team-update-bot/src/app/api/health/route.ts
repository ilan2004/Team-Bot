import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'team-update-bot'
    },
    { status: 200 }
  );
}
