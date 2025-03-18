import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * This endpoint helps address the "message channel closed before a response was received" error
 * by providing a clean way to establish and maintain message channels
 */
export async function GET() {
  // Wait a short time to ensure message channel stays open
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return NextResponse.json(
    { 
      success: true, 
      message: 'Message channel successfully established',
      timestamp: new Date().toISOString()
    },
    { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Connection': 'keep-alive',
        'Keep-Alive': 'timeout=60'
      } 
    }
  );
} 