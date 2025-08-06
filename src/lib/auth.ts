import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { db } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export interface JWTPayload {
    userId: number
    phone: string
    isAdmin: boolean
    age?: number
    gender?: string
    region?: string
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
        return null
    }
}

export async function getUserFromToken(request: NextRequest) {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
        return null
    }

    const payload = verifyToken(token)
    if (!payload) {
        return null
    }

    const user = await db.user.findUnique({
        where: { id: payload.userId },
        select: {
            id: true,
            phone: true,
            isAdmin: true,
            age: true,
            gender: true,
            region: true,
            createdAt: true,
            updatedAt: true,
        }
    })

    return user
}

export async function getAdminFromToken(request: NextRequest) {
    const user = await getUserFromToken(request)

    // Check if user exists and is admin
    if (!user || !user.isAdmin) {
        return null
    }

    return user
}

export function validatePhoneNumber(phone: string): boolean {
    // Vietnamese phone number validation
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/
    return phoneRegex.test(phone)
}

export function createApiResponse<T>(
    success: boolean,
    data?: T | null,
    message?: string | null,
    error?: string | null
) {
    return {
        success,
        data: data || null,
        message: message || null,
        error: error || null,
    }
}