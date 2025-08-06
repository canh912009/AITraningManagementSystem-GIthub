import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken, createApiResponse } from '@/lib/auth'
import { UpdateProfileRequest } from '@/types'

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromToken(request)

        if (!user) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Unauthorized'),
                { status: 401 }
            )
        }

        return NextResponse.json(
            createApiResponse(true, user, 'Lấy thông tin thành công'),
            { status: 200 }
        )

    } catch (error) {
        console.error('Get profile error:', error)
        return NextResponse.json(
            createApiResponse(false, null, null, 'Lỗi hệ thống'),
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getUserFromToken(request)

        if (!user) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Unauthorized'),
                { status: 401 }
            )
        }

        const body: UpdateProfileRequest = await request.json()
        const { age, gender, region } = body

        // Update user profile
        const updatedUser = await db.user.update({
            where: { id: user.id },
            data: {
                ...(age && { age }),
                ...(gender && { gender }),
                ...(region && { region }),
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
            createApiResponse(true, updatedUser, 'Cập nhật thông tin thành công'),
            { status: 200 }
        )

    } catch (error) {
        console.error('Update profile error:', error)
        return NextResponse.json(
            createApiResponse(false, null, null, 'Lỗi hệ thống'),
            { status: 500 }
        )
    }
}