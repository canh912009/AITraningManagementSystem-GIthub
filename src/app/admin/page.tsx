'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
    const router = useRouter()

    useEffect(() => {
        // Check if logged in
        const token = localStorage.getItem('adminToken')
        const userStr = localStorage.getItem('adminUser')

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr)
                if (user.isAdmin) {
                    router.replace('/admin/dashboard')
                    return
                }
            } catch (error) {
                console.error('Error parsing user:', error)
            }
        }

        // Redirect to login
        router.replace('/login')
    }, [router])

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    )
}