export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromToken, createApiResponse } from '@/lib/auth'
import {TrainingStatus} from "@/types";

export async function GET(request: NextRequest) {
    try {
        const admin = await getAdminFromToken(request)
        if (!admin) {
            return NextResponse.json(
                createApiResponse(false, null, null, 'Unauthorized'),
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get('days') || '7')

        // Calculate date range
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(endDate.getDate() - days)

        // Basic stats
        const [
            totalUsers,
            totalFiles,
            pendingFiles,
            approvedFiles,
            rejectedFiles,
            todayUploads
        ] = await Promise.all([
            // Total users
            db.user.count(),

            // Total files
            db.audioTrainingFile.count(),

            // Pending files
            db.audioTrainingFile.count({
                where: { trainingStatus: TrainingStatus.PENDING }
            }),

            // Approved files
            db.audioTrainingFile.count({
                where: { trainingStatus: TrainingStatus.APPROVED }
            }),

            // Rejected files
            db.audioTrainingFile.count({
                where: { trainingStatus: TrainingStatus.REJECTED }
            }),

            // Today's uploads
            db.audioTrainingFile.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            })
        ])

        // Weekly stats (last 7 days)
        const weeklyStats = []
        for (let i = 6; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dayStart = new Date(date.setHours(0, 0, 0, 0))
            const dayEnd = new Date(date.setHours(23, 59, 59, 999))

            const [uploads, approvals] = await Promise.all([
                db.audioTrainingFile.count({
                    where: {
                        createdAt: {
                            gte: dayStart,
                            lte: dayEnd
                        }
                    }
                }),
                db.audioTrainingFile.count({
                    where: {
                        trainingStatus: TrainingStatus.APPROVED,
                        updatedAt: {
                            gte: dayStart,
                            lte: dayEnd
                        }
                    }
                })
            ])

            const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
            weeklyStats.push({
                day: dayNames[dayStart.getDay()],
                uploads,
                approvals
            })
        }

        // Users by region
        const usersByRegion = await db.user.groupBy({
            by: ['region'],
            _count: {
                region: true
            }
        })

        const formattedUsersByRegion = usersByRegion.map((item: { region: any; _count: { region: any; }; }) => ({
            region: item.region || 'Không xác định',
            count: item._count.region
        }))

        // Files by status with percentages
        const filesByStatus = [
            {
                status: 'Chờ duyệt',
                count: pendingFiles,
                percentage: totalFiles > 0 ? Math.round((pendingFiles / totalFiles) * 100) : 0
            },
            {
                status: 'Đã duyệt',
                count: approvedFiles,
                percentage: totalFiles > 0 ? Math.round((approvedFiles / totalFiles) * 100) : 0
            },
            {
                status: 'Từ chối',
                count: rejectedFiles,
                percentage: totalFiles > 0 ? Math.round((rejectedFiles / totalFiles) * 100) : 0
            }
        ]

        // Monthly growth calculation
        const lastMonthStart = new Date()
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1)
        lastMonthStart.setDate(1)
        lastMonthStart.setHours(0, 0, 0, 0)

        const thisMonthStart = new Date()
        thisMonthStart.setDate(1)
        thisMonthStart.setHours(0, 0, 0, 0)

        const [lastMonthUsers, thisMonthUsers, lastMonthFiles, thisMonthFiles] = await Promise.all([
            db.user.count({
                where: {
                    createdAt: {
                        gte: lastMonthStart,
                        lt: thisMonthStart
                    }
                }
            }),
            db.user.count({
                where: {
                    createdAt: {
                        gte: thisMonthStart
                    }
                }
            }),
            db.audioTrainingFile.count({
                where: {
                    createdAt: {
                        gte: lastMonthStart,
                        lt: thisMonthStart
                    }
                }
            }),
            db.audioTrainingFile.count({
                where: {
                    createdAt: {
                        gte: thisMonthStart
                    }
                }
            })
        ])

        const userGrowth = lastMonthUsers > 0 ? Math.round(((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100) : 0
        const fileGrowth = lastMonthFiles > 0 ? Math.round(((thisMonthFiles - lastMonthFiles) / lastMonthFiles) * 100) : 0

        const analytics = {
            totalUsers,
            totalFiles,
            pendingFiles,
            approvedFiles,
            rejectedFiles,
            todayUploads,
            weeklyStats,
            usersByRegion: formattedUsersByRegion,
            filesByStatus,
            growth: {
                users: userGrowth,
                files: fileGrowth
            }
        }

        return NextResponse.json(
            createApiResponse(true, analytics, 'Lấy dữ liệu analytics thành công'),
            { status: 200 }
        )

    } catch (error) {
        console.error('Analytics error:', error)
        return NextResponse.json(
            createApiResponse(false, null, null, 'Lỗi hệ thống'),
            { status: 500 }
        )
    }
}