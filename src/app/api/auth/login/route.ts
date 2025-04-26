import { NextResponse } from 'next/server';
import users from '@/data/users.json';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-omnisahayak-2024';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user in users.json
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
        client: user.client,
        clientId: user.clientId,
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return success response with token and user info
    const userCopy = { ...user } as Record<string, unknown>;
    delete userCopy.password;
    return NextResponse.json({
      token,
      user: userCopy,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 