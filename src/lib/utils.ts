import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import path from "path"
import { mkdir } from "fs/promises"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function generateFileName(originalName: string, userId: number): string {
    const timestamp = Date.now()
    const extension = path.extname(originalName)
    const baseName = path.basename(originalName, extension)
    return `${userId}_${timestamp}_${baseName}${extension}`
}

export async function ensureUploadDir(uploadPath: string) {
    try {
        await mkdir(uploadPath, { recursive: true })
    } catch (error) {
        console.error('Error creating upload directory:', error)
    }
}

export function validateAudioFile(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = [
        'audio/mpeg',
        'audio/wav',
        'audio/wave',
        'audio/x-wav',
        'audio/mp3',
        'audio/mp4',
        'audio/aac',
        'audio/ogg',
        'audio/webm'
    ]

    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            error: 'File type not supported. Please upload audio files only.'
        }
    }

    if (file.size > maxSize) {
        return {
            isValid: false,
            error: 'File size too large. Maximum size is 10MB.'
        }
    }

    return { isValid: true }
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDate(date: Date | string): string {
    // Convert string to Date if needed
    const dateObj = typeof date === 'string' ? new Date(date) : date

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
        return 'Invalid Date'
    }

    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(dateObj)
}

export function formatDateShort(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    if (isNaN(dateObj.getTime())) {
        return 'Invalid Date'
    }

    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(dateObj)
}

export function formatTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    if (isNaN(dateObj.getTime())) {
        return 'Invalid Time'
    }

    return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(dateObj)
}

export function formatRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    if (isNaN(dateObj.getTime())) {
        return 'Invalid Date'
    }

    const now = new Date()
    const diffMs = now.getTime() - dateObj.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) {
        return 'Vừa xong'
    } else if (diffMins < 60) {
        return `${diffMins} phút trước`
    } else if (diffHours < 24) {
        return `${diffHours} giờ trước`
    } else if (diffDays < 7) {
        return `${diffDays} ngày trước`
    } else {
        return formatDateShort(dateObj)
    }
}

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    
    if (file.size > maxSize) {
        return { isValid: false, error: 'File ảnh không được vượt quá 5MB' }
    }
    
    if (!allowedTypes.includes(file.type)) {
        return { isValid: false, error: 'Chỉ hỗ trợ file ảnh định dạng JPG, PNG, WEBP' }
    }
    
    return { isValid: true }
}
