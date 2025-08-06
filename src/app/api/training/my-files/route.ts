export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken, createApiResponse } from '@/lib/auth'
import {TrainingStatus} from "@/types";

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromToken(request)

        if (!user) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Unauthorized'),
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const status = searchParams.get('status') as TrainingStatus | null

        const skip = (page - 1) * limit

        const where = {
            userId: user.id,
            ...(status && { trainingStatus: status })
        }

        // Get files with pagination
        const [files, total] = await Promise.all([
            db.audioTrainingFile.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
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
            }),
            db.audioTrainingFile.count({ where })
        ])

        const totalPages = Math.ceil(total / limit)

        return NextResponse.json(
            createApiResponse(true, {
                files,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                }
            }, 'Lấy danh sách file thành công'),
            { status: 200 }
        )

    } catch (error) {
        console.error('Get my files error:', error)
        return NextResponse.json(
            createApiResponse(false, null, null, 'Lỗi hệ thống'),
            { status: 500 }
        )
    }
}