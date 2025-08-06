'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Calendar,
    Users,
    FileAudio,
    Clock,
    CheckCircle,
    XCircle,
    Download
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface AnalyticsData {
    totalUsers: number
    totalFiles: number
    pendingFiles: number
    approvedFiles: number
    rejectedFiles: number
    todayUploads: number
    weeklyStats: {
        day: string
        uploads: number
        approvals: number
    }[]
    usersByRegion: {
        region: string
        count: number
    }[]
    filesByStatus: {
        status: string
        count: number
        percentage: number
    }[]
    growth: {
        users: number
        files: number
    }
}

export default function AdminAnalyticsPage() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState('7') // 7 days
    const { addToast } = useToast()

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true)

            const response = await fetch(`/api/admin/analytics?days=${dateRange}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            })

            const data = await response.json()

            if (data.success) {
                setAnalytics(data.data)
            } else {
                addToast({
                    title: 'Lỗi',
                    description: 'Không thể tải dữ liệu analytics',
                    variant: 'destructive'
                })
            }
        } catch (error) {
            console.error('Error fetching analytics:', error)
            addToast({
                title: 'Lỗi',
                description: 'Có lỗi xảy ra khi tải dữ liệu',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }, [dateRange]);

    useEffect(() => {
        fetchAnalytics()
    }, [fetchAnalytics])

    const exportData = async (type: string) => {
        try {
            addToast({
                title: 'Thông báo',
                description: `Tính năng xuất ${type} đang được phát triển`,
                variant: 'default'
            })
        } catch (error) {
            console.error('Export error:', error)
        }
    }

    const getGrowthIcon = (growth: number) => {
        if (growth > 0) {
            return <TrendingUp className="inline w-3 h-3 mr-1 text-green-500" />
        } else if (growth < 0) {
            return <TrendingDown className="inline w-3 h-3 mr-1 text-red-500" />
        }
        return null
    }

    const getGrowthText = (growth: number) => {
        if (growth > 0) {
            return `+${growth}% so với tháng trước`
        } else if (growth < 0) {
            return `${growth}% so với tháng trước`
        }
        return 'Không thay đổi so với tháng trước'
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
                <h1 className="text-2xl font-bold text-gray-900">Thống kê & Phân tích</h1>
                <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1 text-sm"
                    >
                        <option value="7">7 ngày qua</option>
                        <option value="30">30 ngày qua</option>
                        <option value="90">3 tháng qua</option>
                    </select>
                    <Button
                        onClick={fetchAnalytics}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                    >
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {getGrowthIcon(analytics?.growth.users || 0)}
                            {getGrowthText(analytics?.growth.users || 0)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng file</CardTitle>
                        <FileAudio className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.totalFiles || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {getGrowthIcon(analytics?.growth.files || 0)}
                            {getGrowthText(analytics?.growth.files || 0)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tỷ lệ duyệt</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {analytics?.totalFiles ? Math.round((analytics.approvedFiles / analytics.totalFiles) * 100) : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {analytics?.approvedFiles || 0} / {analytics?.totalFiles || 0} file
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upload hôm nay</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.todayUploads || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            File mới trong ngày
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Upload Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <BarChart3 className="w-5 h-5" />
                            <span>Xu hướng upload theo tuần</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analytics?.weeklyStats.map((stat, index) => {
                                const maxUploads = Math.max(...(analytics?.weeklyStats.map(s => s.uploads) || [1]))
                                return (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm font-medium w-16">{stat.day}</span>
                                        <div className="flex items-center space-x-2 flex-1">
                                            <div className="w-32 bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="bg-blue-500 h-3 rounded-full transition-all"
                                                    style={{ width: `${(stat.uploads / maxUploads) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm text-gray-600 w-8">{stat.uploads}</span>
                                            <span className="text-xs text-green-600">
                                                ({stat.approvals} duyệt)
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Files by Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Phân bố trạng thái file</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analytics?.filesByStatus.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        {item.status === 'Chờ duyệt' && <Clock className="w-4 h-4 text-yellow-500" />}
                                        {item.status === 'Đã duyệt' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                        {item.status === 'Từ chối' && <XCircle className="w-4 h-4 text-red-500" />}
                                        <span className="text-sm font-medium">{item.status}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all ${
                                                    item.status === 'Đã duyệt' ? 'bg-green-500' :
                                                        item.status === 'Chờ duyệt' ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                                style={{ width: `${item.percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-600 w-12 text-right">{item.count}</span>
                                        <span className="text-xs text-gray-400 w-8">({item.percentage}%)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Users by Region */}
            <Card>
                <CardHeader>
                    <CardTitle>Phân bố người dùng theo khu vực</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {analytics?.usersByRegion.map((region, index) => (
                            <div key={index} className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-semibold">{region.region}</h3>
                                <p className="text-2xl font-bold text-blue-600">{region.count}</p>
                                <p className="text-sm text-gray-500">người dùng</p>
                                <Badge variant="outline" className="mt-2">
                                    {Math.round((region.count / (analytics?.totalUsers || 1)) * 100)}%
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Báo cáo và xuất dữ liệu</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button
                            onClick={() => exportData('file đã duyệt')}
                            className="p-4 border rounded-lg hover:bg-gray-50 text-left transition-colors"
                        >
                            <FileAudio className="w-8 h-8 text-blue-500 mb-2" />
                            <h4 className="font-medium">Xuất file đã duyệt</h4>
                            <p className="text-sm text-gray-500">Tải về danh sách file training</p>
                        </button>

                        <button
                            onClick={() => exportData('người dùng')}
                            className="p-4 border rounded-lg hover:bg-gray-50 text-left transition-colors"
                        >
                            <Users className="w-8 h-8 text-green-500 mb-2" />
                            <h4 className="font-medium">Báo cáo người dùng</h4>
                            <p className="text-sm text-gray-500">Thống kê chi tiết người dùng</p>
                        </button>

                        <button
                            onClick={() => exportData('hiệu suất')}
                            className="p-4 border rounded-lg hover:bg-gray-50 text-left transition-colors"
                        >
                            <BarChart3 className="w-8 h-8 text-purple-500 mb-2" />
                            <h4 className="font-medium">Báo cáo hiệu suất</h4>
                            <p className="text-sm text-gray-500">Phân tích xu hướng upload</p>
                        </button>

                        <button
                            onClick={() => exportData('hàng tháng')}
                            className="p-4 border rounded-lg hover:bg-gray-50 text-left transition-colors"
                        >
                            <Calendar className="w-8 h-8 text-orange-500 mb-2" />
                            <h4 className="font-medium">Báo cáo hàng tháng</h4>
                            <p className="text-sm text-gray-500">Tổng hợp dữ liệu tháng</p>
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}