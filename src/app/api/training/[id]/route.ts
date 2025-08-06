export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken, createApiResponse } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromToken(request)

        if (!user) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Unauthorized'),
                { status: 401 }
            )
        }

        const fileId = parseInt(params.id)

        if (isNaN(fileId)) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'ID file không hợp lệ'),
                { status: 400 }
            )
        }

        const file = await db.audioTrainingFile.findFirst({
            where: {
                id: fileId,
                userId: user.id, // Ensure user can only access their own files
            },
            include: {
                user: {
                    select: {
                        id: true,
                        phone: true,
                        age: true,
                        gender: true,
                        region: true,
                    }
                }
            }
        })

        if (!file) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'File không tồn tại'),
                { status: 404 }
            )
        }

        return NextResponse.json(
            createApiResponse(true, file, 'Lấy thông tin file thành công'),
            { status: 200 }
        )

    } catch (error) {
        console.error('Get training file error:', error)
        return NextResponse.json(
            createApiResponse(false, null, null, 'Lỗi hệ thống'),
            { status: 500 }
        )
    }
}