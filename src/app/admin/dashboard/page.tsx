'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Users,
    FileAudio,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp
} from 'lucide-react'
import { DashboardStats } from '@/types'

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardStats()
    }, [])

    const fetchDashboardStats = async () => {
        try {
            const response = await fetch('/api/admin/dashboard', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            })
            const data = await response.json()

            if (data.success) {
                setStats(data.data)
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <div className="text-sm text-gray-500">
                    Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Người dùng đã đăng ký
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng file</CardTitle>
                        <FileAudio className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalFiles || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            File đã upload
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upload hôm nay</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.todayUploads || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            File mới trong ngày
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Training Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {stats?.pendingFiles || 0}
                        </div>
                        <Badge variant="pending" className="mt-2">
                            Pending
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {stats?.approvedFiles || 0}
                        </div>
                        <Badge variant="success" className="mt-2">
                            Approved
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Từ chối</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {stats?.rejectedFiles || 0}
                        </div>
                        <Badge variant="destructive" className="mt-2">
                            Rejected
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Thao tác nhanh</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-yellow-500" />
                                <span className="font-medium">Duyệt file chờ</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {stats?.pendingFiles || 0} file đang chờ
                            </p>
                        </div>

                        <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center space-x-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                <span className="font-medium">Quản lý users</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {stats?.totalUsers || 0} người dùng
                            </p>
                        </div>

                        <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center space-x-2">
                                <FileAudio className="h-5 w-5 text-purple-500" />
                                <span className="font-medium">Xuất dữ liệu</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {stats?.approvedFiles || 0} file approved
                            </p>
                        </div>

                        <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                                <span className="font-medium">Báo cáo</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Xem chi tiết
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}