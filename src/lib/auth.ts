import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from './mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
}

export const ROLES = {
    SUPER_ADMIN: 'SuperAdmin',
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    SPONSOR_ADMIN: 'SponsorAdmin',
    SPONSOR: 'Sponsor',
    DELEGATE: 'Delegate',
    PARTICIPANT: 'Participant',
    AUDIENCE: 'Audience'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export interface AuthUser {
    _id: string;
    email: string;
    name: string;
    role: string;
}

/**
 * Generate JWT token for a user
 */
export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        return decoded;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

/**
 * Extract token from Authorization header or cookies
 */
export function extractToken(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') return parts[1];
    }

    // Fallback to cookie
    const token = request.cookies.get('token')?.value;
    return token || null;
}

/**
 * Get current user from request (Middleware/API Routes)
 */
export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
    try {
        const token = extractToken(request);
        if (!token) return null;

        const payload = verifyToken(token);
        if (!payload) return null;

        await dbConnect();
        const user = await User.findById(payload.userId).select('-password').lean();

        if (!user) return null;

        return {
            _id: (user as any)._id.toString(),
            email: (user as any).email,
            name: (user as any).name,
            role: (user as any).role
        };
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

/**
 * Get current user in Server Components
 */
export async function getServerUser(): Promise<AuthUser | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) return null;

        const payload = verifyToken(token);
        if (!payload) return null;

        await dbConnect();
        const user = await User.findById(payload.userId).select('-password').lean();

        if (!user) return null;

        return {
            _id: (user as any)._id.toString(),
            email: (user as any).email,
            name: (user as any).name,
            role: (user as any).role
        };
    } catch (error) {
        console.error('Error getting server user:', error);
        return null;
    }
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthUser | null, allowedRoles: string[]): boolean {
    if (!user) return false;
    return allowedRoles.includes(user.role);
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(
    request: NextRequest,
    allowedRoles?: string[]
): Promise<{ user: AuthUser } | NextResponse> {
    const user = await getCurrentUser(request);

    if (!user) {
        return NextResponse.json(
            { error: 'Unauthorized. Please login.' },
            { status: 401 }
        );
    }

    if (allowedRoles && !hasRole(user, allowedRoles)) {
        console.log(`[Auth] 403 Forbidden. User: ${user.email}, Role: ${user.role}, Required: ${allowedRoles.join(', ')}`);
        return NextResponse.json(
            { error: 'Forbidden. You do not have permission to access this resource.' },
            { status: 403 }
        );
    }

    return { user };
}

/**
 * Higher-order function to protect API routes
 */
export function withAuth(
    handler: (request: NextRequest, context: { user: AuthUser; params?: any }) => Promise<NextResponse>,
    allowedRoles?: string[]
) {
    return async (request: NextRequest, context?: { params?: any }) => {
        const authResult = await requireAuth(request, allowedRoles);

        if (authResult instanceof NextResponse) {
            return authResult; // Return error response
        }

        // Call the actual handler with authenticated user
        return handler(request, { user: authResult.user, params: context?.params });
    };
}
