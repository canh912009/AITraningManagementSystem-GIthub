export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken, createApiResponse } from '@/lib/auth'
import {CommonFilter, Gender, Region, TrainingStatus} from "@/types";

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromToken(request)

        if (!user || !user.isAdmin) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Unauthorized'),
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''

        const rawGender = searchParams.get('gender')
        const gender = rawGender && rawGender !== CommonFilter.ALL ? (rawGender as Gender) : null

        const rawRegion = searchParams.get('region')
        const region = rawRegion && rawRegion !== CommonFilter.ALL ? (rawRegion as Region) : null

        const skip = (page - 1) * limit

        const where = {
            ...(search && {
                OR: [
                    {
                        phone: {
                            contains: search,
                        },
                    },
                    {
                        name: {
                            contains: search,
                        },
                    },
                ],
            }),
            ...(gender && { gender }),
            ...(region && { region }),
        }

        const [users, total] = await Promise.all([
            db.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
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
                },
            }),
            db.user.count({ where }),
        ])

        const totalPages = Math.ceil(total / limit)

        return NextResponse.json(
            createApiResponse(true, {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            }, 'Lấy danh sách người dùng thành công'),
            { status: 200 }
        )

    } catch (error) {
        console.error('Get users error:', error)
        return NextResponse.json(
            createApiResponse(false, null, null, 'Lỗi hệ thống'),
            { status: 500 }
        )
    }
}