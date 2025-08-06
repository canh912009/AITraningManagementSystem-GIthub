export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken, createApiResponse } from '@/lib/auth'
import {TrainingStatus} from "@/types";

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromToken(request)

        if (!user || !user.isAdmin) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Unauthorized'),
                { status: 401 }
            )
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const [
            totalUsers,
            totalFiles,
            pendingFiles,
            approvedFiles,
            rejectedFiles,
            todayUploads,
        ] = await Promise.all([
            db.user.count(),
            db.audioTrainingFile.count(),
            db.audioTrainingFile.count({ where: { trainingStatus: TrainingStatus.PENDING } }),
            db.audioTrainingFile.count({ where: { trainingStatus: TrainingStatus.APPROVED } }),
            db.audioTrainingFile.count({ where: { trainingStatus: TrainingStatus.REJECTED } }),
            db.audioTrainingFile.count({
                where: {
                    createdAt: {
                        gte: today,
                    },
                },
            }),
        ])

        const stats = {
            totalUsers,
            totalFiles,
            pendingFiles,
            approvedFiles,
            rejectedFiles,
            todayUploads,
        }

        return NextResponse.json(
            createApiResponse(true, stats, 'Lấy thống kê thành công'),
            { status: 200 }
        )

    } catch (error) {
        console.error('Dashboard stats error:', error)
        return NextResponse.json(
            createApiResponse(false, null, null, 'Lỗi hệ thống'),
            { status: 500 }
        )
    }
}
