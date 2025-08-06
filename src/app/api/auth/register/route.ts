export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, validatePhoneNumber, createApiResponse } from '@/lib/auth'
import { RegisterRequest } from '@/types'

export async function POST(request: NextRequest) {
    try {
        const body: RegisterRequest = await request.json()
        const { phone, password, age, gender, region } = body

        // Validation
        if (!phone || !password) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Số điện thoại và mật khẩu là bắt buộc'),
                { status: 400 }
            )
        }

        if (!validatePhoneNumber(phone)) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Số điện thoại không hợp lệ'),
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Mật khẩu phải có ít nhất 6 ký tự'),
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await db.user.findUnique({
            where: { phone }
        })

        if (existingUser) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Số điện thoại đã được sử dụng'),
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await hashPassword(password)

        // Create user
        const user = await db.user.create({
            data: {
                phone,
                password: hashedPassword,
                age,
                gender,
                region,
            },
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

        return NextResponse.json(
            createApiResponse(true, user, 'Đăng ký thành công'),
            { status: 201 }
        )

    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            createApiResponse(false, null, null, 'Lỗi hệ thống'),
            { status: 500 }
        )
    }
}
