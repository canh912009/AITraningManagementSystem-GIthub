// Enums
export enum CommonFilter {
    ALL = 'all',
}

export enum TrainingStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

export enum Gender {
    MALE = 'M',
    FEMALE = 'F',
    OTHER = 'O'
}

export enum Region {
    BAC = 'N',
    TRUNG = 'M',
    NAM = 'S'
}

// Interfaces
export interface User {
    id: number
    phone: string
    name?: string
    isAdmin: boolean
    age?: number
    gender?: Gender
    region?: Region
    userImageOrigin?: string
    userImageRecord?: string
    createdAt: Date
    updatedAt: Date
}

export interface AudioTrainingFile {
    id: number
    userId: number
    filePath: string
    contentVietnamese?: string
    contentKorean?: string
    trainingStatus: TrainingStatus
    rejectionReason?: string
    createdAt: Date
    updatedAt: Date
    user?: User
}

export interface ApiResponse<T = any> {
    success: boolean
    data: T | null
    message: string | null
    error: string | null
}

export interface LoginRequest {
    phone: string
    password: string
}

export interface RegisterRequest {
    phone: string
    password: string
    age?: number
    gender?: Gender
    region?: Region
}

export interface UpdateProfileRequest {
    age?: number
    gender?: Gender
    region?: Region
}

export interface UploadTrainingFileRequest {
    file: File
    contentVietnamese?: string
    contentKorean?: string
}

export interface DashboardStats {
    totalUsers: number
    totalFiles: number
    pendingFiles: number
    approvedFiles: number
    rejectedFiles: number
    todayUploads: number
}
