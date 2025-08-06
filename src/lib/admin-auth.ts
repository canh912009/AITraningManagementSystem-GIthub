'use client'

import {useCallback, useEffect, useState} from 'react'
import { useRouter } from 'next/navigation'

interface AdminUser {
    id: number
    phone: string
    isAdmin: boolean
}

export function useAdminAuth() {
    const [user, setUser] = useState<AdminUser | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const checkAuth = useCallback(async () => {
        try {
            const token = localStorage.getItem('adminToken')
            const userStr = localStorage.getItem('adminUser')

            if (!token || !userStr) {
                router.replace('/login')
                return
            }

            const user = JSON.parse(userStr)

            if (!user.isAdmin) {
                localStorage.removeItem('adminToken')
                localStorage.removeItem('adminUser')
                router.replace('/login')
                return
            }

            setUser(user)
        } catch (error) {
            localStorage.removeItem('adminToken')
            localStorage.removeItem('adminUser')
            router.replace('/login')
        } finally {
            setLoading(false)
        }
    }, []);

    useEffect(() => {
        checkAuth()
    }, [checkAuth])

    const logout = () => {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        router.replace('/login')
    }

    return { user, loading, logout }
}