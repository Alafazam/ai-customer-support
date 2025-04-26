import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get configuration from environment variables with NEXT_PUBLIC_ prefix
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

    // Check if configuration exists
    if (!apiKey || !agentId) {
      console.error('Missing ElevenLabs configuration in .env.local');
      return NextResponse.json(
        { error: 'ElevenLabs configuration is not set up. Please check your .env.local file.' },
        { status: 500 }
      );
    }

    // Clean the agentId by removing URL encoding if present
    const cleanAgentId = decodeURIComponent(agentId);

    // Return the configuration
    return NextResponse.json({
      apiKey,
      agentId: cleanAgentId
    });
  } catch (error) {
    console.error('Error fetching ElevenLabs config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ElevenLabs configuration' },
      { status: 500 }
    );
  }
} 