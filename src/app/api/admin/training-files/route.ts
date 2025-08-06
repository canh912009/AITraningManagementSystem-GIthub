export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken, createApiResponse } from '@/lib/auth'
import {CommonFilter, TrainingStatus} from '@/types'

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromToken(request)

        if (!user || !user.isAdmin) {
            return NextResponse.json(
                createApiResponse(false, undefined, undefined, 'Unauthorized'),
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const rawStatus = searchParams.get('status')
        const status = rawStatus && rawStatus !== CommonFilter.ALL ? (rawStatus as TrainingStatus) : null
        const userId = searchParams.get('userId') ? parseInt(searchParams.get('userId')!) : null
        const phoneSearch = searchParams.get('phone') || null

        const skip = (page - 1) * limit

        const where = {
            ...(status && { trainingStatus: status }),
            ...(userId && { userId }),
            ...(phoneSearch && {
                user: {
                    phone: {
                        contains: phoneSearch
                    }
                }
            }),
        }

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
                            name: true,
                            age: true,
                            gender: true,
                            region: true,
                        },
                    },
                },
            }),
            db.audioTrainingFile.count({ where }),
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
                },
            }, 'Lấy danh sách file training thành công'),
            { status: 200 }
        )

    } catch (error) {
        console.error('Get training files error:', error)
        return NextResponse.json(
            createApiResponse(false, undefined, undefined, 'Lỗi hệ thống'),
            { status: 500 }
         )
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await getUserFromToken(request)

        if (!user || !user.isAdmin) {
            return NextResponse.json(
                createApiResponse(false, undefined, undefined, 'Unauthorized'),
                { status: 401 }
            )
        }

        const { fileIds, status, rejectionReason } = await request.json()

        if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
            return NextResponse.json(
                createApiResponse(false, undefined, undefined, 'Danh sách file ID không hợp lệ'),
                { status: 400 }
            )
        }

        if (!Object.values(TrainingStatus).includes(status as TrainingStatus)) {
            return NextResponse.json(
                createApiResponse(false, undefined, undefined, 'Trạng thái không hợp lệ'),
                { status: 400 }
            )
        }

        // Validate rejection reason if status is REJECTED
        if (status === TrainingStatus.REJECTED && !rejectionReason?.trim()) {
            return NextResponse.json(
                createApiResponse(false, undefined, undefined, 'Lý do từ chối là bắt buộc'),
                { status: 400 }
            )
        }

        const updatedFiles = await db.audioTrainingFile.updateMany({
            where: {
                id: {
                    in: fileIds,
                },
            },
            data: {
                trainingStatus: status as TrainingStatus,
                ...(status === TrainingStatus.REJECTED && rejectionReason && {
                    rejectionReason: rejectionReason.trim()
                })
            },
        })

        return NextResponse.json(
            createApiResponse(true, updatedFiles, `Cập nhật trạng thái ${updatedFiles.count} file thành công`),
            { status: 200 }
        )

    } catch (error) {
        console.error('Update training files status error:', error)
        return NextResponse.json(
            createApiResponse(false, undefined, undefined, 'Lỗi hệ thống'),
            { status: 500 }
        )
    }
}
