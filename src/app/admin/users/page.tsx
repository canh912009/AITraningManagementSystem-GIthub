'use client'

import {useState, useEffect, useCallback} from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Search, Filter, Users, Download, Settings, Upload, Image as ImageIcon } from 'lucide-react'
import {User, Gender, Region, CommonFilter} from '@/types'
import { formatDate } from '@/lib/utils'

export default function AdminUsersPage() {
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [genderFilter, setGenderFilter] = useState(CommonFilter.ALL as string)
    const [regionFilter, setRegionFilter] = useState(CommonFilter.ALL as string)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [showImageDialog, setShowImageDialog] = useState(false)
    const [uploading, setUploading] = useState(false)

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(search && { search }),
                ...(genderFilter && { gender: genderFilter }),
                ...(regionFilter && { region: regionFilter }),
            })

            const response = await fetch(`/api/admin/users?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            })
            const data = await response.json()

            if (data.success) {
                setUsers(data.data.users)
                setTotalPages(data.data.pagination.totalPages)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }, [page, search, genderFilter, regionFilter]);

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        fetchUsers()
    }

    const clearFilters = () => {
        setSearch('')
        setGenderFilter(CommonFilter.ALL)
        setRegionFilter(CommonFilter.ALL)
        setPage(1)
    }

    const exportUsers = async () => {
        try {
            alert('Tính năng xuất dữ liệu đang được phát triển')
        } catch (error) {
            console.error('Export error:', error)
        }
    }

    const getGenderBadge = (gender?: Gender) => {
        switch (gender) {
            case Gender.MALE:
                return <Badge variant="secondary">Nam</Badge>
            case Gender.FEMALE:
                return <Badge variant="outline">Nữ</Badge>
            case Gender.OTHER:
                return <Badge variant="secondary">Khác</Badge>
            default:
                return <Badge variant="outline">Chưa xác định</Badge>
        }
    }

    const getRegionBadge = (region?: Region) => {
        switch (region) {
            case Region.BAC:
                return <Badge variant="default">Bắc</Badge>
            case Region.TRUNG:
                return <Badge variant="secondary">Trung</Badge>
            case Region.NAM:
                return <Badge variant="outline">Nam</Badge>
            default:
                return <Badge variant="outline">Chưa xác định</Badge>
        }
    }

    const getAgeBadge = (age?: number) => {
        if (!age && age !== 0) return <Badge variant="outline">N/A</Badge>
        
        switch (age) {
            case 0:
                return <Badge variant="secondary">0~10</Badge>
            case 1:
                return <Badge variant="secondary">11~20</Badge>
            case 2:
                return <Badge variant="default">21~40</Badge>
            case 4:
                return <Badge variant="secondary">41~60</Badge>
            case 6:
                return <Badge variant="outline">61~</Badge>
            default:
                return <Badge variant="outline">N/A</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
                <Button onClick={exportUsers} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Xuất dữ liệu
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Filter className="w-5 h-5" />
                        <span>Bộ lọc</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Tìm theo số điện thoại hoặc tên..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        <Select value={genderFilter} onValueChange={setGenderFilter}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Giới tính" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={CommonFilter.ALL}>Tất cả</SelectItem>
                                <SelectItem value={Gender.MALE}>Nam</SelectItem>
                                <SelectItem value={Gender.FEMALE}>Nữ</SelectItem>
                                <SelectItem value={Gender.OTHER}>Khác</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={regionFilter} onValueChange={setRegionFilter}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Khu vực" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={CommonFilter.ALL}>Tất cả</SelectItem>
                                <SelectItem value={Region.BAC}>Bắc</SelectItem>
                                <SelectItem value={Region.TRUNG}>Trung</SelectItem>
                                <SelectItem value={Region.NAM}>Nam</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button type="submit" disabled={loading}>
                            <Search className="w-4 h-4 mr-2" />
                            Tìm kiếm
                        </Button>

                        <Button type="button" variant="outline" onClick={clearFilters}>
                            Xóa bộ lọc
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>Danh sách người dùng</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Số điện thoại</TableHead>
                                        <TableHead>Tên</TableHead>
                                        <TableHead>Tuổi</TableHead>
                                        <TableHead>Giới tính</TableHead>
                                        <TableHead>Khu vực</TableHead>
                                        <TableHead>Số file</TableHead>
                                        <TableHead>Ngày tạo</TableHead>
                                        <TableHead>Quyền</TableHead>
                                        <TableHead>Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.id}</TableCell>
                                            <TableCell>{user.phone}</TableCell>
                                            <TableCell>{user.name || 'Chưa cập nhật'}</TableCell>
                                            <TableCell>{getAgeBadge(user.age)}</TableCell>
                                            <TableCell>{getGenderBadge(user.gender)}</TableCell>
                                            <TableCell>{getRegionBadge(user.region)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {(user as any)._count?.audioTrainingFiles || 0}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                                            <TableCell>
                                                {user.isAdmin ? (
                                                    <Badge variant="destructive">Admin</Badge>
                                                ) : (
                                                    <Badge variant="secondary">User</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => router.push(`/admin/users/${user.id}`)}
                                                >
                                                    <Settings className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-gray-500">
                                    Trang {page} / {totalPages}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                    >
                                        Trước
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === totalPages}
                                    >
                                        Sau
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
