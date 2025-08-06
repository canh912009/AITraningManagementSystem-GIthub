export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, generateToken, createApiResponse } from '@/lib/auth'
import { LoginRequest } from '@/types'

export async function POST(request: NextRequest) {
    try {
        const body: LoginRequest = await request.json()
        const { phone, password } = body

        // Validation
        if (!phone || !password) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Số điện thoại và mật khẩu là bắt buộc'),
                { status: 400 }
            )
        }

        // Find user
        const user = await db.user.findUnique({
            where: { phone }
        })

        if (!user) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Số điện thoại hoặc mật khẩu không đúng'),
                { status: 401 }
            )
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password)

        if (!isValidPassword) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Số điện thoại hoặc mật khẩu không đúng'),
                { status: 401 }
            )
        }

        // Generate token
        const token = generateToken({
            userId: user.id,
            phone: user.phone,
            isAdmin: user.isAdmin,
            age: user.age || undefined,
            gender: user.gender || undefined,
            region: user.region || undefined,
        })

        const userData = {
            id: user.id,
            phone: user.phone,
            isAdmin: user.isAdmin,
            age: user.age,
            gender: user.gender,
            region: user.region,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }

        return NextResponse.json(
            createApiResponse(true, { user: userData, token }, 'Đăng nhập thành công'),
            { status: 200 }
        )

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            createApiResponse(false, null, null, 'Lỗi hệ thống'),
            { status: 500 }
        )
    }
}
