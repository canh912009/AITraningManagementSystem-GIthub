'use client'

import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { useAdminAuth } from '@/lib/admin-auth'

export function AdminHeader() {
    const { user, logout } = useAdminAuth()

    const handleLogout = () => {
        logout()
    }

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-bold text-gray-900">
                            AI Training Admin Panel
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span>{user?.phone || 'Admin'}</span>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Đăng xuất
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}