import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Basic health check - you can add more sophisticated checks here
    // like database connectivity, external service checks, etc.
    return NextResponse.json(
      { 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'ai-customer-support'
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 500 }
    )
  }
} 