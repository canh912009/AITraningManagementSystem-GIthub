'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Users,
    FileAudio,
    Settings,
    BarChart3
} from 'lucide-react'

const sidebarItems = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Người dùng',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'File Training',
        href: '/admin/training',
        icon: FileAudio,
    },
    {
        title: 'Thống kê',
        href: '/admin/analytics',
        icon: BarChart3,
    },
    {
        title: 'Cài đặt',
        href: '/admin/settings',
        icon: Settings,
    },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <div className="w-64 bg-white shadow-sm border-r min-h-screen">
            <div className="p-6">
                <nav className="space-y-2">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.title}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </div>
    )
}