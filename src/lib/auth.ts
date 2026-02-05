import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me-in-prod';
const COOKIE_NAME = 'auth_token';

// Payload type
export interface JwtPayload {
  userId: string;
  email: string;
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(req: NextRequest | Request): Promise<JwtPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
  
    if (!token) return null;
  
    return verifyToken(token);
}

// Helper for API routes to enforce auth
export async function getAuthenticatedUser(req: NextRequest | Request): Promise<{ userId: string } | null> {
  const session = await getSession(req);
  if (!session) return null;
  return { userId: session.userId };
}
