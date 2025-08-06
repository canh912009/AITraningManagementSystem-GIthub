'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react'
import { User, Gender, Region } from '@/types'
import { formatDate } from '@/lib/utils'

export default function AdminUserDetailPage() {
    const params = useParams()
    const router = useRouter()
    const userId = params.id as string

    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    // Thêm state để track thời điểm upload ảnh
    const [imageUpdateTime, setImageUpdateTime] = useState(Date.now())

    useEffect(() => {
        fetchUser()
    }, [userId])

    // Memoize image URL để tránh tạo mới mỗi lần render
    const imageUrl = useMemo(() => {
        if (!user?.userImageRecord) return null
        return `/api/uploads/${user.userImageRecord}?t=${imageUpdateTime}`
    }, [user?.userImageRecord, imageUpdateTime])

    const fetchUser = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/admin/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            })
            const data = await response.json()

            if (data.success) {
                setUser(data.data)
            } else {
                router.push('/admin/users')
            }
        } catch (error) {
            console.error('Error fetching user:', error)
            router.push('/admin/users')
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (file: File, imageType: 'user_image_origin' | 'user_image_record') => {
        if (!user) return

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('imageType', imageType)
            formData.append('userId', user.id.toString())

            const response = await fetch('/api/admin/upload-user-image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                const updatedImagePath = result.data.imagePath

                // Cập nhật user với ảnh mới
                setUser(prev => prev ? {
                    ...prev,
                    [imageType === 'user_image_origin' ? 'userImageOrigin' : 'userImageRecord']: updatedImagePath
                } : null)

                // Chỉ update timestamp khi upload thành công
                setImageUpdateTime(Date.now())
            } else {
                alert(result.error || 'Upload thất bại')
            }
        } catch (error) {
            console.error('Upload error:', error)
            alert('Lỗi upload ảnh')
        } finally {
            setUploading(false)
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!user) {
        return <div>Không tìm thấy người dùng</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => router.push('/admin/users')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">
                    Quản lý ảnh - {user.name || user.phone}
                </h1>
            </div>

            {/* Thông tin user */}
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin người dùng</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <span className="text-gray-500 text-sm">Số điện thoại:</span>
                            <p className="font-medium">{user.phone}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm">Tên:</span>
                            <p className="font-medium">{user.name || 'Chưa cập nhật'}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm">Tuổi:</span>
                            <div className="mt-1">{getAgeBadge(user.age)}</div>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm">Giới tính:</span>
                            <div className="mt-1">{getGenderBadge(user.gender)}</div>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm">Khu vực:</span>
                            <div className="mt-1">{getRegionBadge(user.region)}</div>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm">Số file:</span>
                            <div className="mt-1">
                                <Badge variant="outline">
                                    {(user as any)?._count?.audioTrainingFiles || 0}
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm">Ngày tạo:</span>
                            <p className="font-medium">{formatDate(user.createdAt)}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm">Quyền:</span>
                            <div className="mt-1">
                                {user.isAdmin ? (
                                    <Badge variant="destructive">Admin</Badge>
                                ) : (
                                    <Badge variant="secondary">User</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quản lý ảnh */}
            <div className="grid md:grid-cols-1 gap-6">
                {/* Ảnh ghi âm */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" />
                            Ảnh ghi âm
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {imageUrl ? (
                            <div className="flex justify-center">
                                <div className="relative max-w-md w-full">
                                    <img
                                        src={imageUrl}
                                        alt="Ảnh ghi âm"
                                        className="w-full h-auto max-h-96 object-contain rounded-lg border shadow-md"
                                        // Sử dụng key ổn định, chỉ thay đổi khi ảnh thực sự được upload
                                        key={`image-${user.userImageRecord}-${imageUpdateTime}`}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                                <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500">Chưa có ảnh ghi âm</p>
                            </div>
                        )}
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleImageUpload(file, 'user_image_record')
                                }}
                                className="hidden"
                                id="record-upload"
                                disabled={uploading}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}