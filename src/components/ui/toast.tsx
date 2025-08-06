// src/components/ui/toast.tsx
'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToastProps {
    id: string
    title?: string
    description?: string
    action?: React.ReactNode
    variant?: 'default' | 'destructive' | 'success' | 'approved' | 'rejected' | 'pending'
    onClose?: () => void
}

export function Toast({ id, title, description, action, variant = 'default', onClose }: ToastProps) {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onClose?.()
        }, 5000)

        return () => clearTimeout(timer)
    }, [onClose])

    return (
        <div
            className={cn(
                'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
                {
                    'border-gray-200 bg-white': variant === 'default',
                    'border-red-200 bg-red-50': variant === 'destructive',
                    'border-green-200 bg-green-50': variant === 'success',
                    'border-blue-200 bg-blue-50': variant === 'approved',
                    'border-orange-200 bg-orange-50': variant === 'rejected',
                    'border-yellow-200 bg-yellow-50': variant === 'pending',
                }
            )}
        >
            <div className="grid gap-1">
                {title && (
                    <div
                        className={cn('text-sm font-semibold', {
                            'text-gray-900': variant === 'default',
                            'text-red-900': variant === 'destructive',
                            'text-green-900': variant === 'success',
                            'text-blue-900': variant === 'approved',
                            'text-orange-900': variant === 'rejected',
                            'text-yellow-900': variant === 'pending',
                        })}
                    >
                        {title}
                    </div>
                )}
                {description && (
                    <div
                        className={cn('text-sm opacity-90', {
                            'text-gray-700': variant === 'default',
                            'text-red-700': variant === 'destructive',
                            'text-green-700': variant === 'success',
                            'text-blue-700': variant === 'approved',
                            'text-orange-700': variant === 'rejected',
                            'text-yellow-700': variant === 'pending',
                        })}
                    >
                        {description}
                    </div>
                )}
            </div>
            {action}
            <button
                onClick={onClose}
                className={cn(
                    'absolute right-2 top-2 rounded-md p-1 opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2',
                    {
                        'text-gray-500 focus:ring-gray-400': variant === 'default',
                        'text-red-500 focus:ring-red-400': variant === 'destructive',
                        'text-green-500 focus:ring-green-400': variant === 'success',
                        'text-blue-500 focus:ring-blue-400': variant === 'approved',
                        'text-orange-500 focus:ring-orange-400': variant === 'rejected',
                        'text-yellow-500 focus:ring-yellow-400': variant === 'pending',
                    }
                )}
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}

// Toast Context và Provider
type ToastData = Omit<ToastProps, 'id' | 'onClose'>

interface ToastContextValue {
    addToast: (data: ToastData) => void
    removeToast: (id: string) => void
    success: (title: string, description?: string) => void
    error: (title: string, description?: string) => void
    approved: (title: string, description?: string) => void
    rejected: (title: string, description?: string) => void
    pending: (title: string, description?: string) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<ToastProps[]>([])

    const addToast = React.useCallback((data: ToastData) => {
        const id = Date.now().toString()
        setToasts((prev) => [...prev, { ...data, id }])
    }, [])

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    // Helper methods for different toast types
    const success = React.useCallback((title: string, description?: string) => {
        addToast({ title, description, variant: 'success' })
    }, [addToast])

    const error = React.useCallback((title: string, description?: string) => {
        addToast({ title, description, variant: 'destructive' })
    }, [addToast])

    const approved = React.useCallback((title: string, description?: string) => {
        addToast({ title, description, variant: 'approved' })
    }, [addToast])

    const rejected = React.useCallback((title: string, description?: string) => {
        addToast({ title, description, variant: 'rejected' })
    }, [addToast])

    const pending = React.useCallback((title: string, description?: string) => {
        addToast({ title, description, variant: 'pending' })
    }, [addToast])

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, approved, rejected, pending }}>
            {children}
            <div className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col p-4 sm:top-0 sm:right-0 md:max-w-[420px]">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = React.useContext(ToastContext)
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}