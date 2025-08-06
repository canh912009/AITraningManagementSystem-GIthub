export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateToken, createApiResponse } from '@/lib/auth'

interface LoginUserRequest {
    phone: string
    age?: number
    gender?: string
    region?: string
}

export async function POST(request: NextRequest) {
    try {
        const body: LoginUserRequest = await request.json()
        const { phone, age, gender, region } = body

        // Validation
        if (!phone) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Số điện thoại là bắt buộc'),
                { status: 400 }
            )
        }

        // Find user with matching criteria
        const whereCondition: any = { phone }

        // Add optional filters if provided
        if (age !== undefined) whereCondition.age = age
        if (gender) whereCondition.gender = gender  
        if (region) whereCondition.region = region

        const user = await db.user.findUnique({
            where: whereCondition
        })

        if (!user) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Thông tin người dùng không khớp'),
                { status: 401 }
            )
        }

        // Remove the update logic since we're now matching exact data
        // Generate token directly with found user
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
        console.error('LoginUser error:', error)
        return NextResponse.json(
            createApiResponse(false, null, null, 'Lỗi hệ thống'),
            { status: 500 }
        )
    }
}