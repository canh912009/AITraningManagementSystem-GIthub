import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminNotFound() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-8">Trang admin không tồn tại</p>
                <Button asChild>
                    <Link href="/admin/dashboard">Quay về Dashboard</Link>
                </Button>
            </div>
        </div>
    )
}