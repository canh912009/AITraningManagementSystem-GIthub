export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromToken, createApiResponse } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const admin = await getAdminFromToken(request)

        if (!admin) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Unauthorized'),
                { status: 401 }
            )
        }

        const userId = parseInt(params.id)

        if (isNaN(userId)) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'ID người dùng không hợp lệ'),
                { status: 400 }
            )
        }

        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                phone: true,
                name: true,
                isAdmin: true,
                age: true,
                gender: true,
                region: true,
                userImageOrigin: true,
                userImageRecord: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        audioTrainingFiles: true
                    }
                }
            }
        })

        if (!user) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Không tìm thấy người dùng'),
                { status: 404 }
            )
        }

        return NextResponse.json(
            createApiResponse(true, user, 'Lấy thông tin người dùng thành công'),
            { status: 200 }
        )

    } catch (error) {
        console.error('Get user error:', error)
        return NextResponse.json(
            createApiResponse(false, null, null, 'Lỗi hệ thống'),
            { status: 500 }
        )
    }
}