'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Settings,
    Database,
    Shield,
    Bell,
    FileText,
    Upload,
    Download,
    Trash2
} from 'lucide-react'

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        maxFileSize: '10',
        allowedFileTypes: 'mp3,wav,m4a,aac',
        autoApproveFiles: false,
        emailNotifications: true,
        backupEnabled: true,
        retentionDays: '365'
    })

    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setSaving(false)
        alert('Cài đặt đã được lưu')
    }

    const handleBackup = async () => {
        alert('Đang tạo backup... (Tính năng đang phát triển)')
    }

    const handleClearLogs = async () => {
        if (confirm('Bạn có chắc muốn xóa tất cả logs?')) {
            alert('Logs đã được xóa')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
                <Badge variant="outline">Admin Only</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* File Upload Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Upload className="w-5 h-5" />
                            <span>Cài đặt Upload</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="maxFileSize">Kích thước file tối đa (MB)</Label>
                            <Input
                                id="maxFileSize"
                                type="number"
                                value={settings.maxFileSize}
                                onChange={(e) => setSettings({...settings, maxFileSize: e.target.value})}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="allowedTypes">Định dạng file cho phép</Label>
                            <Input
                                id="allowedTypes"
                                value={settings.allowedFileTypes}
                                onChange={(e) => setSettings({...settings, allowedFileTypes: e.target.value})}
                                placeholder="mp3,wav,m4a,aac"
                                className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">Phân cách bằng dấu phẩy</p>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="autoApprove"
                                checked={settings.autoApproveFiles}
                                onChange={(e) => setSettings({...settings, autoApproveFiles: e.target.checked})}
                                className="rounded"
                            />
                            <Label htmlFor="autoApprove">Tự động duyệt file upload</Label>
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Bell className="w-5 h-5" />
                            <span>Thông báo</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="emailNotifications"
                                checked={settings.emailNotifications}
                                onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                                className="rounded"
                            />
                            <Label htmlFor="emailNotifications">Gửi email thông báo</Label>
                        </div>

                        <div>
                            <Label>Thông báo khi:</Label>
                            <div className="mt-2 space-y-2">
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" defaultChecked className="rounded" />
                                    <span className="text-sm">Có file mới upload</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" defaultChecked className="rounded" />
                                    <span className="text-sm">Có người dùng mới đăng ký</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" className="rounded" />
                                    <span className="text-sm">Hệ thống có lỗi</span>
                                </label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Database Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Database className="w-5 h-5" />
                            <span>Cài đặt Database</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="backupEnabled"
                                checked={settings.backupEnabled}
                                onChange={(e) => setSettings({...settings, backupEnabled: e.target.checked})}
                                className="rounded"
                            />
                            <Label htmlFor="backupEnabled">Tự động backup hàng ngày</Label>
                        </div>

                        <div>
                            <Label htmlFor="retentionDays">Thời gian lưu trữ data (ngày)</Label>
                            <Input
                                id="retentionDays"
                                type="number"
                                value={settings.retentionDays}
                                onChange={(e) => setSettings({...settings, retentionDays: e.target.value})}
                                className="mt-1"
                            />
                        </div>

                        <div className="flex space-x-2">
                            <Button variant="outline" onClick={handleBackup} className="flex-1">
                                <Download className="w-4 h-4 mr-2" />
                                Tạo Backup
                            </Button>
                            <Button variant="outline" onClick={handleClearLogs} className="flex-1">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa Logs
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Shield className="w-5 h-5" />
                            <span>Bảo mật</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Session timeout (phút)</Label>
                            <Input
                                type="number"
                                defaultValue="120"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label>Số lần đăng nhập sai tối đa</Label>
                            <Input
                                type="number"
                                defaultValue="5"
                                className="mt-1"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <Label>Bắt buộc mật khẩu mạnh</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <Label>Bật 2FA cho admin</Label>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* System Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>Thông tin hệ thống</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                            <h4 className="font-medium">Phiên bản</h4>
                            <p className="text-lg font-bold text-blue-600">v1.0.0</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <h4 className="font-medium">Database</h4>
                            <p className="text-lg font-bold text-green-600">MariaDB 11.2</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <h4 className="font-medium">Uptime</h4>
                            <p className="text-lg font-bold text-purple-600">2d 14h</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <h4 className="font-medium">Storage</h4>
                            <p className="text-lg font-bold text-orange-600">2.1 GB</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} size="lg">
                    <Settings className="w-4 h-4 mr-2" />
                    {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
                </Button>
            </div>
        </div>
    )
}